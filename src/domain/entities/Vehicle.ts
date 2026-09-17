import { randomUUID } from 'node:crypto';

interface VehicleProps {
  id: string;
  clientId: string;
  make: string;
  model: string;
  year: number;
  plate: string;
}

type CreateVehicleProps = Omit<VehicleProps, 'id'>;

export class Vehicle {
  private constructor(private readonly props: VehicleProps) {}

  static create(props: CreateVehicleProps): Vehicle {
    return new Vehicle({
      ...props,
      id: randomUUID(),
    });
  }

  static reconstitute(props: VehicleProps): Vehicle {
    return new Vehicle(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get make(): string {
    return this.props.make;
  }

  get model(): string {
    return this.props.model;
  }

  get year(): number {
    return this.props.year;
  }

  get plate(): string {
    return this.props.plate;
  }
}
