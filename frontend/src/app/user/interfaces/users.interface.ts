export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: number;
  user_image: string;
  created_at: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: number;
}

