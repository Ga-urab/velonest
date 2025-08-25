import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 27.700769 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 85.300140 })
  @IsNumber()
  longitude: number;

  
}
