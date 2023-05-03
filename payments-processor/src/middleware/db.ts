import "dotenv/config";
import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from './error';
import { generateApiKey } from './api';
import mongoose from 'mongoose';
import ApiKeyModel from "@/models/ApiKey";
import UserModel from "@/models/User";
import HostModel from "@/models/Host";
import PaymentModel from "@/models/Payment";

let dbConnected = false;

export const connectDB = async () => {
  if (dbConnected) {
    return;
  }
  dbConnected = true;

  if (!process.env.DB_CONNECTION_PROD_URL) {
    throw new Error("Database url not provided");
  }

  await mongoose.connect(process.env.DB_CONNECTION_PROD_URL)
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export const addNewApiKeyRecord = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pubkey, host } = req.body;
  let apiKey = generateApiKey();

  // console.log(pubkey, host);

  const existinUser = await UserModel
    .findOne()
    .where('pubkey')
    .equals(pubkey)
    .exec();

  const userRec = !existinUser
    ? new UserModel({ pubkey: pubkey })
    : existinUser;

  if(!existinUser) {
    await userRec.save();
  }

  const existingHost = await HostModel.findOne()
    .where('user').equals(userRec._id)
    .where('host').equals(host)
    .exec();

  if (existingHost) {
    handleError(res, "User-host combination already exists in database", 400);
    return;
  }

  const hostRec = new HostModel({ host: host, user: userRec._id })
  await hostRec.save();

  while (true) {
    const existingKey = await ApiKeyModel.findOne().where('key').equals(apiKey).exec();
    if (existingKey) {
      apiKey = generateApiKey();
    } else {
      break;
    }
  }

  const apiKeyRec = new ApiKeyModel({ key: apiKey, host: hostRec._id });
  await apiKeyRec.save();

  res.status(200).json({ apiKey });
}

export const findApiEntry = async (apiKey: string, origin: string, res: NextApiResponse) => {
  const existingKey = await ApiKeyModel.findOne().where('key').equals(apiKey).exec();
  
  if (!existingKey) {
    handleError(res, "Provided API key is invalid", 401);
    return false;
  }

  const hostRec = await HostModel.findOne().where('_id').equals(existingKey.host).exec();

  if(hostRec.host !== origin) {
    handleError(res, "Request origin does not match host associated with api key", 401);
    return false;
  }

  return true;
}

export const addNewPaymentEntry = async (paymentId: string, appName: string, receiver: string, mint: string, amount: number, iv: string, authTag: string) => {
  const paymnetRec = new PaymentModel({
    id: paymentId,
    receiver,
    mint,
    amount,
    appName,
    iv,
    authTag,
    complete: false
  });
 
 await paymnetRec.save();
}

export const findPaymentData = async (paymentId: string, res: NextApiResponse) => {
  const paymentRec = await PaymentModel.findOne().where('id').equals(paymentId).exec();

  if (!paymentRec) {
    handleError(res, "Provided payment ID is invalid", 400);
    return;
  }

  return paymentRec;
}

export const updatePaymentStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  const paymentId = req.body.paymentId;
  const txSig = req.body.txSig;

  if (!paymentId || !txSig) {
    handleError(res, "Missing required body parameter", 400);
    return;
  }

  const paymentRec = await PaymentModel.findOne().where('id').equals(paymentId).exec();
  
  // TODO: Verify tx sig?
  paymentRec.complete = true;
  paymentRec.txSig = txSig;
  await paymentRec.save();

  // TODO: Call app api from server?
  res.status(200).send("Payment status updated");
}

export const getPaymentStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  const { paymentId } = req.query;

  if (!paymentId) {
    handleError(res, "Missing a required query parameter", 400);
    return;
  }

  const paymentRec = await PaymentModel.findOne().where('id').equals(paymentId).exec();

  switch (paymentRec.complete) {
    case true:
      res.status(200).json({ processed: true, txSig: paymentRec.txSig })
      break;
    case false:
      res.status(200).json({ processed: false });
  }
}