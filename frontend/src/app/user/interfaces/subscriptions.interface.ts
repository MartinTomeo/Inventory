export interface Subscription {
  id: number;
  user_id: number;
  stock_id: number;
  username: string;
  email: string;
  user_image: string | null;
  imei: string;
  model: string;
  brand: string;
  ph_provider: string;
  phone_image: string | null;
  line: number;
  line_provider: string;
}

export interface CreateSubscriptionRequest {
  user_id: number;
  stock_id: number;
}

export interface CreateSubscriptionResponse {
  id: number;
}

export interface DeleteSubscriptionsResponse {
  deleted_count: number;
  ids: number[];
}

export interface SubscriptionUserOption {
  id: number;
  username: string;
  email: string;
}

export interface SubscriptionStockOption {
  id: number;
  imei: string;
  model: string;
  brand: string;
  line: number;
}

export interface SubscriptionOptionsResponse {
  users: SubscriptionUserOption[];
  stock: SubscriptionStockOption[];
}

