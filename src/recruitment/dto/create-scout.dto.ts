// dto/create-scout.dto.ts
export class CreateScoutDto {
  readonly scoutId: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly email?: string;
}
