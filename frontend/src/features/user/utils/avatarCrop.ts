/** 负责把头像裁剪区域导出成统一规格的上传文件。 */
import type { Area } from 'react-easy-crop'

const OUTPUT_SIZE = 512
const JPEG_QUALITY = 0.9

/**
 * @description 把图片地址加载成 HTMLImageElement（图片元素），供 Canvas（画布）裁剪使用。
 * @param src string，待加载的图片地址。
 * @returns Promise<HTMLImageElement>，加载完成后的图片对象。
 */
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('头像图片加载失败，请重新选择。'))
    image.src = src
  })
}

/**
 * @description 为裁剪后的头像生成稳定的 JPG 文件名。
 * @param fileName string，原始上传文件名。
 * @returns string，去掉旧扩展名后的 JPG 文件名。
 */
function buildOutputName(fileName: string) {
  const normalizedName = fileName.trim().replace(/\.[^.]+$/, '')
  const safeName = normalizedName || 'avatar'

  return `${safeName}.jpg`
}

/**
 * @description 按裁剪区域导出头像文件，并统一压缩为 512x512 的 JPEG（联合图像专家组格式）图片。
 * @param imageSrc string，待裁剪图片的预览地址。
 * @param cropArea Area，react-easy-crop（裁剪组件）返回的像素级裁剪区域。
 * @param fileName string，原始文件名，用于生成导出文件名。
 * @returns Promise<File>，可直接上传到后端的头像文件。
 * @example
 * ```ts
 * const file = await buildCroppedAvatarFile(imageSrc, cropArea, 'avatar.png')
 * ```
 */
export async function buildCroppedAvatarFile(imageSrc: string, cropArea: Area, fileName: string) {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('浏览器暂时不支持头像裁剪，请稍后再试。')
  }

  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  // 统一输出尺寸和格式，能减少后端处理分支，也能避免超大原图直接上传导致失败。
  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error('头像导出失败，请重新调整裁剪区域。'))
          return
        }

        resolve(nextBlob)
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  })

  return new File([blob], buildOutputName(fileName), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}
