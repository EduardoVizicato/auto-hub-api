export class AppointmentCreated {
  readonly occurredAt: Date;

  constructor(
    readonly appointmentId: string,
    readonly shopId: string,
    readonly clientId: string,
  ) {
    this.occurredAt = new Date();
  }
}
