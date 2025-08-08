import mongoose from "mongoose";
import claimSchema from "./schema.js";

const model = mongoose.model("claims", claimSchema);

export default model;