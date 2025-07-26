import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { FaRegStar } from "react-icons/fa6";

const formatDate = (date: any) => {
  if (!date) return "";
  const d = new Date(date);
  d.setDate(d.getDate() + 1); 
  
  let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
};

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState({ 
    _id: "", 
    username: "", 
    password: "", 
    firstName: "", 
    lastName: "", 
    dob: "", 
    email: "", 
    role: "",
    nickName: "",
    description: ""
  });
  const [pmt, setPmt] = useState("");
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [error, setError] = useState("");
  const [complete, setComplete] = useState("");

  const onChangeDate = (e: any) => {
    const inputDate = new Date(e.target.value);
    const formattedDate = formatDate(inputDate);
    setProfile({ ...profile, dob: formattedDate });
  };

  const auth = (profile: any) => {
    if (profile.role === "ADMIN") {
      setIsAdmin(true);
    } else if (profile.role === "OWNER") {
      setIsOwner(true);
    }
  }

  useEffect(() => {
    if (user) {
      setProfile({ 
        _id: user._id,
        username: user.username,
        password: "",
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob || "",
        email: user.email,
        role: user.role,
        nickName: user.nickName || "",
        description: user.description || ""
      });
      auth(user);
    }
  }, [user]);

  const updateUser = async () => {
    try {
      const response = await axios.put(`/api/users/${profile._id}`, profile);
      const updatedUser = response.data;
      setError("");
      setComplete("Profile successfully updated.");
    } catch (err: any) {
      setComplete("");
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const updateRole = async () => {
    try {
      if (pmt) {
        const updated = { ...profile, role: "OWNER" };
        const response = await axios.put(`/api/users/${profile._id}`, updated);
        const userData = response.data;
        setProfile(updated);
        setError("");
        setComplete("User successfully upgraded.");
      }
    } catch (err: any) {
      setComplete("");
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleSignout = async () => {
    try {
      await axios.post('/api/user/signout');
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      logout();
      navigate("/User/Signin");
    }
  };

  if (!isAuthenticated) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>Profile</h3>
              <div>
                <button className="btn btn-outline-danger me-2" onClick={handleSignout}>
                  Sign Out
                </button>
                <Link to="/Home" className="btn btn-outline-primary">
                  Home
                </Link>
              </div>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {complete && <div className="alert alert-success">{complete}</div>}
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={profile.password}
                    onChange={(e) => setProfile({...profile, password: e.target.value})}
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={profile.dob}
                    onChange={onChangeDate}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.role}
                    readOnly
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={updateUser}>
                  Update Profile
                </button>
                
                {profile.role === "USER" && (
                  <div>
                    <select 
                      className="form-select d-inline-block w-auto me-2"
                      value={pmt}
                      onChange={(e) => setPmt(e.target.value)}
                    >
                      <option value="">Select Payment</option>
                      <option value="credit">Credit Card</option>
                      <option value="debit">Debit Card</option>
                    </select>
                    <button className="btn btn-warning" onClick={updateRole}>
                      Upgrade to Owner
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="mt-4">
                  <Link to="/User/Admin/Users" className="btn btn-success me-2">
                    Manage Users
                  </Link>
                  <Link to="/User/Admin/Review" className="btn btn-info">
                    Review Claims
                  </Link>
                </div>
              )}

              {isOwner && (
                <div className="mt-4">
                  <Link to={`/User/Owner/${profile._id}/Claims`} className="btn btn-warning">
                    Manage Claims
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
