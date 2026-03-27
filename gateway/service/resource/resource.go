package resource

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"github.com/nfnt/resize"
	"github.com/spf13/viper"

	"mono/gateway/response"
	"mono/pkg/initial"
)

type Service struct {
}

func NewService() *Service {
	return &Service{}
}

// 允许的图片扩展名
var allowedExts = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

// 最大文件大小 10MB
const maxFileSize = 10 << 20

// 压缩后最大宽度
const maxWidth = 800

func (s *Service) Avatar(c *gin.Context) {
	bucket := "avatar"
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(200, gin.H{"code": 1, "msg": "文件读取失败"})
		return
	}
	defer file.Close()

	// 1. 校验文件大小
	if header.Size > maxFileSize {
		c.JSON(200, gin.H{"code": 1, "msg": "文件不能超过10MB"})
		return
	}

	// 2. 校验扩展名
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExts[ext] {
		c.JSON(200, gin.H{"code": 1, "msg": "仅支持 jpg/jpeg/png/gif/webp 格式"})
		return
	}

	// 3. 校验真实文件类型（防止改扩展名）
	buf := make([]byte, 512)
	n, _ := file.Read(buf)
	contentType := http.DetectContentType(buf[:n])
	if !strings.HasPrefix(contentType, "image/") {
		c.JSON(200, gin.H{"code": 1, "msg": "文件内容不是图片"})
		return
	}
	// 读完头部后 seek 回起点
	file.Seek(0, 0)

	// 4. 压缩图片（gif 和 webp 不压缩，直接上传原文件）
	var uploadReader *bytes.Reader
	var uploadSize int64
	uploadExt := ext

	if ext == ".jpg" || ext == ".jpeg" || ext == ".png" {
		img, _, err := image.Decode(file)
		if err != nil {
			c.JSON(200, gin.H{"code": 2, "msg": "图片解码失败"})
			return
		}

		// 宽度超过 maxWidth 才缩放
		bounds := img.Bounds()
		if bounds.Dx() > maxWidth {
			img = resize.Resize(maxWidth, 0, img, resize.Lanczos3)
		}

		// 统一输出为 JPEG
		var compressed bytes.Buffer
		err = jpeg.Encode(&compressed, img, &jpeg.Options{Quality: 80})
		if err != nil {
			c.JSON(200, gin.H{"code": 2, "msg": "图片压缩失败"})
			return
		}

		uploadReader = bytes.NewReader(compressed.Bytes())
		uploadSize = int64(compressed.Len())
		uploadExt = ".jpg"
		contentType = "image/jpeg"
	} else {
		// gif/webp 不压缩，读取原始文件
		file.Seek(0, 0)
		var raw bytes.Buffer
		raw.ReadFrom(file)
		uploadReader = bytes.NewReader(raw.Bytes())
		uploadSize = int64(raw.Len())
	}

	// 5. 上传到 MinIO
	objectName := fmt.Sprintf("images/%d%s", time.Now().UnixNano(), uploadExt)
	_, err = initial.GetMinioClient().PutObject(c, bucket, objectName, uploadReader, uploadSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		c.JSON(200, gin.H{"code": 2, "msg": "上传失败"})
		return
	}

	url := fmt.Sprintf("%s/%s/%s", viper.GetString("minio.external_url"), bucket, objectName)
	response.Success(c, url)
}
