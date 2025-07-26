import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: String },
    nickName: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "USER", "OWNER"],
      default: "USER",
    },
    description: String,
  },
  { collection: "users" });

export default userSchema;