import {
    Client,
    PrivateKey,
    Hbar,
    AccountId,
    AccountCreateTransaction
} from "@hashgraph/sdk"
import {Alchemy, AlchemySettings, Network} from "alchemy-sdk";
import {createWalletClient, http} from "viem";
import {hederaLocalnet} from "./hedera-localnet";
import {privateKeyToAccount} from "viem/accounts";
import "dotenv/config"

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
client.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));

const viem = createWalletClient({
    chain: hederaLocalnet,
    transport: http()
})

async function getHederaAccount(ethAddress: string) {
    const mappedHederaAcc = accountsMapping.get(ethAddress);
    if (mappedHederaAcc) return mappedHederaAcc

    const newAccountPk = PrivateKey.generateECDSA();

    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPk)
        .setAlias(`0x${newAccountPk.publicKey.toEvmAddress()}`)
        .setInitialBalance(new Hbar(100000))
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
    const lastBlockNr = await alchemy.core.getBlockNumber();
    const block = await alchemy.core.getBlockWithTransactions(lastBlockNr)

    await Promise.allSettled(block.transactions.slice(0, 3).map(async (transaction) => {
        try {
            if (!transaction?.to) return

            const from = await getHederaAccount(transaction.from)
            const to = await getHederaAccount(transaction.to)

            const accountFrom = privateKeyToAccount(`0x${from.privateKey}`)

            // @ts-ignore
            const request = await viem.prepareTransactionRequest({
                account: accountFrom,
                to: `0x${to.ethAddress}`,
                value: transaction.value,
            });

            // @ts-ignore
            const serializedTransaction = await viem.signTransaction(request);

            const hash = await viem.sendRawTransaction({serializedTransaction})

            console.log("txHash:", hash)

        } catch (e) {
            console.error(e)
        }
    }));

    console.log(accountsMapping);
}

void main().catch(console.error).finally(() => process.exit());
