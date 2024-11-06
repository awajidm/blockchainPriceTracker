import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PriceHistoryService } from '../services/price-history.service';
import { PriceAlertsService } from '../services/price-alerts.service';
import { SetAlertDto } from '../dtos/set-alert.dto';
import { SwapRateDto } from '../dtos/swap-rate.dto';
import { MoralisService } from '../moralis/moralis.service';
import { EvmChain } from '@moralisweb3/common-evm-utils';
@ApiTags('Price Tracker')
@Controller('price-tracker')
export class PriceTrackerController {
  constructor(
    private readonly priceHistoryService: PriceHistoryService,
    private readonly priceAlertsService: PriceAlertsService,
    private readonly moralisService: MoralisService,
  ) {}

  @Get('/get-prices-in-last-24-hours')
  @ApiOperation({ summary: 'Get hourly prices for the past 24 hours' })
  async getHourlyPrices() {
    return this.priceHistoryService.getPricesInLast24Hours();
  }

  @Post('/alerts')
  @ApiOperation({
    summary: 'Set a price alert for a specified price threshold',
  })
  async setPriceAlert(@Body() setAlertDto: SetAlertDto) {
    return this.priceAlertsService.createAlert(setAlertDto);
  }

  @Post('/swap-rate')
  @ApiOperation({ summary: 'Get ETH to BTC swap rate and fees' })
  async getSwapRate(@Body() swapRateDto: SwapRateDto) {
    return this.priceAlertsService.calculateSwapRate(swapRateDto.ethAmount);
  }

  @Get('/token-price')
  @ApiOperation({ summary: 'Get token price for a specified token address' })
  async getTokenPrice(@Query('address') address: string) {
    try {
      const priceData = await this.moralisService.getTokenPrice(
        address,
        EvmChain.ETHEREUM,
      );
      return { usdPrice: priceData.result.usdPrice };
    } catch (error) {
      return { error: 'Failed to fetch token price', details: error.message };
    }
  }

  @Get('/eth-to-btc-swap-rate')
  @ApiOperation({ summary: 'Get ETH to BTC swap rate and fees' })
  async getEthToBtcSwapRate() {
    try {
      const swapRateData = await this.moralisService.getSwapRate(
        EvmChain.ETHEREUM,
        EvmChain.POLYGON,
      );
      return { rate: swapRateData.rate, fee: swapRateData.fee };
    } catch (error) {
      return { error: 'Failed to fetch swap rate', details: error.message };
    }
  }
}
