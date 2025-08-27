export class CreateDriverDto {
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly workshopId: string; // reference
  readonly vehicle: {
    type: 'bike' | 'taxi';
    condition: 'new' | 'old';
  };
}
