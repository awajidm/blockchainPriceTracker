import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceAlerts } from '../entities/price-alerts.entity';
import { SetAlertDto } from 'src/dtos/set-alert.dto';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import Moralis from 'moralis';

@Injectable()
export class PriceAlertsService {
  constructor(
    @InjectRepository(PriceAlerts)
    private priceAlertsRepository: Repository<PriceAlerts>,
  ) {}

  async createAlert(setAlertDto: SetAlertDto) {
    const alert = this.priceAlertsRepository.create({
      chain: setAlertDto.chain,
      alert_price: setAlertDto.alertPrice,
      email: setAlertDto.email,
    });
    return this.priceAlertsRepository.save(alert);
  }

  async calculateSwapRate(ethAmount: number) {
    const ethToBtcChain = EvmChain.ETHEREUM;
    const ethToBtcAddress = '0x...';

    try {
      const ethPrice = await Moralis.EvmApi.token.getTokenPrice({
        address: ethToBtcAddress,
        chain: ethToBtcChain,
      });

      const btcAmount = ethAmount * ethPrice.result.usdPrice;
      return { btcAmount };
    } catch (error) {
      console.error('Error calculating swap rate:', error);
      throw new Error('Could not calculate swap rate');
    }
  }

  async getActiveAlerts(
    chain: string,
    currentPrice: number,
  ): Promise<PriceAlerts[]> {
    return this.priceAlertsRepository.find({
      where: { chain, alert_price: currentPrice },
    });
  }
}
