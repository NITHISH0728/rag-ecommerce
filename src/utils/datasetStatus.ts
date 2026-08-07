import type { DatasetStatusInfo } from '../types/product';
import { ProductRepository } from '../repositories/productRepository';

export function getDatasetStatus(): DatasetStatusInfo {
  return ProductRepository.getDatasetStatusInfo();
}
