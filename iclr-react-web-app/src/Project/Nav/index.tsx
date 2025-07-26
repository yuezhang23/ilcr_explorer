
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Nav() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSignout = () => {
    logout();
  };

  return (
    <div
      className="px-5 py-2 d-flex justify-content-between align-items-center"
      style={{
        background: 'linear-gradient(135deg, #232946 0%, #3a3a5d 100%)',
        borderRadius: '0 0 0 0',
        boxShadow: '0 4px 20px rgba(35, 41, 70, 0.25)',
        margin: '0 20px 5px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="d-flex align-items-center">
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
          }}
        >
          {/* <img src={`/images/three.png`} style={{ width: '32px', height: '32px' }} alt="Logo" /> */}
        </div>
        <div>
          <h4 className="text-white mb-0 fw-bold">Paper Review</h4>
          <p className="mb-0 fw-bold text-white">
            {isAuthenticated && user ? 
              (
              <>
                Welcome, <span className="text-danger"> @ {user.firstName}</span>
              </>
            ) : (
              <>
              Welcome, <span className="text-danger"> @ Guest</span>
              </>)
            }
          </p>
        </div>
      </div>

      <div className="d-flex align-items-center">
        <Link
          to="/Home"
          className="btn me-2 border-0"
          style={{ 
            border: 'none',
            backgroundColor: 'transparent',
            color: pathname.includes("Home") ? '#ffffff' : '#cccccc',
            fontWeight: pathname.includes("Home") ? 'bold' : 'normal'
          }}
        >
          Home
        </Link>
        {/* <Link
          to="/Search"
          className={`btn me-2 border-0 ${pathname.includes("Search") ? "btn-primary" : "btn-outline-light"}`}
          style={{ border: 'none' }}
        >
          Search
        </Link> */}
        
        {isAuthenticated ? (
          <>
            <Link
              to="/User/Profile"
              className={`btn me-2 border-0 ${pathname.includes("Profile") ? "btn-primary" : "btn-outline-light"}`}
              style={{ 
                border: 'none',
                backgroundColor: pathname.includes("Profile") ? '#e3f2fd' : 'rgba(255, 255, 255, 0.2)',
                color: pathname.includes("Profile") ? '#1976d2' : '#ffffff',
                fontWeight: pathname.includes("Profile") ? 'bold' : 'normal'
              }}
            >
              Profile
            </Link>
            <button
              onClick={handleSignout}
              className="btn btn-outline-danger border-0"
              style={{ 
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff'
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/User/Signin"
              className="btn me-2 border-0"
              style={{ 
                border: 'none',
                backgroundColor: 'transparent',
                color: pathname.includes("Signin") ? '#ffffff' : '#cccccc',
                fontWeight: pathname.includes("Signin") ? 'bold' : 'normal'
              }}
            >
              Sign In
            </Link>
            <Link
              to="/User/Signup"
              className="btn border-0"
              style={{ 
                border: 'none',
                backgroundColor: 'transparent',
                color: pathname.includes("Signup") ? '#ffffff' : '#cccccc',
                fontWeight: pathname.includes("Signup") ? 'bold' : 'normal'
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Nav;
