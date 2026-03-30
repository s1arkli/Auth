/** 负责拼装应用级 Provider（全局提供者）并承接历史页面实现。 */
import LegacyApp from '@/App'
import { AppProviders } from '@/app/providers'

/**
 * @description 作为新的应用入口壳层，统一挂载全局 Provider。
 * @returns 包含全局 Provider 的应用根组件。
 */
export function App() {
  return (
    <AppProviders>
      <LegacyApp />
    </AppProviders>
  )
}
