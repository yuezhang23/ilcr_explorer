import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authStyles, getButtonHoverStyle } from "./styles/authStyles";

const adminCode = "ADMIN";

export default function Signup() {
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [isOwner, setIsOwner] = useState("");
  const [pmt, setPmt] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ 
    username: "", 
    password: "", 
    firstName: "", 
    lastName: "", 
    email: "", 
    dob: "", 
    nickName: "", // Added nickName field
    role: "USER"
  });
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!user.username || !user.password || !user.firstName || !user.lastName || !user.email || !user.nickName) {
      setError("All required fields must be filled");
      return;
    }

    if (user.role === "AUTHOR" && !pmt) {
      setError("Select a valid payment.");
      setUser({...user, role: "USER"});
      setIsOwner("");
      setIsAdmin("");
      return;
    } else if (user.role === "ADMIN" && code !== adminCode) { // TODO: remove this
      setError("Enter a valid admin code to register as an admin.");
      setIsAdmin("");
      setIsOwner("");
      setUser({...user, role: "USER"});
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signup(user);
      navigate("/User/Signin");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmRole = (r: string) => {
    if (r === "OWNER") {
      setIsAdmin("");
      setIsOwner("Please set up your payment to upgrade as a owner user:");
    } else {
      setIsAdmin("");
      setIsOwner("");
    }
    setUser({...user, role: r}) 
  }

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.header.title}>
          Create Account
        </div>
        <div style={authStyles.header.subtitle}>
          Join our community and start exploring
        </div>
        
        {error && (
          <div style={authStyles.alert.error}>
            {error}
          </div>
        )}
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            Username
          </label>
          <input
            style={authStyles.form.input}
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Choose a username"
            required
            disabled={loading}
          />
        </div>
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            Password
          </label>
          <input
            type="password"
            style={authStyles.form.input}
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Create a secure password"
            required
            disabled={loading}
          />
        </div>
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            Email
          </label>
          <input
            type="email"
            style={authStyles.form.input}
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Enter your email address"
            disabled={loading}
          />
        </div>
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            Nickname
          </label>
          <input
            type="text"
            style={authStyles.form.input}
            value={user.nickName}
            onChange={(e) => setUser({ ...user, nickName: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Enter your nickname"
            required
            disabled={loading}
          />
        </div>
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            First Name
          </label>
          <input
            type="text"
            style={authStyles.form.input}
            value={user.firstName}
            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Enter your first name"
            required
            disabled={loading}
          />
        </div>
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            Last Name
          </label>
          <input
            type="text"
            style={authStyles.form.input}
            value={user.lastName}
            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Enter your last name"
            required
            disabled={loading}
          />
        </div>
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            Date of Birth
          </label>
          <input
            type="date"
            style={authStyles.form.input}
            value={user.dob}
            onChange={(e) => setUser({ ...user, dob: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            disabled={loading}
          />
        </div>

        <div style={authStyles.roleSection.container}>
          <label style={authStyles.roleSection.label}>
            Account Type
          </label>
          <select 
            style={authStyles.roleSection.select}
            value={user.role} 
            onChange={(e) => {confirmRole(e.target.value)}}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.selectFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.select);
            }}
            disabled={loading}
          >
            <option value="USER">USER</option>
            <option value="OWNER">Author</option>
          </select>
        </div>

        {isOwner && (
          <div style={authStyles.paymentSection.container}>
            <div style={authStyles.alert.warning}>
              {isOwner}
            </div>
            <label style={authStyles.paymentSection.label}>
              Payment Method
            </label>
            <select 
              style={authStyles.paymentSection.select}
              value={pmt} 
              onChange={(e) => setPmt(e.target.value)}
              onFocus={(e) => {
                Object.assign(e.target.style, authStyles.form.selectFocused);
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, authStyles.form.select);
              }}
              disabled={loading}
            >
              <option value="">Select a Payment Method</option>
              <option value="VISA">Visa</option>
              <option value="MASTERCARD">Master Card</option>
              <option value="AMEX">Amex</option>
              <option value="PAYPAL">PayPal</option>
            </select>
          </div>
        )}
        
        {isAdmin && (
          <div style={authStyles.adminSection.container}>
            <div style={authStyles.alert.warning}>
              {isAdmin}
            </div>
            <label style={authStyles.adminSection.label}>
              Admin Code
            </label>
            <input 
              style={authStyles.form.input}
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              onFocus={(e) => {
                Object.assign(e.target.style, authStyles.form.inputFocused);
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, authStyles.form.inputBlurred);
              }}
              placeholder="Enter admin code"
              disabled={loading}
            />
          </div>
        )}

        <button 
          onClick={handleSignup} 
          style={{
            ...authStyles.button.primary,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              Object.assign(e.currentTarget.style, getButtonHoverStyle(true));
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              Object.assign(e.currentTarget.style, authStyles.button.primary);
            }
          }}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}

