import {
  Alchemy,
  AlchemySettings,
  BlockWithTransactions,
  Network
} from "alchemy-sdk";
import * as dotenv from "dotenv";
import {createPublicClient, createWalletClient, http} from 'viem'
import {hederaLocalnet} from "./hedera-localnet";
import {AccountBalanceQuery, AccountCreateTransaction, AccountId, Client, Hbar, PrivateKey} from "@hashgraph/sdk";

dotenv.config();
const args = process.argv.slice(2);
const network = args[0].trim();
if (!Object.values(Network).includes(network as Network)) {
  console.log(`Network: ${network}, not supported, list of supported networks: ${Object.values(Network)}`);
  process.exit(1);
}
const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: network as Network.ETH_SEPOLIA
} as AlchemySettings;
const alchemy = new Alchemy(config);

const viemClient = createPublicClient({
  chain: hederaLocalnet,
  transport: http(),
});

const viemWalletClient = createWalletClient({
  chain: hederaLocalnet,
  transport: http()
})

type HederaAccount = {
  id: string;
  pk: string
};

const accountsMapping = new Map<string, HederaAccount>(); // Map<EthAddress, HederaAccount>

const node = {"127.0.0.1:50211": new AccountId(3)}
const sdkClient = Client.forNetwork(node).setMirrorNetwork("127.0.0.1:5600");

//Set the transaction fee paying account
sdkClient.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));

async function createAndMapHedera(ethAddress: string) {
  const newAccountPk = PrivateKey.generateED25519();

  //Submit a transaction to your local node
  const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPk)
      .setInitialBalance(new Hbar(30))
      .execute(sdkClient);

  const newAccountReceipt = await newAccount.getReceipt(sdkClient);

  const hederaAccount = {
    pk: newAccountPk.toStringRaw(),
    id: newAccountReceipt?.accountId?.toString() || ""
  }

  accountsMapping.set(ethAddress, hederaAccount);
  return hederaAccount;
}

async function getPrivateKey(ethAddress: string) {
  const hederaAccount = accountsMapping.get(ethAddress);

  if(hederaAccount) {
    return PrivateKey.fromStringED25519(hederaAccount.pk)
  }

  const newHederaAccount = await createAndMapHedera(ethAddress);
  return PrivateKey.fromStringED25519(newHederaAccount.pk)
}

(async () => {
  const nr = await alchemy.core.getBlockNumber();

  const block = await alchemy.core.getBlockWithTransactions(nr)

  // await Promise.allSettled(  block.transactions.map(async (transaction) => {
  //   if(!transaction?.to) return
  //
  //   const fromAccount = await getPrivateKey(transaction.from);
  //   await getPrivateKey(transaction.to);
  //
  //   console.log('transaction')
  //
  //   viemWalletClient.sendRawTransaction({
  //
  //   })
  // }))

  console.log(block);
})();
