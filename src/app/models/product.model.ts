export interface Product {
  Id: number;
  Name: string;
  Price: number;
  Quantity?: number; // Optional as not always present in responses
}

export interface CreateProductRequest {
  Name: string;
  Price: number;
  Quantity: number;
}

export interface UpdateProductRequest {
  Name: string;
  Price: number;
  Quantity: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}
