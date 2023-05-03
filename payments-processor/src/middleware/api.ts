import "dotenv/config";
import { NextApiRequest, NextApiResponse } from "next";
import { addNewPaymentEntry, findApiEntry, findPaymentData } from "./db";
import { handleError } from "./error";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { AUTH_TAG_LENGTH, SERVER_URL, USDC_MINT_ADDRESS } from "@/utils/constants";
import { parseSecretKey } from "@/utils/helpers";

export const generateApiKey = (length: number = 50) => {
  return randomBytes(length).toString('base64')
}

export const validateApiKey = async (req: NextApiRequest, res: NextApiResponse) => {
  const providedKey = req.headers.authorization;
  const origin = req.headers.origin;

  // console.log(origin, providedKey);

  if(!providedKey || !origin) {
    handleError(res, "Missing required headers", 400);
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);

  return await findApiEntry(providedKey, origin, res);
}

export const validateServerApiKey = async (req: NextApiRequest, res: NextApiResponse) => {
  // if (!(await validateApiKey(req, res))) {
  //   return false;
  // }

  const providedKey = req.headers.authorization;

  if (providedKey !== process.env.SERVER_API_KEY) {
    handleError(res, "Unauthorized. Only the server can make this request", 401);
    return false;
  }

  return true;
}

export const generatePaymentLink = async (req: NextApiRequest, res: NextApiResponse) => {
  const amount = req.body.amount;
  const receiver = req.body.receiver;
  const appName = req.body.appName

  if (!amount || !receiver || !appName) {
    handleError(res, "Missing a required body parameter", 400);
    return;
  }

  const paymentId = randomBytes(20).toString('hex');
  const plaintext = `${paymentId}:${appName}:${receiver}:${USDC_MINT_ADDRESS}:${amount}`;

  if (!process.env.SECRET_KEY) {
    handleError(res, "Encryption Failed", 500);
    return;
  }

  const iv = randomBytes(12).toString('hex');

  const cipher = createCipheriv('aes-256-ocb', parseSecretKey(process.env.SECRET_KEY), Buffer.from(iv, 'hex'), { authTagLength: AUTH_TAG_LENGTH });
  const ciphertext = `${cipher.update(plaintext, 'utf-8', 'hex')}${cipher.final('hex')}`;

  const authTag = cipher.getAuthTag().toString('hex');

  await addNewPaymentEntry(paymentId, appName, receiver, USDC_MINT_ADDRESS, amount, iv, authTag) ;

  res.status(200).json({ id: paymentId, url: `${SERVER_URL}/pay?paymentId=${paymentId}&data=${ciphertext}`});
}

export const decipherPaymentData = async (req: NextApiRequest, res: NextApiResponse) => {
  const ciphertext = req.query.data;
  const paymentId = req.query.paymentId;

  if (!ciphertext || !paymentId) {
    handleError(res, "Missing request data", 400);
    return;
  }

  if (!process.env.SECRET_KEY) {
    handleError(res, "Decryption Failed", 500);
    return;
  }

  const paymentRec = await findPaymentData(paymentId as string, res)

  if (!paymentRec) {
    return;
  }

  const decipher = createDecipheriv('aes-256-ocb', parseSecretKey(process.env.SECRET_KEY), Buffer.from(paymentRec.iv, 'hex'), { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(Buffer.from(paymentRec.authTag, 'hex'));
  const plaintext = `${decipher.update(ciphertext as string, 'hex', 'utf-8')}${decipher.final('utf-8')}`;

  const data = plaintext.split(':');

  if (data.length < 5) {
    handleError(res, "Provided paymnet data is invalid", 400);
    return;
  }

  if (paymentId !== data[0]) {
    handleError(res, "Payment ID does not match decrypted data", 400);
    return;
  }

  res.status(200).json({
    paymentId: data[0],
    appName: data[1],
    receiver: data[2],
    mint: data[3],
    amount: Number(data[4]),
  })
}