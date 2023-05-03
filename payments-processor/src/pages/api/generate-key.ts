import { addNewApiKeyRecord, connectDB } from "@/middleware/db";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectDB();
  console.log(req.method)

  switch (req.method) {
    case "POST": {
      await addNewApiKeyRecord(req, res);
      break;
    }
    default:
      res.status(405).send("Action not permitted");
  }
}

export default handler;