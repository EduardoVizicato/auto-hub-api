import { Rating } from '../entities/Rating';
import { RaterType } from '../value-objects/RaterType';

export interface IRatingRepository {
  save(rating: Rating): Promise<void>;
  findByAppointmentId(appointmentId: string): Promise<Rating[]>;
  findByShopId(shopId: string): Promise<Rating[]>;
  existsByAppointmentAndRaterType(appointmentId: string, raterType: RaterType): Promise<boolean>;
}
