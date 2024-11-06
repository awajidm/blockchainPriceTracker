import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceHistoryService } from './price-history.service';
import { EmailService } from './email.service';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import Moralis from 'moralis';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private priceHistoryService: PriceHistoryService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchPricesAndCheckAlerts() {
    this.logger.log('Fetching prices for Ethereum and Polygon.');

    try {
      const ethPrice = await this.fetchPrice(EvmChain.ETHEREUM);
      const polygonPrice = await this.fetchPrice(EvmChain.POLYGON);

      await this.priceHistoryService.recordPrice('Ethereum', ethPrice);
      await this.priceHistoryService.recordPrice('Polygon', polygonPrice);

      await this.checkForPriceIncrease('Ethereum', ethPrice);
      await this.checkForPriceIncrease('Polygon', polygonPrice);
    } catch (error) {
      this.logger.error('Failed to fetch prices or check alerts', error);
    }
  }

  private async fetchPrice(chain: EvmChain): Promise<number> {
    try {
      const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
        chain,
        address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
      });

      return tokenPrice.result.usdPrice;
    } catch (error) {
      this.logger.error(
        `Error fetching price for ${JSON.stringify(chain)}`,
        error,
      );
      throw new Error(`Failed to fetch ${JSON.stringify(chain)} price`);
    }
  }

  private async checkForPriceIncrease(chain: string, currentPrice: number) {
    const lastHourPrices =
      await this.priceHistoryService.getHourlyPrices(chain);

    if (lastHourPrices.length > 0) {
      const oneHourAgoPrice = lastHourPrices[0].price;
      const priceIncrease =
        ((currentPrice - oneHourAgoPrice) / oneHourAgoPrice) * 100;

      if (priceIncrease > 3) {
        this.logger.log(`${chain} price increased by more than 3%`);
        await this.emailService.sendAlertEmail(
          process.env.EMAIL_TO,
          `${chain} Price Alert`,
          `${chain} price increased by ${priceIncrease.toFixed(2)}% in the last hour.`,
        );
      }
    }
  }
}
