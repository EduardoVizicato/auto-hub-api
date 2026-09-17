export class AppointmentApproved {
  readonly occurredAt: Date;

  constructor(
    readonly appointmentId: string,
    readonly clientId: string,
    readonly negotiatedPrice: number,
  ) {
    this.occurredAt = new Date();
  }
}
