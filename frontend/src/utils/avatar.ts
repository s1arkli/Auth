/** 负责生成头像显示样式，兼容纯色背景和远程图片地址。 */
import type { CSSProperties } from 'react'

const avatarFallbacks = ['#CBD5E1', '#BFDBFE', '#DDD6FE', '#FDE68A', '#FBCFE8', '#A7F3D0']

function isColorValue(value: string) {
  return /^(#|rgb\(|rgba\(|hsl\(|hsla\(|linear-gradient\(|radial-gradient\(|conic-gradient\(|var\()/.test(value)
}

function isImageSource(value: string) {
  return /^(https?:\/\/|blob:|data:|\/|\.\/|\.\.\/)/.test(value) || /\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(value)
}

/**
 * @description 根据头像地址和种子值生成可直接挂到 style（样式）属性上的头像背景。
 * @param avatar string，头像图片地址或纯色值。
 * @param seed number，用于在无头像时稳定挑选占位颜色的种子值。
 * @returns CSSProperties，可直接用于头像节点的内联样式。
 */
export function buildAvatarStyle(avatar: string | null | undefined, seed: number): CSSProperties {
  const fallback = avatarFallbacks[Math.abs(seed) % avatarFallbacks.length]
  const normalizedAvatar = typeof avatar === 'string' ? avatar.trim() : ''

  if (!normalizedAvatar) {
    return { background: fallback }
  }

  if (isImageSource(normalizedAvatar)) {
    return {
      backgroundColor: fallback,
      backgroundImage: `url("${normalizedAvatar}")`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }
  }

  if (isColorValue(normalizedAvatar)) {
    return { background: normalizedAvatar }
  }

  return {
    backgroundColor: fallback,
    backgroundImage: `url("${normalizedAvatar}")`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
}
