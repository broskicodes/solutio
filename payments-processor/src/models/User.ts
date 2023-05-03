import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  pubkey: { type: String, required: true }
});

export default models.User || model('User', userSchema);