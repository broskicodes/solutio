import { Program, BN, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import solutioIdl from "@solutio/sdk/dist/SolutioIDL.json";
import {
  getThreadPDA,
  airdrop,
  getTokenAuthPDA,
  SOLUTIO_PROGRAM_ID,
  getThreadAuthorityPDA,
  sleep,
  setupPaymentIx,
  updatePaymentIx,
  cancelPaymentIx,
  delegateTransferAuthorityIx,
  convertStringToSchedule,
  directTransferIx,
  getProgramAsSignerPDA
} from "@solutio/sdk";
import { assert } from "chai";
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintTo,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import "dotenv/config";
import { sendTx } from "../utils";

describe("e2e thread tests", () => {
  const program = new Program(
    solutioIdl as Idl,
    SOLUTIO_PROGRAM_ID,
    AnchorProvider.env()
  );

  it("deleagte -> direct transfer -> setup -> update -> deposit -> cancel", async () => {
    const MINT_DECIMALS = 3;
    const TA_BAL = new BN(1000);
    const THREAD_ID = 0; // 0 is default first thread id

    const caller = Keypair.generate();
    const receiver = Keypair.generate();
    const amount = new BN(100);
    const newAmount = new BN(250);

    await airdrop(
      program.provider.connection,
      caller.publicKey,
      1 * LAMPORTS_PER_SOL,
    );

    const mint = await createMint(
      program.provider.connection,
      caller,
      caller.publicKey,
      caller.publicKey,
      MINT_DECIMALS
    );

    const ta = await createAssociatedTokenAccount(
      program.provider.connection,
      caller,
      mint,
      caller.publicKey
    );

    const receiverTa = await createAssociatedTokenAccount(
      program.provider.connection,
      caller,
      mint,
      receiver.publicKey
    );

    const [programSigner] = getProgramAsSignerPDA();
    await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      caller,
      mint,
      programSigner,
      true
    );

    const [taAuth] = getTokenAuthPDA(caller.publicKey, ta, receiverTa);
    const [threadAuth] = getThreadAuthorityPDA(caller.publicKey);
    const [thread] = getThreadPDA(threadAuth, THREAD_ID);

    await mintTo(program.provider.connection, caller, mint, ta, caller, TA_BAL.muln(Math.pow(10, MINT_DECIMALS)).toNumber());

    const ix1 = await delegateTransferAuthorityIx(
      {
        taOwner: caller.publicKey,
        receiver: receiver.publicKey,
        mint,
        delegateAmount: TA_BAL,
        program
      }
    );

    await sendTx(program.provider.connection, [ix1], [caller]);
    await sleep(1);

    const ix1_5 = await directTransferIx({
        taOwner: caller.publicKey,
        receiver: receiver.publicKey,
        mint,
        amount,
        program
    });

    await sendTx(program.provider.connection, [ix1_5], [caller]);

    const tknAcntData = await getAccount(program.provider.connection, ta);

    // assert(taAuth.equals(tknAcntData.delegate), "Incoreect delegate");
    // assert(
    //   TA_BAL.eq(new BN(tknAcntData.delegatedAmount.toString())),
    //   "Incorrect delegate amount"
    // );

    const beforeBal = new BN(
      (
        await getAccount(program.provider.connection, receiverTa)
      ).amount.toString()
    );

    const ix2 = await setupPaymentIx({
      taOwner: caller.publicKey,
      receiver: receiver.publicKey,
      mint,
      transferAmount: amount,
      threadTrigger: convertStringToSchedule("Immediate"),
      program
    });

    await sendTx(program.provider.connection, [ix2], [caller]);

    console.log("Sleeping for 6 seconds...");
    await sleep(6);
    console.log("Done");

    const afterBal = new BN(
      (
        await getAccount(program.provider.connection, receiverTa)
      ).amount.toString()
    );
    // assert(
    //   afterBal.eq(beforeBal.add(amount)),
    //   `Incorrect balance, ${afterBal.toString()} ${beforeBal.add(amount)}`
    // );

    const ix3 = await updatePaymentIx({
      taOwner: caller.publicKey,
      receiver: receiver.publicKey,
      mint,
      threadId: THREAD_ID,
      program,
      newAmount,
      newSchedule: null
  });

    await sendTx(program.provider.connection, [ix3], [caller]);

    console.log("Sleeping for 5 seconds...");
    await sleep(5);
    console.log("Done");

    const afterUpdateBal = new BN(
      (
        await getAccount(program.provider.connection, receiverTa)
      ).amount.toString()
    );
    // assert(
    //   afterUpdateBal.eq(afterBal.add(newAmount)),
    //   `Incorrect balance, ${afterUpdateBal.toString()} ${afterBal.add(
    //     newAmount
    //   )}`
    // );

    // await program.methods
    //   .depositToPaymentThread()

    let threadAcnt = await program.provider.connection.getAccountInfo(thread);
    // assert(threadAcnt !== null, "Thread account should not be null");

    const ix4 = await cancelPaymentIx({
      taOwner: caller.publicKey,
      receiver: receiver.publicKey,
      mint,
      threadId: THREAD_ID,
      program
    });

    await sendTx(program.provider.connection, [ix4], [caller]);
    await sleep(1);

    threadAcnt = await program.provider.connection.getAccountInfo(thread);
    // assert(threadAcnt === null, "Thread account should be null");
  });
});
