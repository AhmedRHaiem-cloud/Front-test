import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:44365/api/products';

  constructor(private http: HttpClient) {}

  // Récupérer tous les produits
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Récupérer un produit par ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Créer un nouveau produit
  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Modifier un produit existant
  updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Supprimer un produit
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Tester la connexion à la base de données
  testConnection(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/test-connection`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inattendue s\'est produite';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.error && error.error.Message) {
        errorMessage = error.error.Message;
      } else if (error.status === 404) {
        errorMessage = 'Produit non trouvé';
      } else if (error.status === 400) {
        errorMessage = 'Données invalides';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur interne';
      }
    }
    
    console.error('Erreur API:', error);
    return throwError(() => new Error(errorMessage));
  }
}
