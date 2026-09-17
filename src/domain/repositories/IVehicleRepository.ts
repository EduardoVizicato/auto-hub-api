import { Vehicle } from '../entities/Vehicle';

export interface IVehicleRepository {
  save(vehicle: Vehicle): Promise<void>;
  findById(id: string): Promise<Vehicle | null>;
  findByClientId(clientId: string): Promise<Vehicle[]>;
  delete(id: string): Promise<void>;
}
