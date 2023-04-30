import { Schema, model } from "mongoose";

const userSchema = new Schema({
  pubkey: { type: String, required: true }
});

export default model('User', userSchema);