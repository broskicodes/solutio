import { TransactionInstruction, Keypair, Connection, Transaction } from "@solana/web3.js";

export const sendTx = async (
  connection: Connection,
  ixs: TransactionInstruction[],
  signers: Keypair[],
) => {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const tx = new Transaction({
    blockhash,
    lastValidBlockHeight,
  });
  tx.add(...ixs);
  tx.sign(...signers);

  return await connection.sendTransaction(tx, signers);
}