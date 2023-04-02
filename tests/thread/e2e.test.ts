import { Program, BN, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import autopayIdl from "../../target/idl/autopay.json";
import {
  getThreadPDA,
  airdrop,
  getTokenAuthPDA,
  AUTOPAY_PROGRAM_ID,
  getThreadAuthorityPDA,
  sleep,
  setupPayment,
  updatePayment,
  cancelPayment,
  delegateTransferAuthority,
} from "@autopay/sdk";
import { assert } from "chai";
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintTo,
} from "@solana/spl-token";
import "dotenv/config";

describe("e2e thread tests", () => {
  const program = new Program(
    autopayIdl as Idl,
    AUTOPAY_PROGRAM_ID,
    AnchorProvider.env()
  );

  it("deleagte -> setup -> update -> deposit -> cancel", async () => {
    const MINT_DECIMALS = 9;
    const TA_BAL = new BN(10000 * MINT_DECIMALS);
    const THREAD_ID = new BN(0); // 0 is default first thread id

    const caller = Keypair.generate();
    const receiver = Keypair.generate();
    const amount = new BN(100 * MINT_DECIMALS);
    const newAmount = new BN(250 * MINT_DECIMALS);

    await airdrop(
      caller.publicKey,
      10 * LAMPORTS_PER_SOL,
      program.provider.connection
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

    const [taAuth] = getTokenAuthPDA(caller.publicKey, ta, receiverTa);
    const [threadAuth] = getThreadAuthorityPDA(caller.publicKey);
    const [thread] = getThreadPDA(threadAuth, THREAD_ID);

    await mintTo(program.provider.connection, caller, mint, ta, caller, TA_BAL);

    await delegateTransferAuthority(
      caller,
      receiver.publicKey,
      mint,
      TA_BAL,
      program
    );

    const tknAcntData = await getAccount(program.provider.connection, ta);

    assert(taAuth.equals(tknAcntData.delegate), "Incoreect delegate");
    assert(
      TA_BAL.eq(new BN(tknAcntData.delegatedAmount)),
      "Incorrect delegate amount"
    );

    const beforeBal = new BN(
      (
        await getAccount(program.provider.connection, receiverTa)
      ).amount.toString()
    );

    await setupPayment(
      caller,
      caller,
      receiver.publicKey,
      mint,
      amount,
      THREAD_ID,
      { cron: { scheduleStr: "*/5 * * * * * *" } },
      program
    );

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

    await updatePayment(
      caller,
      caller,
      receiver.publicKey,
      mint,
      THREAD_ID,
      program,
      newAmount,
      null
    );

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
    assert(threadAcnt !== null, "Thread account should not be null");

    await cancelPayment(
      caller,
      caller,
      receiver.publicKey,
      mint,
      THREAD_ID,
      program
    );

    threadAcnt = await program.provider.connection.getAccountInfo(thread);
    assert(threadAcnt === null, "Thread account should be null");
  });
});
