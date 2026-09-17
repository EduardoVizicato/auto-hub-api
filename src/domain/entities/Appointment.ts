import { randomUUID } from 'node:crypto';
import { AppointmentStatus } from '../value-objects/AppointmentStatus';

interface AppointmentProps {
  id: string;
  clientId: string;
  vehicleId: string;
  shopId: string;
  requestedDate: Date;
  requestedTime: string;
  status: AppointmentStatus;
  description: string;
  negotiatedPrice: number | null;
  clientNotes: string | null;
  shopNotes: string | null;
  approvedAt: Date | null;
  deniedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type CreateAppointmentProps = Pick<
  AppointmentProps,
  'clientId' | 'vehicleId' | 'shopId' | 'requestedDate' | 'requestedTime' | 'description'
> & {
  clientNotes?: string | null;
};

export class Appointment {
  private constructor(private props: AppointmentProps) {}

  static create(props: CreateAppointmentProps): Appointment {
    const now = new Date();
    return new Appointment({
      ...props,
      id: randomUUID(),
      status: AppointmentStatus.pending(),
      negotiatedPrice: null,
      clientNotes: props.clientNotes ?? null,
      shopNotes: null,
      approvedAt: null,
      deniedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  approve(negotiatedPrice: number): void {
    if (!this.props.status.isPending()) {
      throw new Error('Only a pending appointment can be approved');
    }
    this.props.status = AppointmentStatus.approved();
    this.props.negotiatedPrice = negotiatedPrice;
    this.props.approvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  deny(): void {
    if (!this.props.status.isPending()) {
      throw new Error('Only a pending appointment can be denied');
    }
    this.props.status = AppointmentStatus.denied();
    this.props.deniedAt = new Date();
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (!this.props.status.isApproved()) {
      throw new Error('Only an approved appointment can be completed');
    }
    this.props.status = AppointmentStatus.completed();
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (!this.props.status.isPending() && !this.props.status.isApproved()) {
      throw new Error('Only a pending or approved appointment can be cancelled');
    }
    this.props.status = AppointmentStatus.cancelled();
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get vehicleId(): string {
    return this.props.vehicleId;
  }

  get shopId(): string {
    return this.props.shopId;
  }

  get requestedDate(): Date {
    return this.props.requestedDate;
  }

  get requestedTime(): string {
    return this.props.requestedTime;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get description(): string {
    return this.props.description;
  }

  get negotiatedPrice(): number | null {
    return this.props.negotiatedPrice;
  }

  get clientNotes(): string | null {
    return this.props.clientNotes;
  }

  get shopNotes(): string | null {
    return this.props.shopNotes;
  }

  get approvedAt(): Date | null {
    return this.props.approvedAt;
  }

  get deniedAt(): Date | null {
    return this.props.deniedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
