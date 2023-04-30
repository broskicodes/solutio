import { Schema, model } from "mongoose";

const apiKeySchema = new Schema({
  key: { type: String, required: true },
  host: Schema.Types.ObjectId,
});

export default model('ApiKey', apiKeySchema);