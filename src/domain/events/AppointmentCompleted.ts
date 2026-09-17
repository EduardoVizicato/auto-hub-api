export class AppointmentCompleted {
  readonly occurredAt: Date;

  constructor(
    readonly appointmentId: string,
    readonly clientId: string,
    readonly shopId: string,
  ) {
    this.occurredAt = new Date();
  }
}
