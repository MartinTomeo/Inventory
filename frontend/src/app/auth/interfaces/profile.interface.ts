import { AuthUser } from './auth-user.interface';

export interface ProfileStock {
  subscription_id: number;
  id: number;
  imei: string;
  model: string;
  brand: string;
  ph_provider: string;
  phone_image: string | null;
  line: number;
  line_provider: string;
}

export interface ProfileResponse {
  user: AuthUser;
  stock: ProfileStock[];
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  user: AuthUser;
  updated: string[];
}

export interface UpdateProfilePhotoResponse {
  image: string;
  updated: ['user_image'];
}
