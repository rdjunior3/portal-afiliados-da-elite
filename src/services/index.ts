// Export all services
export { ApiService } from './api.service';
export { ProductService, productService } from './product.service';

// Export service instances for easy import
export const services = {
  product: productService,
} as const; 