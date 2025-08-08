import { IsString } from 'class-validator';

export class AddRemarkDto {
  @IsString()
  text: string;

  @IsString()
  remarker: string;
}
