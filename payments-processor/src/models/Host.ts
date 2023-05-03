import { Schema, model, models } from "mongoose";

const hostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true },
  host: { type: String, required: true }
});

export default models.Host || model('Host', hostSchema);