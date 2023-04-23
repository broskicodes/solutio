import { constructSetupIxQR, convertStringToSchedule, delegateTransferAuthorityIx, directTransferIx, EXAMPLE_SERVER_URL, setupPaymentIx, signAndSendTransaction, SOLUTIO_PROGRAM_ID } from "@solutio/sdk";
import { useEffect, useRef, useState } from "react";
import { useAnchorProgram } from "../hooks/solana-hooks";
import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { ConvertableString } from "@solutio/sdk";
import { useLocation } from 'react-router-dom';

interface ExpectedPaymentParams {
  appName: string;
  id: string;
  msg?: string | null;
  receiver: string;
  mint: string;
  amount: number;
  threadSchedule?: ConvertableString;
  delegateAmount?: number;
}

//?appName=Example&receiver=BtdMgTGPjwyaoXYjyniQ9FdUWjPXJkFArCAN61Ectubt&mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1&id=1

export const PaymentDetails = () => {
  const program = useAnchorProgram();
  const qrRef = useRef<HTMLDivElement>(null);
  const { search } = useLocation();
  const [params, setParams] = useState<ExpectedPaymentParams>();
  // const txSigRef = useRef<string | undefined>('');

  const warnUser = () => {
    alert(`
      You are about to set up a reocurring payment.
      The transaction you are about to sign will approve the program address to 
      ${SOLUTIO_PROGRAM_ID.toBase58()} to spend a total of ${params?.delegateAmount}
      from the token account you provide. You can revoke this delegation at any 
      time at the risk of losing access to the purchased service. Do you wish to proceed? 
    `);
  }

  const sendBrowserTransaction = async () => {
    if (!program || !program.provider.publicKey || !params) {
      throw new Error("Failed to find connected public key. Please connect wallet");
    }

    const {
      id,
      msg,
      receiver,
      mint,
      amount,
      delegateAmount,
      threadSchedule
    } = params;

    const ixs: TransactionInstruction[] = [];
    const receiverKey = new PublicKey(receiver);
    const mintKey = new PublicKey(mint);
    const taOwnerKey = program.provider.publicKey;

    if (threadSchedule && threadSchedule !== "Immediate") {
      ixs.push(await delegateTransferAuthorityIx({
        taOwner: taOwnerKey,
        receiver: receiverKey,
        mint: mintKey,
        delegateAmount: delegateAmount ?? amount * 6, // Create var in sdk for default subscription period
        program
      }));
    }

    ixs.push(
      !threadSchedule || threadSchedule === "Immediate"
        ? await directTransferIx({
            taOwner: taOwnerKey,
            receiver: receiverKey,
            mint: mintKey,
            amount: amount,
            program
          })
        : await setupPaymentIx({
          taOwner: taOwnerKey,
          receiver: receiverKey,
          mint: mintKey,
          transferAmount: amount,
          threadTrigger: convertStringToSchedule(threadSchedule),
          program
        })
    );

    const txSig = await signAndSendTransaction(ixs, program.provider);

    console.log(txSig);
    // Hard code api url until I can fetch by appName/addId
    await fetch(`${EXAMPLE_SERVER_URL}/api/isPaymentProcessed?id=${id}&token=${msg}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txSig })
    });
  }
  

  const displayQrCode = async () => {
    if (!params) {
      return;
    }

    const {
      receiver,
      mint,
      amount,
      delegateAmount,
      threadSchedule
    } = params;


    const qrCode = await constructSetupIxQR({
      receiver,
      mint,
      amount,
      threadSchedule: threadSchedule ?? "Immediate",
      delegateAmount,
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCode.append(qrRef.current);
    }
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(search);

    setParams({
      appName: queryParams.get('appName') as string,
      id: queryParams.get('id') as string,
      receiver: queryParams.get('receiver') as string,
      mint: queryParams.get('mint') as string,
      amount: Number(queryParams.get('amount')),
      threadSchedule: queryParams.get('threadSchedule') as ConvertableString ?? undefined,
      delegateAmount: Number(queryParams.get('delegateAmount')) ?? undefined,
      msg: queryParams.get('msg'),
    })

  }, [search])
  
  return (
    <div>
      <h2>You are about to complete payment to {params?.appName}</h2>
      <div>
        <h3>Details</h3>
        <p>Paying {params?.amount} USDC (mint: {params?.mint})</p> {/* Change contract to only accept USDC */}
        <p>To receiver address: {params?.receiver}</p>
        <p>
          This payment 
          {
            !params?.threadSchedule || params?.threadSchedule === "Immediate"
              ? " will be processed immediately"
              : ` will recur ${params?.threadSchedule}`
          }
        </p>
      </div>
      <div>
        <button 
          onClick={() => {
            if(!params){
              throw Error("Missing query parametres");
            }

            if (params.delegateAmount && params.delegateAmount > 0) {
              warnUser();
            }

            sendBrowserTransaction();
          }}
          title="Pay in Browser"
        >Pay in Browser</button>
        <button 
          disabled={true}
          onClick={() => {
            if(!params){
              throw Error("Missing query parametres");
            }

            if (params?.delegateAmount && params?.delegateAmount > 0) {
              warnUser();
            }

            displayQrCode();
          }}
          title="Pay with Mobile"
        >Pay with Mobile</button>
      </div>
      <div>
        <div ref={qrRef}/>
      </div>
    </div>
  );
}