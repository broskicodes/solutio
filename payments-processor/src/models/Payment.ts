import { Schema, model, models } from "mongoose";

const paymentSchema = new Schema({
  id: { type: String, required: true },
  receiver: { type: String, required: true },
  mint: { type: String, required: true },
  amount: { type: Number, required: true },
  appName: { type: String, required: true },
  complete: { type: Boolean, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, requried: true },
  txSig: { type: String, required: false },
});

export default models.Payment || model('Payment', paymentSchema);