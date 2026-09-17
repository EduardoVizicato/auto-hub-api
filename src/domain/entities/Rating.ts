import { randomUUID } from 'node:crypto';
import { RaterType } from '../value-objects/RaterType';

interface RatingProps {
  id: string;
  appointmentId: string;
  raterUserId: string;
  raterType: RaterType;
  score: number;
  comment: string | null;
  createdAt: Date;
}

type CreateRatingProps = Omit<RatingProps, 'id' | 'createdAt'>;

export class Rating {
  private constructor(private readonly props: RatingProps) {}

  static create(props: CreateRatingProps): Rating {
    return new Rating({
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: RatingProps): Rating {
    return new Rating(props);
  }

  get id(): string {
    return this.props.id;
  }

  get appointmentId(): string {
    return this.props.appointmentId;
  }

  get raterUserId(): string {
    return this.props.raterUserId;
  }

  get raterType(): RaterType {
    return this.props.raterType;
  }

  get score(): number {
    return this.props.score;
  }

  get comment(): string | null {
    return this.props.comment;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
