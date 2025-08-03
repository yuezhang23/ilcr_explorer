export const navStyles = {
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
    width: '100px',
    minWidth: '100px',
    textAlign: 'center' as const,
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
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    width: '90px',
    textAlign: 'center' as const,
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
    width: '90px',
    borderRadius: '16px',
    textAlign: 'center' as const,
    backgroundImage: `
      linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.1) 100%),
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
    `,
    position: 'relative' as const,
    overflow: 'hidden'
  },
  navLinkClicked: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontWeight: '600',
    transform: 'translateY(0px)',
    borderRadius: '16px',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
    width: '90px',
    textAlign: 'center' as const,
    backgroundImage: `
      linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.15) 100%),
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
    border: '1px solid rgba(239, 68, 68, 0.3)',
    width: '100px',
    minWidth: '100px',
    textAlign: 'center' as const
  },
  signOutButtonHover: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
    width: '100px',
    minWidth: '100px',
    textAlign: 'center' as const
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  conferenceButton: {
    borderRadius: '8px',
    padding: '6px 12px',
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'transparent',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
    fontSize: '0.95rem',
    minWidth: '100px',
    border: 'none'
  },
  yearButton: {
    borderRadius: '8px',
    padding: '6px 12px',
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
    fontSize: '0.95rem',
    minWidth: '100px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    marginRight: '60px'
  },
  dropdownMenu: {
    top: '100%',
    left: '0',
    zIndex: 1001,
    width: '100px',
    minWidth: '100px'
  },
  yearDropdownMenu: {
    top: '100%',
    left: '0',
    zIndex: 1000,
    width: '100px',
    minWidth: '100px'
  },
  collapseMenu: {
    top: '100%',
    left: '0',
    zIndex: 1001,
    width: '100px',
    minWidth: '100px',
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    padding: '4px 0',
    overflow: 'hidden',
    position: 'absolute' as const,
    marginTop: '4px'
  },
  collapseItem: {
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s ease',
    width: '100%',
    color: '#333'
  },
  collapseItemActive: {
    backgroundColor: 'rgba(100, 100, 180, 0.1)',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '8px 16px',
    border: 'none',
    color: '#6464b4',
    cursor: 'pointer',
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s ease',
    width: '100%'
  },
  collapseItemHover: {
    backgroundColor: 'rgba(100, 100, 180, 0.05)',
    color: '#6464b4'
  }
}; 