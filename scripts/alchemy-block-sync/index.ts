import {
  Alchemy,
  AlchemySettings,
  BlockWithTransactions,
  Network
} from "alchemy-sdk";
import * as dotenv from "dotenv";

dotenv.config();
const args = process.argv.slice(2);
const network = args[0].trim();
if (!Object.values(Network).includes(network as Network)) {
  console.log(`Network: ${network}, not supported, list of supported networks: ${Object.values(Network)}`);
  process.exit(1);
}
const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: network as Network
} as AlchemySettings;
const fromBlock = Number(args[1]);
const toBlock = Number(args[2]);
const alchemy = new Alchemy(config);
(async () => {
  const transactionsPerBlock = new Map<string, BlockWithTransactions>();
  const promises: Promise<void>[] = [];
  const nr = await alchemy.core.getBlockNumber();  // Fetch once if the block number is the same for all blocks

  for (let block = fromBlock; block < toBlock; block++) {
    const hexBlock = "0x" + block.toString(16);

    promises.push(
      alchemy.core.getBlockWithTransactions(nr)
        .then((data: BlockWithTransactions) => {
          transactionsPerBlock.set(hexBlock, data);
        })
        .catch((error) => {
          console.error(`Error caught during fetching block ${hexBlock} (${block}), error: ${error}`);
        })
    );
  }

  await Promise.all(promises);

  // Log the transactionsPerBlock map after all promises have resolved
  console.log(transactionsPerBlock);
})();


