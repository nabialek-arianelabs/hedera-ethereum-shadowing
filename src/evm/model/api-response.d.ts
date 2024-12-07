export declare class JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result: BlockResult;
}

export declare class BlockResult {
  number: string;
  hash: string;
  transactions: Transaction[];
  totalDifficulty: string;
  logsBloom: string;
  receiptsRoot: string;
  extraData: string;
  nonce: string;
  miner: string;
  difficulty: string;
  gasLimit: string;
  gasUsed: string;
  uncles: string[];
  sha3Uncles: string;
  size: string;
  transactionsRoot: string;
  stateRoot: string;
  mixHash: string;
  parentHash: string;
  timestamp: string;
}

export declare class Transaction {
  blockHash: string;
  blockNumber: string;
  hash: string;
  input: string;
  r: string;
  s: string;
  v: string;
  gas: string;
  from: string;
  transactionIndex: string;
  to: string;
  type: string;
  value: string;
  nonce: string;
  gasPrice: string;
}
