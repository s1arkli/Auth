const title = import.meta.env.VITE_APP_TITLE?.trim() || 'mono token portal'

const rawBasePath = import.meta.env.VITE_API_BASE_PATH?.trim() || '/api/v1/account'

export const appEnv = {
  dev: import.meta.env.DEV,
  title,
  apiBasePath: rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`,
}
