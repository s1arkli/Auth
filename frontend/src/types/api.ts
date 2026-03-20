export interface ApiResponse<T> {
  code: number
  msg: string
  data?: T
}

export interface LoginPayload {
  account: string
  password: string
}

export interface LoginData {
  access_token: string
  refresh_token: string
}

export interface RegisterPayload {
  account: string
  password: string
}

export interface AuthSuccessState {
  account: string
  accessToken: string
  refreshToken?: string
}

