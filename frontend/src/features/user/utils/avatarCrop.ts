import type { Area } from 'react-easy-crop'

const OUTPUT_SIZE = 512
const JPEG_QUALITY = 0.9

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('头像图片加载失败，请重新选择。'))
    image.src = src
  })
}

function buildOutputName(fileName: string) {
  const normalizedName = fileName.trim().replace(/\.[^.]+$/, '')
  const safeName = normalizedName || 'avatar'

  return `${safeName}.jpg`
}

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
