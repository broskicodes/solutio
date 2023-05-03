import { validateApiKey } from "@/middleware/api";
import { connectDB, getPaymentStatus } from "@/middleware/db";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectDB();

  switch (req.method) {
    case "OPTIONS":
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization');

      res.status(200).send('OK.');
      break;
    case "GET": {
      if (!(await validateApiKey(req, res))) {
        return;
      }

      await getPaymentStatus(req, res);

      break;
    }
    default:
      res.status(405).send("Action not permitted");
  }
}

export default handler;