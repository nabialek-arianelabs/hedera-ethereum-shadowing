import { HttpService } from '@nestjs/axios';

export declare class SepoliaBaseProvider implements ApiChainProvider {
  constructor(httpService: HttpService, apiKey: string);

  getBlock(): void;

  getBlockRange(): void;
}
