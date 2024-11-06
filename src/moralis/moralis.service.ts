import { Injectable } from '@nestjs/common';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

@Injectable()
export class MoralisService {
  constructor() {
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }

  async getTokenPrice(address: string, chain: EvmChain) {
    try {
      const priceData = await Moralis.EvmApi.token.getTokenPrice({
        address,
        chain,
      });
      return priceData;
    } catch (error) {
      throw new Error(`Failed to fetch token price: ${error.message}`);
    }
  }

  async getSwapRate(fromChain: EvmChain, toChain: EvmChain) {
    try {
      const ethPrice = await this.fetchTokenPrice(fromChain, '0x...');
      const btcPrice = await this.fetchTokenPrice(toChain, '0x...');

      const rate = ethPrice / btcPrice;
      const fee = this.calculateTransactionFee();

      return { rate, fee };
    } catch (error) {
      console.error('Error fetching swap rate:', error);
      throw new Error('Failed to fetch swap rate');
    }
  }
  private async fetchTokenPrice(
    chain: EvmChain,
    address: string,
  ): Promise<number> {
    try {
      const price = await Moralis.EvmApi.token.getTokenPrice({
        address,
        chain,
      });

      return price.result.usdPrice;
    } catch (error) {
      console.error(
        `Error fetching price for token ${address} on ${chain}:`,
        error,
      );
      throw new Error('Failed to fetch token price');
    }
  }
  private calculateTransactionFee(): number {
    return 0.02;
  }
}
