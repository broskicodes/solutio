// import { validateApiKey } from "@/server-middleware/api";
import { NextApiRequest, NextApiResponse } from "next";

const handler = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log(req.method)

  switch (req.method) {
    case "GET":
      // validateApiKey(req, res);
      res.status(200).send("good")
      break;
    case "POST": {
      
      break;
    }
    default:
      res.status(403).send("Action not permitted");
  }
}

export default handler;