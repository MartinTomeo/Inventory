export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: number;
  user_image: string | null;
  created_at: string;
}
