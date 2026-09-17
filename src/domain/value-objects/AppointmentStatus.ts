const VALID_VALUES = ['PENDING', 'APPROVED', 'DENIED', 'COMPLETED', 'CANCELLED'] as const;

type AppointmentStatusValue = (typeof VALID_VALUES)[number];

export class AppointmentStatus {
  private constructor(private readonly _value: AppointmentStatusValue) {}

  static pending(): AppointmentStatus {
    return new AppointmentStatus('PENDING');
  }

  static approved(): AppointmentStatus {
    return new AppointmentStatus('APPROVED');
  }

  static denied(): AppointmentStatus {
    return new AppointmentStatus('DENIED');
  }

  static completed(): AppointmentStatus {
    return new AppointmentStatus('COMPLETED');
  }

  static cancelled(): AppointmentStatus {
    return new AppointmentStatus('CANCELLED');
  }

  static from(value: string): AppointmentStatus {
    if (!VALID_VALUES.includes(value as AppointmentStatusValue)) {
      throw new Error(`Invalid AppointmentStatus: ${value}`);
    }
    return new AppointmentStatus(value as AppointmentStatusValue);
  }

  get value(): string {
    return this._value;
  }

  isPending(): boolean {
    return this._value === 'PENDING';
  }

  isApproved(): boolean {
    return this._value === 'APPROVED';
  }

  isDenied(): boolean {
    return this._value === 'DENIED';
  }

  isCompleted(): boolean {
    return this._value === 'COMPLETED';
  }

  isCancelled(): boolean {
    return this._value === 'CANCELLED';
  }
}
