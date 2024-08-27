'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ApiProvider = void 0;
const config_1 = require('@nestjs/config');
const sepolia_base_provider_1 = require('./sepolia-base.provider');
const axios_1 = require('@nestjs/axios');
exports.ApiProvider = {
  provide: 'API_SERVICE',
  useFactory: (configService, httpService) => {
    const apiProvider = configService.get('API_CHAIN');
    const apiKey = configService.get('ALCHEMY_API_KEY');
    if (apiProvider === 'sepolia-base') {
      return new sepolia_base_provider_1.SepoliaBaseProvider(
        httpService,
        apiKey,
      );
    } else if (apiProvider === 'evm-mainnet') {
      return new EvmMainnetProvider(httpService, apiKey);
    } else {
      throw new Error(`Unknown API provider: ${apiProvider}`);
    }
  },
  inject: [config_1.ConfigService, axios_1.HttpService],
};
//# sourceMappingURL=provider.factory.js.map