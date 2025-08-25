// dto/create-driver.dto.ts
export class CreateDriverDto {
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly workshopId: string; // reference
  readonly vehicle: {
    type: 'bike' | 'taxi';
  };
}
