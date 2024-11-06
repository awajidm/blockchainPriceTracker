import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwapRateDto {
  @ApiProperty({ description: 'Amount in Ethereum to convert to BTC' })
  @IsNumber()
  ethAmount: number;
}
