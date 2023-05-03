import { constructSetupIxQR, convertStringToSchedule, delegateTransferAuthorityIx, directTransferIx, EXAMPLE_SERVER_URL, setupPaymentIx, signAndSendTransaction, SOLUTIO_PROGRAM_ID } from "@solutio/sdk";
import { useEffect, useRef, useState } from "react";
import { useAnchorProgram } from "@/hooks/solana-hooks";
import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import { PaymentDTO } from "@solutio/sdk";
import { useRouter } from 'next/router';

interface Props {
  apiKey: string
}

export const PaymentDetails = ({ apiKey }: Props) => {
  const program = useAnchorProgram();
  const qrRef = useRef<HTMLDivElement>(null);
  const [paymentData, setPaymentData] = useState<PaymentDTO>();
  const { query } = useRouter();

  // const warnUser = () => {
  //   alert(`
  //     You are about to set up a reocurring payment.
  //     The transaction you are about to sign will approve the program address to 
  //     ${SOLUTIO_PROGRAM_ID.toBase58()} to spend a total of ${paymentData?.delegateAmount}
  //     from the token account you provide. You can revoke this delegation at any 
  //     time at the risk of losing access to the purchased service. Do you wish to proceed? 
  //   `);
  // }

  const sendBrowserTransaction = async () => {
    if (!program || !program.provider.publicKey || !paymentData) {
      throw new Error("Failed to find connected public key. Please connect wallet");
    }

    const {
      paymentId,
      receiver,
      mint,
      amount,
    } = paymentData;

    const ixs: TransactionInstruction[] = [];
    const receiverKey = new PublicKey(receiver);
    const mintKey = new PublicKey(mint);
    const taOwnerKey = program.provider.publicKey;

    // if (threadSchedule && threadSchedule !== "Immediate") {
    //   ixs.push(await delegateTransferAuthorityIx({
    //     taOwner: taOwnerKey,
    //     receiver: receiverKey,
    //     mint: mintKey,
    //     delegateAmount: delegateAmount ?? amount * 6, // Create var in sdk for default subscription period
    //     program
    //   }));
    // }

    // ixs.push(
    //   !threadSchedule || threadSchedule === "Immediate"
    //     ? await directTransferIx({
    //         taOwner: taOwnerKey,
    //         receiver: receiverKey,
    //         mint: mintKey,
    //         amount: amount,
    //         program
    //       })
    //     : await setupPaymentIx({
    //       taOwner: taOwnerKey,
    //       receiver: receiverKey,
    //       mint: mintKey,
    //       transferAmount: amount,
    //       threadTrigger: convertStringToSchedule(threadSchedule),
    //       program
    //     })
    // );

    ixs.push(
      await directTransferIx({
        taOwner: taOwnerKey,
        receiver: receiverKey,
        mint: mintKey,
        amount: amount,
        program
      })       
    );

    const txSig = await signAndSendTransaction(ixs, program.provider);

    console.log(txSig);

    await fetch(`/api/payments/info/`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        txSig,
      })
    });
  }  

  // const displayQrCode = async () => {
  //   if (!paymentData) {
  //     return;
  //   }

  //   const {
  //     receiver,
  //     mint,
  //     amount,
  //     // delegateAmount,
  //     // threadSchedule
  //   } = paymentData;


  //   const qrCode = await constructSetupIxQR({
  //     receiver,
  //     mint,
  //     amount,
  //     threadSchedule: "Immediate",
  //     delegateAmount: undefined,
  //   });

  //   if (qrRef.current) {
  //     qrRef.current.innerHTML = "";
  //     qrCode.append(qrRef.current);
  //   }
  // }

  useEffect(() => {
    const { paymentId, data } = query;

    fetch(`/api/payments/info/?paymentId=${paymentId}&data=${data}`, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
      }
    }).then((res) => {
      res.json().then((data: PaymentDTO) => {
        setPaymentData({
          paymentId: data.paymentId,
          appName: data.appName,
          receiver: data.receiver,
          mint: data.mint,
          amount: data.amount,
        });
      })
    });
  }, [query]);
  
  return (
    <div>
      <h2>You are about to complete payment to {paymentData?.appName}</h2>
      <div>
        <h3>Details</h3>
        <p>Paying {paymentData?.amount} USDC (mint: {paymentData?.mint})</p> {/* Change contract to only accept USDC */}
        <p>To receiver address: {paymentData?.receiver}</p>
        {/* <p>
          This payment 
          {
            !paymentData?.threadSchedule || paymentData?.threadSchedule === "Immediate"
              ? " will be processed immediately"
              : ` will recur ${paymentData?.threadSchedule}`
          }
        </p> */}
      </div>
      <div>
        <button 
          onClick={() => {
            if(!paymentData){
              throw Error("Missing query parametres");
            }

            // if (paymentData.delegateAmount && paymentData.delegateAmount > 0) {
            //   warnUser();
            // }

            sendBrowserTransaction();
          }}
          title="Pay in Browser"
        >Pay in Browser</button>
        {/* <button 
          disabled={true}
          onClick={() => {
            if(!paymentData){
              throw Error("Missing query parametres");
            }

            // if (paymentData?.delegateAmount && paymentData?.delegateAmount > 0) {
            //   warnUser();
            // }

            displayQrCode();
          }}
          title="Pay with Mobile"
        >Pay with Mobile</button> */}
      </div>
      <div>
        <div ref={qrRef}/>
      </div>
    </div>
  );
}