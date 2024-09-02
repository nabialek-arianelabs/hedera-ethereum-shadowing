import {
  Client,
  PrivateKey,
  Hbar,
  AccountId,
  AccountCreateTransaction, AccountBalanceQuery, AccountInfoQuery, TransferTransaction,
} from "@hashgraph/sdk"
import {Alchemy, AlchemySettings, Network} from "alchemy-sdk";
import {createWalletClient, http} from "viem";
import {hederaLocalnet} from "./hedera-localnet";
import {privateKeyToAccount} from "viem/accounts";
import {hedera} from "viem/chains";

type HederaAccount = {
  accountId: string;
  publicKey: string;
  privateKey: string;
  ethAddress: string;
};

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA
} satisfies AlchemySettings;
const alchemy = new Alchemy(config);

const accountsMapping = new Map<string, HederaAccount>(); // Map<EthAddress, HederaAccount>
const node = {"127.0.0.1:50211": new AccountId(3)}
const client = Client.forNetwork(node).setMirrorNetwork("127.0.0.1:5600");

//Set the transaction fee paying account
client.setOperator(AccountId.fromString("0.0.2"),PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));

const viem = createWalletClient({
  chain: hederaLocalnet,
  transport: http()
})

async function getHederaAccount(ethAddress: string) {
  const mappedHederaAcc = accountsMapping.get(ethAddress);
  if(mappedHederaAcc) return mappedHederaAcc

  const newAccountPk = PrivateKey.generateECDSA();

  const newAccount = await new AccountCreateTransaction()
      .setKey(newAccountPk)
      .setAlias(`0x${newAccountPk.publicKey.toEvmAddress()}`)
      .setInitialBalance(new Hbar(30))
      .execute(client);

  const newAccountReceipt = await newAccount.getReceipt(client);

  const hederaAccount: HederaAccount = {
    accountId: newAccountReceipt?.accountId?.toString() || "",
    publicKey: newAccountPk.publicKey.toStringRaw(),
    ethAddress: newAccountPk.publicKey.toEvmAddress(),
    privateKey: newAccountPk.toStringRaw(),
  }

  accountsMapping.set(ethAddress, hederaAccount);
  return hederaAccount;
}

async function main() {
  console.log(1)
  const lastBlockNr = await alchemy.core.getBlockNumber();
  console.log(2)
  const block = await alchemy.core.getBlockWithTransactions(lastBlockNr)
  console.log(3)

  await Promise.allSettled(block.transactions.slice(0, 3).map(async (transaction) => {
    try {
      if(!transaction?.to) return

      // Hedera addresses
      const from = await getHederaAccount(transaction.from)
      const to = await getHederaAccount(transaction.to)

      //   const hederaTransaction = await new TransferTransaction()
      //       .addHbarTransfer(from.accountId, new Hbar(-1))
      //       .addHbarTransfer(to.accountId, new Hbar(1))
      //       .freezeWith(client)
      //       .sign(PrivateKey.fromStringED25519(from.pkECDSA))
      //
      // // Submit the transaction to a Hedera network
      //   const txResponse = await hederaTransaction.execute(client)
      //
      // // Request the receipt of the transaction
      //   const receipt = await txResponse.getReceipt(client);
      //
      // // Get the transaction consensus status
      //   const transactionStatus = receipt.status;
      //

      const accountFrom = privateKeyToAccount(`0x${from.privateKey}`)
      // const accountTo = privateKeyToAccount(`0x${to.pkECDSA}`)
      //
      // @ts-ignore
      const request = await viem.prepareTransactionRequest({
        account: accountFrom,
        to: `0x${to.ethAddress}`,
        value: BigInt(1_000_000_000_000_00),
      });
      //
      // // @ts-ignore
      const serializedTransaction = await viem.signTransaction(request);
      //
      const hash = await viem.sendRawTransaction({ serializedTransaction })
      //
      console.log("xdddd", hash)

      // console.log("The transaction consensus status is " +transactionStatus.toString());
    } catch(e) {
      console.error(e)
    }
  }));

  console.log(accountsMapping);
}
void main().catch(console.error);

// import {
//   Alchemy,
//   AlchemySettings,
//   BlockWithTransactions,
//   Network
// } from "alchemy-sdk";
// import * as dotenv from "dotenv";
// import {createPublicClient, createWalletClient, Hex, http} from 'viem'
// import {hederaLocalnet} from "./hedera-localnet";
// import {
//   AccountBalanceQuery,
//   AccountCreateTransaction,
//   AccountId,
//   Client,
//   Hbar,
//   PrivateKey,
//   Transaction, TransferTransaction
// } from "@hashgraph/sdk";
// import { privateKeyToAccount } from 'viem/accounts'
//
// dotenv.config();
// const args = process.argv.slice(2);
// const network = args[0].trim();
// if (!Object.values(Network).includes(network as Network)) {
//   console.log(`Network: ${network}, not supported, list of supported networks: ${Object.values(Network)}`);
//   process.exit(1);
// }

//
// const viemClient = createPublicClient({
//   chain: hederaLocalnet,
//   transport: http(),
// });
//
// const viemWalletClient = createWalletClient({
//   chain: hederaLocalnet,
//   transport: http()
// })
//
//
// const node = {"127.0.0.1:50211": new AccountId(3)}
// const sdkClient = Client.forNetwork(node).setMirrorNetwork("127.0.0.1:5600");
//
// //Set the transaction fee paying account
// sdkClient.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));
//

//
// async function getPrivateKey(ethAddress: string) {
//   const hederaAccount = accountsMapping.get(ethAddress);
//   console.log(hederaAccount, ethAddress)
//
//   if(hederaAccount) {
//     return {
//       pk: PrivateKey.fromStringED25519(hederaAccount.pk),
//       id: hederaAccount.id
//     }
//   }
//
//   const newHederaAccount = await createAndMapHedera(ethAddress);
//   return {
//     pk: PrivateKey.fromStringED25519(newHederaAccount.pk),
//     id: newHederaAccount.id
//   }
// }
//
// (async () => {
//   const newAccountPk = PrivateKey.generateED25519();
//
//   const newAccount = await new AccountCreateTransaction()
//       .setKey(PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"))
//       .setInitialBalance(new Hbar(1))
//       .execute(sdkClient);
//
// //Get receipt
//   const receipt = await newAccount.getReceipt(sdkClient);
//
// //Get the account ID
//   const newAccountId = receipt.accountId;
//   console.log(newAccountId);
//
//   // const nr = await alchemy.core.getBlockNumber();
//   // const transactions = [];
//   //
//   // const block = await alchemy.core.getBlockWithTransactions(nr)
//   //
//   // console.log("start sending transactions")
//   //
//   // const key = await getPrivateKey(block.transactions[0]?.from)
//   // console.log(key)
//
//   // await Promise.allSettled(  block.transactions.map(async (transaction) => {
//   //   if(!transaction?.to) return
//   //
//   //   const fromAccount = await getPrivateKey(transaction.from);
//   //   const toAccount = await getPrivateKey(transaction.to);
//   //
//   //   const hederaTransaction = new TransferTransaction()
//   //       .addHbarTransfer(fromAccount.id, new Hbar(-1))
//   //       .addHbarTransfer(toAccount.id, new Hbar(1));
//   //
//   //   const txResponse = await hederaTransaction.execute(sdkClient);
//   //
//   //   const receipt = await txResponse.getReceipt(sdkClient);
//   //
//   //   const transactionStatus = receipt.status;
//   //
//   //   console.log("The transaction consensus status is " +transactionStatus.toString());
//   // }))
//
//   console.log("Done");
// })();
