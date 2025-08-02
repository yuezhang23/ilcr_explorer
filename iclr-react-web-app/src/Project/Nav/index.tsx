
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import YearSelector from "../../components/YearSelector";
import { BsTransparency } from "react-icons/bs";
import { FaArrowsToCircle, FaBookJournalWhills, FaClover, FaEarlybirds, FaHouse, FaL, FaLeaf, FaMagnet, FaNetworkWired, FaPencil, FaRuler, FaTowerCell, FaTree, FaTreeCity } from "react-icons/fa6";
import { FaBroadcastTower, FaRegHandPaper } from "react-icons/fa";

function Nav() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSignout = () => {
    logout();
  };

  // Consistent styling with admin.tsx
  const navStyles = {
    container: {
      background: 'linear-gradient(135deg, rgb(100, 100, 180) 0%, rgb(90, 65, 140) 100%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      margin: '0 0 10px 0',
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000,
      padding: '16px 24px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    logoContainer: {
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '16px',
      backdropFilter: 'blur(10px)',
      zIndex: 1001,
      position: 'relative' as const
    },
    title: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '1.25rem',
      marginBottom: '4px',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
      fontSize: '0.9rem',
      margin: 0
    },
    welcomeText: {
      color: '#fbbf24',
      fontWeight: '600'
    },
    navLink: {
      border: 'none',
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
      fontSize: '0.95rem',
      padding: '8px 16px',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      margin: '0 4px',
      backgroundImage: `
        linear-gradient(135deg, transparent 0%, transparent 50%, transparent 100%),
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
      `,
      position: 'relative' as const,
      overflow: 'hidden'
    },
    navLinkActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      fontWeight: '600',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      backgroundImage: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.2) 100%),
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
      `,
      position: 'relative' as const,
      overflow: 'hidden'
    },
    navLinkHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      transform: 'translateY(-1px)',
      backgroundImage: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.1) 100%),
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
      `,
      position: 'relative' as const,
      overflow: 'hidden'
    },
    signOutButton: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#fecaca',
      fontWeight: '500',
      fontSize: '0.95rem',
      padding: '8px 16px',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    },
    signOutButtonHover: {
      backgroundColor: 'rgba(239, 68, 68, 0.3)',
      color: '#fca5a5',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
    }
  };

  const handleNavLinkMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!pathname.includes(e.currentTarget.getAttribute('data-path') || '')) {
      Object.assign(e.currentTarget.style, navStyles.navLinkHover);
    }
  };

  const handleNavLinkMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isActive = pathname.includes(e.currentTarget.getAttribute('data-path') || '');
    Object.assign(e.currentTarget.style, isActive ? navStyles.navLinkActive : navStyles.navLink);
  };

  const handleSignOutMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    Object.assign(e.currentTarget.style, navStyles.signOutButtonHover);
  };

  const handleSignOutMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    Object.assign(e.currentTarget.style, navStyles.signOutButton);
  };

  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={navStyles.container}
    >
      <div className="d-flex align-items-center">
        <div style={navStyles.logoContainer}>
          <i className="fa fa-leaf" style={{ fontSize: '45px', color: 'white' }}><FaEarlybirds/></i>
        </div>
        <div>
          <h4 style={navStyles.title}>Paper Review</h4>
          <p style={navStyles.subtitle}>
            {isAuthenticated && user ? 
              (
              <>
                Welcome, <span style={navStyles.welcomeText}>@ {user.firstName}</span>
              </>
            ) : (
              <>
              Welcome, <span style={navStyles.welcomeText}>@ Guest</span>
              </>)
            }
          </p>
        </div>
      </div>

      <div className="d-flex align-items-center">
        <Link
          to="/Home"
          className="btn"
          data-path="Home"
          style={pathname.includes("Home") ? navStyles.navLinkActive : navStyles.navLink}
          onMouseEnter={handleNavLinkMouseEnter}
          onMouseLeave={handleNavLinkMouseLeave}
        >
          Home
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link
              to="/User/Profile"
              className="btn"
              data-path="Profile"
              style={pathname.includes("Profile") ? navStyles.navLinkActive : navStyles.navLink}
              onMouseEnter={handleNavLinkMouseEnter}
              onMouseLeave={handleNavLinkMouseLeave}
            >
              Profile
            </Link>
            <button
              onClick={handleSignout}
              className="btn"
              style={navStyles.signOutButton}
              onMouseEnter={handleSignOutMouseEnter}
              onMouseLeave={handleSignOutMouseLeave}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/User/Signin"
              className="btn"
              data-path="Signin"
              style={pathname.includes("Signin") ? navStyles.navLinkActive : navStyles.navLink}
              onMouseEnter={handleNavLinkMouseEnter}
              onMouseLeave={handleNavLinkMouseLeave}
            >
              Sign In
            </Link>
            <Link
              to="/User/Signup"
              className="btn"
              data-path="Signup"
              style={pathname.includes("Signup") ? navStyles.navLinkActive : navStyles.navLink}
              onMouseEnter={handleNavLinkMouseEnter}
              onMouseLeave={handleNavLinkMouseLeave}
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
