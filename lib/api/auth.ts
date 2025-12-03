import apiClient from './client';

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginRes {
  access_token: string;
}

export interface CaptchaRes {
  image: string;
  image_type: string;
}

export function getCaptcha(): Promise<CaptchaRes> {
  return apiClient.get('/api/v1/auth/captcha');
}

export function login(data: LoginData): Promise<LoginRes> {
  return apiClient.post('/api/v1/auth/login', data);
}

export function logout() {
  return apiClient.post('/api/v1/auth/logout');
}
