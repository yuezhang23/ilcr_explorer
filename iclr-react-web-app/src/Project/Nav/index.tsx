
import React, { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useYear } from "../../contexts/YearContext";

import { FaEarlybirds } from "react-icons/fa6";
import { navStyles } from "./navStyles";


function Nav() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { currentYear, availableYears, setYear: setGlobalYear } = useYear();
  
  // Single state to track which collapse is open (only one can be open at a time)
  const [openCollapse, setOpenCollapse] = useState<string | null>(null);
  const [selectedConference, setSelectedConference] = useState<string>('ICLR');
  
  const availableConferences = ['ICLR', 'NeurIPS', 'ICML', 'ACL'];

  const handleSignout = () => {
    logout();
  };

  // Add click outside handler for collapses
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openCollapse && !target.closest('.collapse-container')) {
        setOpenCollapse(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openCollapse]);

  const handleYearSelect = useCallback(async (year: string) => {
    const success = await setGlobalYear(year);
    if (success) {
      setOpenCollapse(null);
    }
  }, [setGlobalYear]);

  const handleConferenceSelect = useCallback((conference: string) => {
    setSelectedConference(conference);
    setOpenCollapse(null);
  }, []);

  const toggleCollapse = (collapseId: string) => {
    setOpenCollapse(openCollapse === collapseId ? null : collapseId);
  };


  const handleNavLinkMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const dataPath = e.currentTarget.getAttribute('data-path') || '';
    const isActive = pathname.includes(dataPath);
    if (!isActive) {
      Object.assign(e.currentTarget.style, navStyles.navLinkHover);
    }
  };

  const handleNavLinkMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const dataPath = e.currentTarget.getAttribute('data-path') || '';
    const isActive = pathname.includes(dataPath);
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

      <div className="d-flex align-items-around" style={navStyles.headerControls}>
        <div className="d-flex align-items-center position-relative collapse-container">
          <div className="me-2 position-relative">
            <button 
              className="btn dropdown-toggle" 
              onClick={() => toggleCollapse('conference-collapse')}
              style={navStyles.conferenceButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {selectedConference}
            </button>
            
            <Collapse in={openCollapse === 'conference-collapse'}>
              <div 
                className="collapse-menu position-absolute"
                style={navStyles.collapseMenu}
                onMouseLeave={() => {
                  setOpenCollapse(null);
                }}
              >
                {availableConferences.map((conference: string) => (
                  <button
                    key={conference}
                    className="collapse-item"
                    onClick={() => handleConferenceSelect(conference)}
                    style={selectedConference === conference ? navStyles.collapseItemActive : navStyles.collapseItem}
                    onMouseEnter={(e) => {
                      if (selectedConference !== conference) {
                        Object.assign(e.currentTarget.style, navStyles.collapseItemHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedConference !== conference) {
                        Object.assign(e.currentTarget.style, navStyles.collapseItem);
                      }
                    }}
                  >
                    {conference}
                  </button>
                ))}
              </div>
            </Collapse>
          </div>
          <div className="me-3 position-relative">
            <button 
              className="btn dropdown-toggle" 
              onClick={() => toggleCollapse('year-collapse')}
              style={navStyles.conferenceButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {currentYear}
            </button>
            
            <Collapse in={openCollapse === 'year-collapse'}>
              <div 
                className="collapse-menu position-absolute"
                style={navStyles.collapseMenu}
                onMouseLeave={() => {
                  setOpenCollapse(null);
                }}
              >
                {availableYears.map((year: string) => (
                  <button
                    key={year}
                    className="collapse-item"
                    onClick={() => handleYearSelect(year)}
                    style={currentYear === year ? navStyles.collapseItemActive : navStyles.collapseItem}
                    onMouseEnter={(e) => {
                      if (currentYear !== year) {
                        Object.assign(e.currentTarget.style, navStyles.collapseItemHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentYear !== year) {
                        Object.assign(e.currentTarget.style, navStyles.collapseItem);
                      }
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </Collapse>
          </div>
        </div>
        
        <Link
          to="/Analytics/"
          className="btn"
          data-path="Analytics"
          style={pathname.includes("Analytics") ? navStyles.navLinkActive : navStyles.navLink}
          onMouseEnter={handleNavLinkMouseEnter}
          onMouseLeave={handleNavLinkMouseLeave}
        >
          Stats
        </Link>

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
