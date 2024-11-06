import { Repository } from 'typeorm';
import { PriceHistory } from '../entities/price-history.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import Moralis from 'moralis';

@Injectable()
export class PriceHistoryService {
  constructor(
    @InjectRepository(PriceHistory)
    private priceHistoryRepository: Repository<PriceHistory>,
  ) {}

  async recordPrice(chain: string, price: number): Promise<PriceHistory> {
    const priceRecord = this.priceHistoryRepository.create({ chain, price });
    return this.priceHistoryRepository.save(priceRecord);
  }

  async getHourlyPrices(chain: string): Promise<PriceHistory[]> {
    return this.priceHistoryRepository
      .createQueryBuilder('priceHistory')
      .where('priceHistory.chain = :chain', { chain })
      .andWhere('priceHistory.timestamp >= NOW() - INTERVAL 1 HOUR')
      .orderBy('priceHistory.timestamp', 'DESC')
      .getMany();
  }

  async getPricesInLast24Hours() {
    const chain = EvmChain.ETHEREUM;
    const address = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0';

    try {
      const prices = await Moralis.EvmApi.token.getTokenPrice({
        address,
        chain,
      });

      const priceData = prices.raw;

      return priceData;
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw new Error('Could not fetch price history');
    }
  }

  async getTokenPrice(address: string, chain: string) {
    try {
      const prices = await Moralis.EvmApi.token.getTokenPrice({
        address,
        chain: EvmChain[chain],
      });

      const price = prices.raw?.usdPrice || 0;
      return { price };
    } catch (error) {
      console.error('Error fetching token price:', error);
      throw new Error('Could not fetch token price');
    }
  }
}
