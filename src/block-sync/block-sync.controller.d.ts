import { BlockSyncService } from './block-sync.service';
import { BlockRange, OneBlock } from './dto/block-sync-request.dto';

export declare class BlockSyncController {
  private readonly service;

  constructor(service: BlockSyncService);

  fetchBlock(block: OneBlock): Promise<void>;

  fetchRangeOfBlocks(blockRange: BlockRange): Promise<any>;
}
