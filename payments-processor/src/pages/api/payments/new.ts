import { generatePaymentLink, validateApiKey } from "@/middleware/api";
import { connectDB } from "@/middleware/db";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectDB();

  switch (req.method) {
    case "OPTIONS":
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      res.status(200).send('OK.');
      break;
    case "POST": {
      if (!(await validateApiKey(req, res))) {
        return;
      }

      // TODO: Verify that receiver is associated with api key

      await generatePaymentLink(req, res);
      break;
    }
    default:
      res.status(405).send("Action not permitted");
  }
}

export default handler;