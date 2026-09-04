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
