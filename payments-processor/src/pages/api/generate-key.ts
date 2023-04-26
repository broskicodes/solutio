import { addNewApiKeyRecord } from "@/server-middleware/db";
import { NextApiRequest, NextApiResponse } from "next";

const handler = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log(req.method)

  switch (req.method) {
    case "GET":
      res.status(200).send("Pong");
      break;
    case "POST": {
      const apiKey = addNewApiKeyRecord(req, res);
      res.send(apiKey);
      break;
    }
    default:
      res.status(403).send("Action not permitted");
  }
}

export default handler;