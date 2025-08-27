
import React, { useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useYear } from "../../contexts/YearContext";

import { FaEarlybirds } from "react-icons/fa6";
import { navStyles } from "./navStyles";
import "./collapseStyles.css";


function Nav() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { currentYear, availableYears, setYear, loading: yearLoading} = useYear();
  
  // Single state to track which collapse is open (only one can be open at a time)
  const [openCollapse, setOpenCollapse] = useState<string | null>(null);
  const [selectedConference, setSelectedConference] = useState<string>('ICLR');
  const [isYearChanging, setIsYearChanging] = useState(false);
  
  const availableConferences = ['ICLR', 'NeurIPS', 'ICML', 'ACL'];
  const availableForms = ['Confusion Matrix', 'Dashboard'];

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

    // Handle year selection change
    const handleYearSelect = useCallback(async (year: string) => {
        // Update global year context
        try {
            setIsYearChanging(true);
            // Close the dropdown immediately for better UX
            setOpenCollapse(null);
            
            // Update the year context
            const success = await setYear(year);
            if (!success) {
                console.warn('Year update may not have been successful');
            }
        } catch (error) {
            console.error('Failed to update global year:', error);
        } finally {
            setIsYearChanging(false);
        }
    }, [setYear]);

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
      className="d-flex justify-content-between align-items-center nav-scroll-container"
      style={{...navStyles.container, zIndex: 10000}}
    >
      <div className="d-flex align-items-center">
        <div style={navStyles.logoContainer}>
          <i className="fa fa-leaf" style={{ fontSize: '45px', color: 'white' }}><FaEarlybirds/></i>
        </div>
        <div>
          <h4 style={navStyles.title}>ICLR Review</h4>
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

      <div className="d-flex align-items-around" style={{...navStyles.headerControls, position: 'relative', zIndex: 10001}}>
        <div className={pathname.includes("Analytics") ? "d-none" : "d-flex position-relative collapse-container"}>
          <div className="position-relative" style={{ zIndex: 10001, position: 'relative' }}>
            <button 
              className="btn dropdown-toggle" 
              onClick={() => toggleCollapse('year-collapse')}
              style={navStyles.conferenceButton}
              disabled={isYearChanging || yearLoading}
            >
              {isYearChanging ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              {currentYear}
            </button>
            
            {openCollapse === 'year-collapse' && (
              <div 
                className="collapse-menu position-absolute"
                style={{...navStyles.collapseMenu, zIndex: 10001, position: 'absolute'}}
              >
                {availableYears.map((year: string) => (
                  <button
                    key={year}
                    className="collapse-item"
                    onClick={() => handleYearSelect(year)}
                    style={currentYear === year ? navStyles.collapseItemActive : navStyles.collapseItem}
                    disabled={isYearChanging}
                  >
                    {year}
                    {isYearChanging && currentYear === year && (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        
        </div>
        <div className="mx-4 position-relative" style={{ zIndex: 10001, position: 'relative' }}>
            <button 
              className="btn dropdown-toggle" 
              onClick={() => toggleCollapse('analytics-collapse')}
              style={navStyles.conferenceButton}
            >
              Rebuttal Analytics
            </button>            
            {openCollapse === 'analytics-collapse' && (
              <div 
                className="collapse-menu position-absolute"
                style={{...navStyles.collapseMenu, zIndex: 10001, position: 'absolute'}}
              > 
              {availableForms.map((form: string) => (
                <Link
                  key={form}
                  to={`/Analytics/${form.replace(' ', '')}`}
                  className="collapse-item mx-3"
                  data-path={`Analytics/${form}`}
                  style={{
                    ...navStyles.collapseItem,
                    display: 'block',
                    textDecoration: 'none',
                    outline: 'none',
                  }}
                  onClick={() => handleAnalyticsLinkClick(form)}
                >
                  {form}
                </Link>
              ))}
              </div>
            )}
          </div>
          {/* <Link
          to="/Analytics/playground"
          className="btn mx-2"
          data-path="Prompting"
          style={pathname.includes("Prompting") ? navStyles.navLinkActive : navStyles.navLink}
        >
          Prompting
        </Link> */}
        <Link
          to="/Analytics/MetricsDistribution"
          className="btn mx-2"
          data-path="Metrics"
          style={pathname.includes("Metrics") ? navStyles.navLinkActive : navStyles.navLink}
        >
          Metrics
        </Link>
        <Link
          to="/Home"
          className="btn mx-2"
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
