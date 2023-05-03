import { PAYMENTS_SERVER_URL } from "../utils";
import { PaymentLink } from "./model";

export const generateNewPaymentLink = async (apiKey: string, appName: string, receiver: string, amount: number): Promise<PaymentLink> => {
  const res = await fetch(`${PAYMENTS_SERVER_URL}/api/payments/new`, {
    method: 'POST',
    headers: { 
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      receiver,
      appName
    })
  });

  const data = await res.json();

  return data;
}

export const checkPaymentStatus = async (apiKey: string, paymentId: string): Promise<string | undefined> => {
  const res = await fetch(`${PAYMENTS_SERVER_URL}/api/payments/${paymentId}`, {
    method: 'GET',
    headers: { 
      Authorization: apiKey,
    },
  });

  const data = await res.json();

  if (data.processed) {
    return data.txSig;
  } else {
    return undefined;
  }
}