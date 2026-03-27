import { useCallback, useMemo, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import type { ToastState } from '@/components/Toast'
import { buildCroppedAvatarFile } from '@/features/user/utils/avatarCrop'

interface AvatarCropModalProps {
  fileName: string
  imageSrc: string
  onCancel: () => void
  onConfirm: (file: File) => void
  onToast: (toast: ToastState) => void
}

const initialCrop: Point = { x: 0, y: 0 }

export function AvatarCropModal({
  fileName,
  imageSrc,
  onCancel,
  onConfirm,
  onToast,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState<Point>(initialCrop)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const zoomLabel = useMemo(() => `${zoom.toFixed(1)}x`, [zoom])

  const handleCropComplete = useCallback((_: Area, nextCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(nextCroppedAreaPixels)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) {
      onToast({ type: 'error', message: '请先调整头像裁剪区域。' })
      return
    }

    setSubmitting(true)

    try {
      const croppedFile = await buildCroppedAvatarFile(imageSrc, croppedAreaPixels, fileName)
      onConfirm(croppedFile)
    } catch (error) {
      onToast({
        type: 'error',
        message: error instanceof Error ? error.message : '头像裁剪失败，请稍后重试。',
      })
    } finally {
      setSubmitting(false)
    }
  }, [croppedAreaPixels, fileName, imageSrc, onConfirm, onToast])

  return (
    <div className="avatar-crop-overlay" role="presentation">
      <div
        aria-labelledby="avatar-crop-title"
        aria-modal="true"
        className="avatar-crop-modal"
        role="dialog"
      >
        <div className="avatar-crop-modal__header">
          <div>
            <span className="avatar-crop-modal__eyebrow">头像裁剪</span>
            <h3 id="avatar-crop-title">拖动和缩放头像，圆框内就是最终展示区域</h3>
          </div>
          <button
            className="forum-pill-button forum-pill-button--ghost"
            disabled={submitting}
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
        </div>

        <div className="avatar-crop-modal__body">
          <div className="avatar-crop-stage">
            <Cropper
              aspect={1}
              crop={crop}
              cropShape="round"
              image={imageSrc}
              objectFit="cover"
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              showGrid={false}
              zoom={zoom}
            />
          </div>

          <div className="avatar-crop-panel">
            <div className="avatar-crop-panel__meta">
              <strong>{fileName}</strong>
              <span>导出后会统一压缩成 512 x 512 的 JPEG 格式，减少上传失败概率。</span>
            </div>

            <label className="avatar-crop-slider" htmlFor="avatar-crop-zoom">
              <span>缩放</span>
              <div className="avatar-crop-slider__track">
                <input
                  id="avatar-crop-zoom"
                  max={3}
                  min={1}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  step={0.1}
                  type="range"
                  value={zoom}
                />
                <strong>{zoomLabel}</strong>
              </div>
            </label>

            <div className="avatar-crop-panel__actions">
              <button
                className="forum-pill-button forum-pill-button--ghost"
                disabled={submitting}
                onClick={onCancel}
                type="button"
              >
                重新选择
              </button>
              <button className="forum-pill-button" disabled={submitting} onClick={handleConfirm} type="button">
                {submitting ? '处理中…' : '使用这个头像'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
