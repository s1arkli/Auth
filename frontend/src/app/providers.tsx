import type { PropsWithChildren } from 'react'

interface AppProvidersProps extends PropsWithChildren {}

export function AppProviders({ children }: AppProvidersProps) {
  return children
}
