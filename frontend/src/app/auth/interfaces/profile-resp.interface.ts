import { AuthUser } from "./auth-user.interface";
import { Subscription } from "../../user/interfaces/subscriptions.interface";

export interface ProfileResponse {
  user: AuthUser;
  subscriptions: Subscription[];
}
