import type { CSSProperties } from 'react'

const avatarFallbacks = ['#CBD5E1', '#BFDBFE', '#DDD6FE', '#FDE68A', '#FBCFE8', '#A7F3D0']

export function buildAvatarStyle(avatar: string, seed: number): CSSProperties {
  const fallback = avatarFallbacks[Math.abs(seed) % avatarFallbacks.length]

  if (!avatar) {
    return { background: fallback }
  }

  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return {
      backgroundColor: fallback,
      backgroundImage: `url("${avatar}")`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }
  }

  return { background: avatar }
}
