import { NextApiRequest, NextApiResponse } from "next";

const handler = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  switch (req.method) {
    case "GET":
      res.status(200).send("Server is currently running");
    case "POST": {
      
    }
  }

}



export default handler;