import { Schema, model } from "mongoose";

const hostSchema = new Schema({
  user: Schema.Types.ObjectId,
  host: { type: String, required: true }
});

export default model('Host', hostSchema);