import { IsNumber, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetAlertDto {
  @ApiProperty({ description: 'Blockchain chain (e.g., Ethereum, Polygon)' })
  @IsEnum(['Ethereum', 'Polygon'])
  chain: string;

  @ApiProperty({ description: 'Price threshold for the alert' })
  @IsNumber()
  alertPrice: number;

  @ApiProperty({ description: 'Email to notify' })
  @IsEmail()
  email: string;
}
