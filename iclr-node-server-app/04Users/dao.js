import mongoose from "mongoose";
import userSchema from "./schema.js";

export const createUser = (user) => {
  delete user._id;
  return model.create(user);
}

const model = mongoose.model("users", userSchema);

export const findUserByUsername = (username) =>  model.findOne({ username: username });
export const checkUsernameExists = (username, userId) => 
  model.findOne({ username: username, _id: { $ne: userId } });
  
export const findUserByCredentials = async (username, password) => {
  const user = await model.findOne({ username, password });
  return user;
};

export const updateUser = (userId, user) => model.updateOne({ _id: userId }, { $set: user });
export const deleteUser = (userId) => model.deleteOne({ _id: userId });
export const findAllUsers = () => model.find();
export const findUserById = (userId) =>  model.findById(userId)
export const findUsersByRole = (role) => model.find({ role: role });
