import { randomUUID } from 'node:crypto';

interface ShopProps {
  id: string;
  userId: string;
  description: string;
  imageUrl: string | null;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  totalDailyCapacity: number;
  averageRating: number;
  isActive: boolean;
  createdAt: Date;
}

type CreateShopProps = Omit<ShopProps, 'id' | 'averageRating' | 'isActive' | 'createdAt'>;

export class Shop {
  private constructor(private readonly props: ShopProps) {}

  static create(props: CreateShopProps): Shop {
    return new Shop({
      ...props,
      id: randomUUID(),
      averageRating: 0,
      isActive: true,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ShopProps): Shop {
    return new Shop(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get description(): string {
    return this.props.description;
  }

  get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get zipCode(): string {
    return this.props.zipCode;
  }

  get totalDailyCapacity(): number {
    return this.props.totalDailyCapacity;
  }

  get averageRating(): number {
    return this.props.averageRating;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
