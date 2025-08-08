import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authStyles, getButtonHoverStyle } from "./styles/authStyles";

export default function Signin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const signin = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await login(credentials.username, credentials.password);
      navigate("/User/Profile");
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.header.title}>
          Welcome Back
        </div>
        <div style={authStyles.header.subtitle}>
          Sign in to your account to continue
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
            value={credentials.username} 
            style={authStyles.form.input}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Enter your username"
            disabled={loading}
          />
        </div>
        
        <div style={authStyles.form.group}>
          <label style={authStyles.form.label}>
            Password
          </label>
          <input 
            value={credentials.password} 
            type="password"
            style={authStyles.form.input}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            onFocus={(e) => {
              Object.assign(e.target.style, authStyles.form.inputFocused);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, authStyles.form.inputBlurred);
            }}
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>
        
        <button 
          onClick={signin} 
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
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <Link 
          to={"/User/Signup"} 
          style={authStyles.button.secondary}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, getButtonHoverStyle(false));
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, authStyles.button.secondary);
          }}
        >
          Create New Account
        </Link>
      </div>
    </div>
  );
}
