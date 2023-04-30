import { NextApiRequest, NextApiResponse } from "next";
// import { findApiKeyEntry } from "./db";
import { handleError } from "./error";

export const generateApiKey = () => {
  return [...Array(50)]
    .map((_) => (Math.random() * 36 | 0).toString(36))
    .join('');
}

// export const validateApiKey = (req: NextApiRequest, res: NextApiResponse) => {
//   const providedKey = req.headers.authorization;
//   const origin = req.headers.origin;

//   console.log(origin);

//   if(!providedKey || !origin) {
//     handleError(res, "Unauthorized", 401);
//     return;
//   }

//   findApiKeyEntry(providedKey, res);

// }