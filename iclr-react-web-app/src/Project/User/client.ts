
import axios from "axios";
axios.defaults.withCredentials = true;

// export const BASE_API = process.env.REACT_APP_API_BASE;
export const USER_API = `/api/user`;
export const USERS_API = `/api/users`;

export interface User { _id: string; username: string; password: string; role: string; email: string;
firstName: string, lastName: string, registerDate?: Date, dob?: Date };

export const createUser = async (user: any) => {
  const response = await axios.post(`${USERS_API}`, user);
  return response.data;
};

export const signin = async (credentials: User) => {
  console.log(credentials)
  const response = await axios.post( `${USER_API}/signin`, credentials );
  return response.data;
};

export const profile = async () => {
  const response = await axios.post(`${USER_API}/profile`);
  return response.data;
};

export const updateUser = async (userId: any, user: any) => {
  const response = await axios.put(`${USERS_API}/${userId}`, user);
  return response.data;
};

export const adminUpdateUser = async (userId: any, user: any) => {
  const response = await axios.put(`${USERS_API}/${userId}/admin`, user);
  return response.data;
};

export const deleteUser = async (user: any) => {
  const response = await axios.delete(
    `${USERS_API}/${user._id}`);
  return response.data;
};

export const findAllUsers = async () => {
  const response = await axios.get(`${USERS_API}`);
  return response.data;
};

export const findUserById = async (userId: any) => {
  const response = await axios.get(`${USERS_API}/${userId}`);
  return response.data;
};

export const findUsersByRole = async (role: any) => {
  const response = await axios.get(`${USERS_API}?role=${role}`);
  return response.data;
};

export const signup = async (user: any) => {
  const response = await axios.post(`${USER_API}/signup`, user);
  return response.data;
};

export const signout = async () => {
  const response = await axios.post(`${USER_API}/signout`);
  return response.data;
};
