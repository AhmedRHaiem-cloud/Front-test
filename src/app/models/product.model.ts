export interface Product {
  Id: number;
  Name: string;
  Price: number;
  Quantity?: number; // Optionnel car pas toujours présent dans les réponses
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
