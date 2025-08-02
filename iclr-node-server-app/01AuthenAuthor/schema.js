import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  brewery_ref: { type: String, required: true },
  brewery_name: String,
  legalName: { type: String, required: true },
  additional: String,
  completed: Boolean,
  approved: Boolean,
  },
  { collection: "claims" });

export default claimSchema;