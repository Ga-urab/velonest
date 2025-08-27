// dto/self-register-driver.dto.ts
export class SelfRegisterDriverDto {
  readonly workshopId: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly vehicle: {
    type: 'bike' | 'taxi';
    condition: 'new' | 'old';
  };
}
