export class AppointmentDenied {
  readonly occurredAt: Date;

  constructor(
    readonly appointmentId: string,
    readonly clientId: string,
  ) {
    this.occurredAt = new Date();
  }
}
