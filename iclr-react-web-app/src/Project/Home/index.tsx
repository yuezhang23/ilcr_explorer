import React, { useState, useCallback } from 'react';
import { useYear } from '../../contexts/YearContext';
import Leaderboard from './components/Leaderboard';
import GuestHome from './guest';

// Main Home component that manages shared year context and renders child components
function Home() {
    const { currentYear, loading: yearLoading } = useYear();
    const [sharedSearchTerm, setSharedSearchTerm] = useState('');
    
    // You can add logic here to determine if user is admin or guest
    // For now, we'll show both components side by side
    const isAdmin = true; // This should be determined by your auth logic
    
    // Handle search term from Leaderboard
    const handleLeaderboardSearch = useCallback((searchTerm: string) => {
        setSharedSearchTerm(searchTerm);
    }, []);

    // Clear search term when year changes
    React.useEffect(() => {
        setSharedSearchTerm('');
    }, [currentYear]);
    
    if (yearLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading year...</p>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        // Admin view with sidebar layout
        return (
            <div className="d-flex" style={{ height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
                <div className='col-2 d-none d-lg-block me-3 d-flex flex-column'>
                    <div className='d-flex mb-3 mt-3' style={{ minHeight: '45px' }}> </div>
                    <Leaderboard 
                        currentYear={currentYear} 
                        onPaperClick={handleLeaderboardSearch} 
                    />
                </div> 
                <div className='col-10 flex-grow-1 d-flex flex-column' style={{ overflow: 'hidden' }}>
                    <GuestHome initialSearchTerm={sharedSearchTerm} />
                </div>
            </div>
        );
    } else {
        // Guest view without sidebar
        return <GuestHome initialSearchTerm="" />;
    }
}

export default Home;