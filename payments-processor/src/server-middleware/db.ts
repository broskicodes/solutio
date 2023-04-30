import "dotenv/config";
import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from './error';
import { generateApiKey } from './api';
import mongoose from 'mongoose';
import ApiKeyModel from "@/models/ApiKey";
import UserModel from "@/models/User";
import HostModel from "@/models/Host";

let dbConnected = false;

export const connectDB = async () => {
  if (dbConnected) {
    return;
  }

  if (!process.env.DB_CONNECTION_PROD_URL) {
    throw new Error("Database url not provided");
  }

  await mongoose.connect(process.env.DB_CONNECTION_PROD_URL)
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });

  dbConnected = true;
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
    handleError(res, "User-host combination already exists in database", 403);
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

  res.status(200).send(apiKey);
}