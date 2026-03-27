import LegacyApp from '@/App'
import { AppProviders } from '@/app/providers'

export function App() {
  return (
    <AppProviders>
      <LegacyApp />
    </AppProviders>
  )
}
