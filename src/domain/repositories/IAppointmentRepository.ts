import { Appointment } from '../entities/Appointment';
import { AppointmentStatus } from '../value-objects/AppointmentStatus';

export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<void>;
  findById(id: string): Promise<Appointment | null>;
  findByClientId(clientId: string): Promise<Appointment[]>;
  findByShopId(shopId: string, status?: AppointmentStatus): Promise<Appointment[]>;
  countApprovedByShopAndDate(shopId: string, date: Date): Promise<number>;
  update(appointment: Appointment): Promise<void>;
}
