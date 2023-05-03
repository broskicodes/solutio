import { decipherPaymentData, validateServerApiKey } from "@/middleware/api";
import { connectDB, updatePaymentStatus } from "@/middleware/db";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectDB();

  switch (req.method) {
    case "GET":
      if (!(await validateServerApiKey(req, res))) {
        return;
      }
      
      await decipherPaymentData(req, res);

      break;
    case "POST": {
      if (!(await validateServerApiKey(req, res))) {
        return;
      }
      
      await updatePaymentStatus(req, res);

      break;
    }
    default:
      res.status(405).send("Action not permitted");
  }
}

export default handler;