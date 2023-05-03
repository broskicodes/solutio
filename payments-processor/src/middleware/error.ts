import { NextApiResponse } from "next";

export const handleError = (res: NextApiResponse, msg: string, status: number = 500) => {
  res.status(status).send(msg);
}
