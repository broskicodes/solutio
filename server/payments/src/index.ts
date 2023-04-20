import express, { Request, Response } from "express";
import { renderToString } from "react-dom/server";
import App from "../../../payment-processor/src/App";
import "dotenv/config";
import { createElement } from "react";

const app = express();

app.get("/", (req: Request, res: Response) => {
  const html = renderToString(createElement(App));
  res.send(html);
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`)
});