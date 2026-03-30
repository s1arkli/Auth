/** 负责渲染个人中心页面，并处理昵称修改、头像裁剪和资料保存。 */
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { ToastState } from '@/components/Toast'
import { updateUserProfile, uploadAvatar, type UserProfile } from '@/features/user'
import { AvatarCropModal } from '@/features/user/components/AvatarCropModal'
import { isServiceUnavailableError } from '@/lib/http/errors'
import { buildAvatarStyle } from '@/utils/avatar'

interface ProfilePageProps {
  account: string
  profile: UserProfile | null
  onBack: () => void
  onProfileSaved: (profile: UserProfile) => void
  onToast: (toast: ToastState) => void
}

/**
 * @description 渲染个人中心页面，支持昵称编辑、头像选择裁剪和资料保存。
 * @param props ProfilePageProps，个人中心所需的账号、资料和交互回调。
 * @returns React 个人中心页面组件。
 */
export function ProfilePage({
  account,
  profile,
  onBack,
  onProfileSaved,
  onToast,
}: ProfilePageProps) {
  const [nickname, setNickname] = useState(profile?.nickname || account)
  const [avatar, setAvatar] = useState(profile?.avatar || '')
  // selectedFile（已裁剪头像文件）只在用户点击保存时真正上传，避免频繁试裁就发请求。
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cropSource, setCropSource] = useState<string | null>(null)
  const [cropFileName, setCropFileName] = useState('')
  const [profileError, setProfileError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const cropObjectUrlRef = useRef<string | null>(null)
  const nicknameId = useId()
  const statusId = useId()

  useEffect(() => {
    setNickname(profile?.nickname || account)
    setAvatar(profile?.avatar || '')
    setSelectedFile(null)
    setCropSource(null)
    setCropFileName('')
    setProfileError('')
  }, [account, profile])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        window.URL.revokeObjectURL(objectUrlRef.current)
      }
      if (cropObjectUrlRef.current) {
        window.URL.revokeObjectURL(cropObjectUrlRef.current)
      }
    }
  }, [])

  /**
   * @description 校验资料表单并按需上传头像，再提交资料更新请求。
   * @param event FormEvent<HTMLFormElement>，表单提交事件。
   * @returns Promise<void>
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!profile?.uid) {
      const message = '当前登录态没有拿到用户 ID，请重新登录后再试。'
      setProfileError(message)
      onToast({ type: 'error', message })
      return
    }

    const trimmedNickname = nickname.trim()
    if (!trimmedNickname) {
      const message = '请输入昵称'
      setProfileError(message)
      onToast({ type: 'error', message })
      return
    }

    setSaving(true)
    setProfileError('')

    try {
      let nextAvatar = avatar

      if (selectedFile) {
        const uploadResult = await uploadAvatar(selectedFile)
        nextAvatar = uploadResult.url
      }

      await updateUserProfile({
        uid: profile.uid,
        nickname: trimmedNickname,
        avatar: nextAvatar,
      })

      onProfileSaved({
        uid: profile.uid,
        nickname: trimmedNickname,
        avatar: nextAvatar,
      })
      setSelectedFile(null)
      onToast({ type: 'success', message: '个人资料已更新。' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '个人资料保存失败'
      const backendHint =
        message.includes('参数') || message.includes('uids') || message.includes('required')
          ? '后端当前的 /api/v1/user/update 很可能还没有真正指向更新逻辑，请检查网关路由绑定。'
          : message
      if (isServiceUnavailableError(error)) {
        setProfileError('')
        onToast({ type: 'error', message })
      } else {
        setProfileError(backendHint)
        onToast({ type: 'error', message: backendHint })
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * @description 接收用户选择的原始图片文件，并启动裁剪弹窗。
   * @param file File | null，文件选择框当前选中的图片。
   * @returns void
   */
  function handleAvatarPick(file: File | null) {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      const message = '请选择 JPG、PNG、GIF 或 WEBP 图片文件。'
      setProfileError(message)
      onToast({ type: 'error', message })
      return
    }

    if (cropObjectUrlRef.current) {
      window.URL.revokeObjectURL(cropObjectUrlRef.current)
    }

    const cropPreviewUrl = window.URL.createObjectURL(file)
    cropObjectUrlRef.current = cropPreviewUrl
    setCropSource(cropPreviewUrl)
    setCropFileName(file.name)
    setProfileError('')
  }

  /**
   * @description 清理当前头像裁剪会话创建的临时 URL（统一资源定位符）和输入状态。
   * @returns void
   */
  function clearCropSession() {
    if (cropObjectUrlRef.current) {
      window.URL.revokeObjectURL(cropObjectUrlRef.current)
      cropObjectUrlRef.current = null
    }

    setCropSource(null)
    setCropFileName('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleCropCancel() {
    clearCropSession()
  }

  /**
   * @description 接收裁剪完成的头像文件，并更新页面预览。
   * @param file File，用户确认后的头像文件。
   * @returns void
   */
  function handleCropConfirm(file: File) {
    if (objectUrlRef.current) {
      window.URL.revokeObjectURL(objectUrlRef.current)
    }

    // 预览先使用本地 URL，只有用户真正保存资料时才把文件上传到后端。
    const previewUrl = window.URL.createObjectURL(file)
    objectUrlRef.current = previewUrl
    setSelectedFile(file)
    setAvatar(previewUrl)
    setProfileError('')
    clearCropSession()
  }

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <header className="composer-topbar">
          <button className="forum-nav-link" onClick={onBack} type="button">
            返回帖子页
          </button>
          <div className="forum-brand" aria-label="mono profile center">
            <span className="forum-brand__dot" />
            <span className="forum-brand__text">mono</span>
          </div>
        </header>

        <main className="profile-layout">
          <form className="profile-card" onSubmit={handleSubmit}>
            <div className="profile-card__heading">
              <h2>个人中心</h2>
              <p>头像和昵称都放在这里修改，界面只保留最需要的部分。</p>
            </div>

            <div className="profile-card__center">
              <button
                className="profile-avatar"
                onClick={() => fileInputRef.current?.click()}
                style={buildAvatarStyle(avatar, profile?.uid ?? account.length)}
                type="button"
              >
                <span className="sr-only">选择头像图片</span>
              </button>
              <strong>{nickname.trim() || '未设置昵称'}</strong>
              <span>{account}</span>
              <button className="forum-pill-button forum-pill-button--ghost" onClick={() => fileInputRef.current?.click()} type="button">
                更换头像
              </button>
              <input
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                className="sr-only"
                onChange={(event) => handleAvatarPick(event.target.files?.[0] ?? null)}
                ref={fileInputRef}
                type="file"
              />
            </div>

            {profileError ? (
              <p className="forum-form-error" id={statusId} role="alert">
                {profileError}
              </p>
            ) : null}

            <label className="profile-field" htmlFor={nicknameId}>
              <span className="composer-field__label">昵称</span>
              <input
                aria-describedby={profileError ? statusId : undefined}
                className="composer-field__input"
                disabled={saving}
                id={nicknameId}
                maxLength={16}
                onChange={(event) => {
                  setNickname(event.target.value)
                  if (profileError) {
                    setProfileError('')
                  }
                }}
                placeholder="设置一个让人容易识别的昵称…"
                value={nickname}
              />
            </label>

            <div className="profile-card__actions">
              <span>{selectedFile ? `已选择新头像：${selectedFile.name}` : '未选择新的头像文件'}</span>
              <div className="composer-card__actionRow">
                <button className="forum-pill-button forum-pill-button--ghost" onClick={onBack} type="button">
                  取消
                </button>
                <button className="forum-pill-button" disabled={saving} type="submit">
                  {saving ? '保存中…' : '保存资料'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {cropSource ? (
        <AvatarCropModal
          fileName={cropFileName}
          imageSrc={cropSource}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
          onToast={onToast}
        />
      ) : null}
    </div>
  )
}
