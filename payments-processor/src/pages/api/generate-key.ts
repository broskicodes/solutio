import { addNewApiKeyRecord, connectDB } from "@/server-middleware/db";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectDB();
  console.log(req.method)

  switch (req.method) {
    case "GET":
      res.status(200).send("Pong");
      break;
    case "POST": {
      await addNewApiKeyRecord(req, res);
      break;
    }
    default:
      res.status(403).send("Action not permitted");
  }
}

export default handler;