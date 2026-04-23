export interface RegisterPayload {
  nome: string;
  cnpj: string;
  senha: string;
  fone: string;
  email: string;
}

export interface LoginPayload {
  cnpj: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserMe {
  id: number;
  nome: string;
  cnpj: string;
  fone: string;
  email: string;
  contratante: boolean;
}

export interface PointPayload {
  cnpj: string;
  data: string;
  hora: string;
}

export interface QrCodeResponse {
  cnpj: string;
  qrcode_base64: string;
}
