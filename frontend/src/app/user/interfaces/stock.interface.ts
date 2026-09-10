export interface Stock {
  id: number;
  imei: string;
  model: string;
  brand: string;
  ph_provider: string;
  phone_image: string | null;
  line: number;
  line_provider: string;
}

export interface UpdateStockRequest {
  imei: string;
  model: string;
  brand: string;
  ph_provider: string;
  line: number;
  line_provider: string;
}
export interface CreateStockRequest {
  imei: string;
  model: string;
  brand: string;
  ph_provider: string;
  line: number;
  line_provider: string;
}


