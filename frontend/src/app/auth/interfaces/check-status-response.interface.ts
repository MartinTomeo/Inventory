import { AuthUser } from './auth-user.interface';

export interface CheckStatusResponse {
  success: boolean;

  data: {
    user: AuthUser;
  };
}
