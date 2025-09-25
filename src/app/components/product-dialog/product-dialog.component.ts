import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

export type DialogMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.css']
})
export class ProductDialogComponent implements OnInit {
  @Input() product: Product | null = null;
  @Input() mode: DialogMode = 'view';
  @Output() productCreated = new EventEmitter<Product>();
  @Output() productUpdated = new EventEmitter<Product>();
  @Output() dialogClosed = new EventEmitter<void>();

  formData = {
    name: '',
    price: 0,
    quantity: 0
  };

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isSubmitting = signal(false);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.resetForm();
    if (this.product && (this.mode === 'edit' || this.mode === 'view')) {
      this.formData = {
        name: this.product.Name,
        price: this.product.Price,
        quantity: this.product.Quantity || 0
      };
    }
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      price: 0,
      quantity: 0
    };
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  get title(): string {
    switch (this.mode) {
      case 'create':
        return 'Ajouter un produit';
      case 'edit':
        return 'Modifier le produit';
      case 'view':
        return 'Consulter le produit';
      default:
        return 'Produit';
    }
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  get canSubmit(): boolean {
    return !this.isReadOnly && !this.isSubmitting() && this.formData.name.trim() !== '' && this.formData.price >= 0 && this.formData.quantity >= 0;
  }

  onSubmit(): void {
    console.log('onSubmit called, mode:', this.mode, 'canSubmit:', this.canSubmit);
    if (!this.canSubmit) return;

    // Validation supplémentaire
    if (this.formData.name.trim() === '') {
      this.errorMessage.set('Le nom du produit est requis');
      return;
    }
    
    if (this.formData.price < 0) {
      this.errorMessage.set('Le prix doit être positif');
      return;
    }
    
    if (this.formData.quantity < 0) {
      this.errorMessage.set('La quantité doit être positive');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.mode === 'create') {
      this.createProduct();
    } else if (this.mode === 'edit' && this.product) {
      this.updateProduct();
    }
  }

  private createProduct(): void {
    const request: CreateProductRequest = {
      Name: this.formData.name.trim(),
      Price: this.formData.price,
      Quantity: this.formData.quantity || 0
    };

    console.log('Creating product with request:', request);
    this.productService.createProduct(request).subscribe({
      next: (product) => {
        console.log('Product created successfully:', product);
        this.productCreated.emit(product);
        this.isSubmitting.set(false);
        this.successMessage.set('Produit créé avec succès !');
        this.errorMessage.set('');
        // Fermer automatiquement le dialogue après succès
        setTimeout(() => {
          this.onClose();
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.errorMessage.set(error.message || 'Erreur lors de la création du produit');
        this.successMessage.set('');
        this.isSubmitting.set(false);
      }
    });
  }

  private updateProduct(): void {
    if (!this.product) return;

    const request: UpdateProductRequest = {
      Name: this.formData.name.trim(),
      Price: this.formData.price,
      Quantity: this.formData.quantity || 0
    };

    console.log('Updating product with request:', request);
    this.productService.updateProduct(this.product.Id, request).subscribe({
      next: (product) => {
        console.log('Product updated successfully:', product);
        this.productUpdated.emit(product);
        this.isSubmitting.set(false);
        this.successMessage.set('Produit modifié avec succès !');
        this.errorMessage.set('');
        // Fermer automatiquement le dialogue après succès
        setTimeout(() => {
          this.onClose();
        }, 1500);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.errorMessage.set(error.message || 'Erreur lors de la modification du produit');
        this.successMessage.set('');
        this.isSubmitting.set(false);
      }
    });
  }

  onClose(): void {
    this.resetForm();
    this.dialogClosed.emit();
  }

}
