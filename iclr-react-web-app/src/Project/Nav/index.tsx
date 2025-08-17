
import React, { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useYear } from "../../contexts/YearContext";

import { FaEarlybirds } from "react-icons/fa6";
import { navStyles } from "./navStyles";
import "./collapseStyles.css";


function Nav() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { currentYear, availableYears, setYear: setGlobalYear } = useYear();
  
  // Single state to track which collapse is open (only one can be open at a time)
  const [openCollapse, setOpenCollapse] = useState<string | null>(null);
  const [selectedConference, setSelectedConference] = useState<string>('ICLR');
  
  const availableConferences = ['ICLR', 'NeurIPS', 'ICML', 'ACL'];
  const availableForms = ['Distribution', 'Dashboard', 'Table'];

  const handleSignout = () => {
    logout();
  };

  // Add click outside handler for collapses
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking on a collapse item (especially Analytics links)
      if (target.closest('.collapse-item')) {
        return;
      }
      
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

  const handleAnalyticsLinkClick = (form: string) => {
    // Small delay to ensure the link click is registered
    setTimeout(() => {
      setOpenCollapse(null);
    }, 100);
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
        <div className={pathname.includes("Analytics") || pathname.includes("Dashboard") ? "d-none" : "d-flex align-items-center position-relative collapse-container"}>
          <div className="me-2 position-relative">
            <button 
              className="btn dropdown-toggle" 
              onClick={() => toggleCollapse('conference-collapse')}
              style={navStyles.conferenceButton}
            >
              {selectedConference}
            </button>
            
            <Collapse in={openCollapse === 'conference-collapse'}>
              <div 
                className="collapse-menu position-absolute"
                style={navStyles.collapseMenu}
              >
                {availableConferences.map((conference: string) => (
                  <button
                    key={conference}
                    className="collapse-item"
                    onClick={() => handleConferenceSelect(conference)}
                    style={selectedConference === conference ? navStyles.collapseItemActive : navStyles.collapseItem}
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
            >
              {currentYear}
            </button>
            
            <Collapse in={openCollapse === 'year-collapse'}>
              <div 
                className="collapse-menu position-absolute"
                style={navStyles.collapseMenu}
              >
                {availableYears.map((year: string) => (
                  <button
                    key={year}
                    className="collapse-item"
                    onClick={() => handleYearSelect(year)}
                    style={currentYear === year ? navStyles.collapseItemActive : navStyles.collapseItem}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </Collapse>
          </div>
        
        </div>
        <div className="me-3 position-relative">
            <button 
              className="btn dropdown-toggle" 
              onClick={() => toggleCollapse('analytics-collapse')}
              style={navStyles.conferenceButton}
            >
              Analytics
            </button>
            
            <Collapse in={openCollapse === 'analytics-collapse'}>
              <div 
                className="collapse-menu position-absolute"
                style={navStyles.collapseMenu}
              > 
              {availableForms.map((form: string) => (
                <Link
                  key={form}
                  to={`/Analytics/${form}`}
                  className="collapse-item"
                  data-path={`Analytics/${form}`}
                  style={{
                    ...navStyles.collapseItem,
                    display: 'block',
                    textDecoration: 'none',
                    outline: 'none'
                  }}
                  onClick={() => handleAnalyticsLinkClick(form)}
                >
                  {form}
                </Link>
              ))}
              </div>
            </Collapse>
          </div>
        
        <Link
          to="/Home"
          className="btn"
          data-path="Home"
          style={pathname.includes("Home") ? navStyles.navLinkActive : navStyles.navLink}
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
            >
              Profile
            </Link>
            <button
              onClick={handleSignout}
              className="btn"
              style={navStyles.signOutButton}
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
            >
              Sign In
            </Link>
            <Link
              to="/User/Signup"
              className="btn"
              data-path="Signup"
              style={pathname.includes("Signup") ? navStyles.navLinkActive : navStyles.navLink}
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
