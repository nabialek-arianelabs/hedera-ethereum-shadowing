'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.BlockSyncModule = void 0;
const common_1 = require('@nestjs/common');
const block_sync_controller_1 = require('./block-sync.controller');
const block_sync_service_1 = require('./block-sync.service');
let BlockSyncModule = class BlockSyncModule {};
exports.BlockSyncModule = BlockSyncModule;
exports.BlockSyncModule = BlockSyncModule = __decorate(
  [
    (0, common_1.Module)({
      controllers: [block_sync_controller_1.BlockSyncController],
      providers: [block_sync_service_1.BlockSyncService],
    }),
  ],
  BlockSyncModule,
);
//# sourceMappingURL=block-sync.module.js.map