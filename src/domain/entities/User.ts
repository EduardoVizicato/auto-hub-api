import { randomUUID } from 'node:crypto';
import { Role } from '../value-objects/Role';

interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  averageRating: number;
  isActive: boolean;
  createdAt: Date;
}

type CreateUserProps = Omit<UserProps, 'id' | 'averageRating' | 'isActive' | 'createdAt'>;

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      id: randomUUID(),
      averageRating: 0,
      isActive: true,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get phone(): string {
    return this.props.phone;
  }

  get role(): Role {
    return this.props.role;
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
