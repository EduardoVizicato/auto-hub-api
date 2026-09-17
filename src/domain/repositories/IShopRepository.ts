import { Shop } from '../entities/Shop';

export interface IShopRepository {
  save(shop: Shop): Promise<void>;
  findById(id: string): Promise<Shop | null>;
  findAll(): Promise<Shop[]>;
  update(shop: Shop): Promise<void>;
}
