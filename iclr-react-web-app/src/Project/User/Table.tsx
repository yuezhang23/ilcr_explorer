import React, { useState, useEffect, useCallback } from "react";
import * as client from "./client";
import { User } from "./client";
import { BsFillCheckCircleFill, BsPencil,
  BsTrash3Fill, BsPlusCircleFill } from "react-icons/bs";
import { useNavigate } from "react-router";

export default function UserTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User>({
    _id: "", username: "", password: "", firstName: "", lastName: "", email: "", role: "USER" });
  
  const createUser = async () => {
    try {
      const newUser = await client.createUser(user);
      setUsers([newUser, ...users]);
      alert("Successfully created user")
    } catch (err: any) {
      console.log(err);
      alert(err.response.data)
    }
  };

  const deleteUser = async (user: User) => {
    try {
      await client.deleteUser(user);
      setUsers(users.filter((u) => u._id !== user._id));
      alert("Successfully deleted user")
    } catch (err) {
      console.log(err);
    }
  };

  const selectUser = async (user: User) => {
    try {
      const u = await client.findUserById(user._id);
      setUser(u);
    } catch (err) {
      console.log(err);
    }
  };

  const updateUser = async () => {
    try {
      if (!user._id) {
        throw new Error("first, select an user to update")
      }
      await client.adminUpdateUser(user._id, user);
      setUsers(users.map((u) =>
        (u._id === user._id ? user : u)));
      alert("Successfully updated user")
    } catch (err: any) {
      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
      alert(err.message)
      }
      console.log(err);
    }
  };

  const [role, setRole] = useState("USER");
  const fetchUsersByRole = async (role: string) => {
    const users = await client.findUsersByRole(role);
    setRole(role);
    setUsers(users);
  };

  const fetchUsers = async () => {
    const users = await client.findAllUsers();
    setUsers(users);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const account = await client.profile();
      const user = await client.findUserById(account._id);
      if (!user || user.role !== "ADMIN") {
        alert("Not authorized to see this page")
        navigate("/User/Profile")
      }
    } catch (err) {
      navigate("/User/Profile")
    }
  }, [navigate]);


  useEffect(() => {
    fetchProfile();
    fetchUsers(); 
  }, [fetchProfile]);

  return (
    <div className="container-fluid">
      <div className="row">

        <div className="col">
          <h1>User Table</h1>
        </div>
        <div className="col">
          <select
            onChange={(e) => fetchUsersByRole(e.target.value)}
            value={role || "USER"}
            className="form-select w-25 float-end mt-2">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
        </div>
      </div>

      <div className="table-responsive-sm">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>&nbsp;</th>

          </tr>
          <tr className="align-middle">
            <td>
            <input value={user.username} className="me-2 mb-2" onChange={(e) =>
                setUser({ ...user, username: e.target.value })}
                placeholder="username"/>
            <input value={user.password} type="password" onChange={(e) =>
              setUser({ ...user, password: e.target.value })}
              placeholder="password"/>
            </td>
            <td>
              <input value={user.firstName} onChange={(e) =>
                setUser({ ...user, firstName: e.target.value })}/>
            </td>
            <td>
              <input value={user.lastName} onChange={(e) =>
                setUser({ ...user, lastName: e.target.value })}/>
            </td>
            <td>
              <input value={user.email} onChange={(e) =>
                setUser({ ...user, email: e.target.value })}/>
            </td>
            <td>
              <select className="me-2 mb-1" value={user.role} onChange={(e) =>
                setUser({ ...user, role: e.target.value })}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Owner</option>
              </select>   
            </td>
            <td>
              <BsFillCheckCircleFill type="button"
                onClick={updateUser} className="me-2 text-success fs-1 text"/>
              <BsPlusCircleFill type="button" className="fs-1 text-success" onClick={createUser}/>
            </td>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user._id} className="align-middle">
              <td>{user.username}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="btn btn-danger me-2 mb-1" onClick={() => deleteUser(user)}>
                  <BsTrash3Fill />
                </button>
                <button className="btn btn-warning me-2" onClick={() => selectUser(user)}>
                  <BsPencil />
                </button>
              </td>
            </tr>))}
        </tbody>
      </table>
      </div>
    </div>
  );
}