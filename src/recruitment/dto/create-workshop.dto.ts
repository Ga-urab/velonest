// dto/create-workshop.dto.ts
export class CreateWorkshopDto {
  readonly workshopId: string;
  readonly scoutId: string; // reference
  readonly name: string;
  readonly location: string;
}
