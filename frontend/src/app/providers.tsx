/** 负责挂载应用级 Provider（全局提供者），当前保留为统一扩展入口。 */
import type { PropsWithChildren } from 'react'

type AppProvidersProps = PropsWithChildren

/**
 * @description 为应用提供统一的全局上下文挂载点，后续可在这里追加状态或主题 Provider。
 * @param children PropsWithChildren['children']，需要被 Provider 包裹的页面内容。
 * @returns 原样返回的子节点树。
 */
export function AppProviders({ children }: AppProvidersProps) {
  return children
}
