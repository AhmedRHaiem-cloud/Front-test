import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../models/product.model';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductDialogComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  searchTerm = signal('');
  selectedProducts = signal<Set<number>>(new Set());
  isLoading = signal(false);
  errorMessage = signal('');
  
  // Dialog states
  showCreateDialog = signal(false);
  showEditDialog = signal(false);
  showViewDialog = signal(false);
  selectedProduct = signal<Product | null>(null);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    console.log('loadProducts called');
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products.length, 'products');
        this.products.set(products);
        this.filteredProducts.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set(error.message || 'Error loading products');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredProducts.set(this.products());
    } else {
      const filtered = this.products().filter(product => 
        product.Name.toLowerCase().includes(term) ||
        product.Id.toString().includes(term) ||
        product.Price.toString().includes(term)
      );
      this.filteredProducts.set(filtered);
    }
  }

  onRefresh(): void {
    this.loadProducts();
  }

  onExport(): void {
    const products = this.filteredProducts();
    const csvContent = this.convertToCSV(products);
    this.downloadCSV(csvContent, 'products.csv');
  }

  onAddProduct(): void {
    console.log('onAddProduct called');
    this.selectedProduct.set(null);
    this.showCreateDialog.set(true);
    console.log('showCreateDialog set to:', this.showCreateDialog());
  }

  onViewProduct(product: Product): void {
    console.log('onViewProduct called with:', product);
    this.selectedProduct.set(product);
    this.showViewDialog.set(true);
    console.log('showViewDialog set to:', this.showViewDialog());
  }

  onEditProduct(product: Product): void {
    console.log('onEditProduct called with:', product);
    this.selectedProduct.set(product);
    this.showEditDialog.set(true);
    console.log('showEditDialog set to:', this.showEditDialog());
  }

  onDeleteProduct(product: Product): void {
    console.log('onDeleteProduct called with:', product);
    if (confirm(`Are you sure you want to delete the product "${product.Name}"?`)) {
      console.log('Deleting product:', product.Id);
      this.productService.deleteProduct(product.Id).subscribe({
        next: () => {
          console.log('Product deleted successfully');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.errorMessage.set(error.message || 'Error during deletion');
        }
      });
    }
  }

  onProductCreated(product: Product): void {
    console.log('Product created event received:', product);
    this.loadProducts();
  }

  onProductUpdated(product: Product): void {
    console.log('Product updated event received:', product);
    this.loadProducts();
  }

  onDialogClosed(): void {
    this.showCreateDialog.set(false);
    this.showEditDialog.set(false);
    this.showViewDialog.set(false);
    this.selectedProduct.set(null);
  }

  toggleProductSelection(productId: number): void {
    const selected = new Set(this.selectedProducts());
    if (selected.has(productId)) {
      selected.delete(productId);
    } else {
      selected.add(productId);
    }
    this.selectedProducts.set(selected);
  }

  toggleAllSelection(): void {
    const allSelected = this.areAllProductsSelected();
    if (allSelected) {
      this.selectedProducts.set(new Set());
    } else {
      const allIds = new Set(this.filteredProducts().map(p => p.Id));
      this.selectedProducts.set(allIds);
    }
  }

  areAllProductsSelected(): boolean {
    const selected = this.selectedProducts();
    const filtered = this.filteredProducts();
    return filtered.length > 0 && filtered.every(p => selected.has(p.Id));
  }

  isProductSelected(productId: number): boolean {
    return this.selectedProducts().has(productId);
  }

  private convertToCSV(products: Product[]): string {
    const headers = ['ID', 'Name', 'Price', 'Quantity'];
    const rows = products.map(product => [
      product.Id,
      product.Name,
      product.Price.toFixed(2),
      product.Quantity || 0
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  }

  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
