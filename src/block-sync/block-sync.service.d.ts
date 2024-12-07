export declare class BlockSyncService {
  private readonly evmProvider;

  constructor(evmProvider: EvmProvider);

  getBlock(block: number): void;

  getBlockRange(fromBlock: number, toBlock: number): Promise<any>;
}
