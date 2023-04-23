// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

const storage: Map<string, { dog: Data | undefined, cat: Data | undefined }> = new Map();

type Data = {
  processed: boolean;
  sig?: string
};

const dogPayment = {
  processed: false,
  sig: undefined
}
const catPayment = {
  processed: false,
  sig: undefined
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req.method, req.query.token)
  if (req.method === 'GET') {
    const tkn: string = req.query.token as string;

    req.query.id === '1'
      ? res.status(200).json(storage.get(tkn)?.dog ?? { processed: false })
      : res.status(200).json(storage.get(tkn)?.cat ?? { processed: false })
  } else if (req.method === 'POST') {
    const tkn: string = req.query.token as string;
    const curr = storage.get(tkn);

    if (req.query.id === '1') {
      curr 
        ? storage.set(tkn, { dog: { processed: true, sig: req.body.txSig }, cat: curr.cat })
        : storage.set(tkn, { dog: { processed: true, sig: req.body.txSig }, cat: undefined })
    } else {
      curr 
        ? storage.set(tkn, { cat: { processed: true, sig: req.body.txSig }, dog: curr.dog })
        : storage.set(tkn, { cat: { processed: true, sig: req.body.txSig }, dog: undefined })
    }

    res.status(200).json({ processed: true });
  } else if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.send({ processed: false });
  } else {
    res.status(405).send({ processed: false });
  }
}
