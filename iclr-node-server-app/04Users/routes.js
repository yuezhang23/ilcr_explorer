import axios from "axios";
import * as dao from "./dao.js";

axios.defaults.withCredentials = true;

export default function UserRoutes(app) {

  const createUser = async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: 'User must have unique username and a password/first name/last name.' });
    }
  };

  const profile = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await dao.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile' });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const status = await dao.deleteUser(req.params.userId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  };

  const signin = async (req, res) => {
    try {
      const { username, password } = req.body;
      const currentUser = await dao.findUserByCredentials(username, password);
      
      if (currentUser) {
        res.json({ user: currentUser });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Authentication error" });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const newUser = req.body;
      
      if (!newUser.username || !newUser.password || newUser.username.trim() === "" 
        || newUser.firstName.trim() === "" || newUser.lastName.trim() === "" || newUser.email.trim() === "") {
        throw new Error("Username, password, first and last name and email are required.");
      }
      
      const existingUser = await dao.checkUsernameExists(newUser.username, newUser._id);
      if (existingUser) {
        throw new Error("Username already exists.");
      }  
      
      const status = await dao.updateUser(userId, req.body);
      const currentUser = await dao.findUserById(userId);
      res.json(currentUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    } 
  };

  const findAllUsers = async (req, res) => {
    try {
      const { role } = req.query;
      if (role) {
        const users = await dao.findUsersByRole(role);
        res.json(users);
        return;
      }
      const users = await dao.findAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  };

  const findUserById = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await dao.findUserById(userId);
      if (!user) {
        throw new Error("No user with this ID");
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const signup = async (req, res) => {
    try {
      const newUser = req.body;
      
      if (!newUser.username || !newUser.password || newUser.username.trim() === "" 
        || newUser.firstName.trim() === "" || newUser.lastName.trim() === "" || newUser.email.trim() === "") {
        throw new Error("Username, password, first and last name and email are required");
      }
      
      const user = await dao.findUserByUsername(req.body.username);
      if (user) {
        throw new Error("Username already taken");
      }
      
      const currentUser = await dao.createUser(newUser);
      res.json({ user: currentUser });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const signout = (req, res) => {
    res.json({ message: 'Successfully signed out' });
  };

  app.post("/api/user/signin", signin);
  app.post("/api/user/signout", signout);
  app.get("/api/user/profile/:userId", profile);
  app.post("/api/user/signup", signup);

  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
}