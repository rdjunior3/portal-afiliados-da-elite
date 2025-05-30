// Export all services
export { ApiService } from './api.service';
export { AffiliateService, affiliateService } from './affiliate.service';
export { ProductService, productService } from './product.service';
export { CommissionService, commissionService } from './commission.service';

// Export service instances for easy import
export const services = {
  affiliate: affiliateService,
  product: productService,
  commission: commissionService,
} as const; 