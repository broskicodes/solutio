import { Schema, model, models } from "mongoose";

const apiKeySchema = new Schema({
  key: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, required: true },
});

export default models.ApiKey || model('ApiKey', apiKeySchema);