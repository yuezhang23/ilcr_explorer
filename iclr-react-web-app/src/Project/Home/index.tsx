import React, { useState, useCallback, useEffect } from 'react';
import { useYear } from '../../contexts/YearContext';
import * as home from './home';
import { FaTrophy, FaMedal, FaAward, FaCrown } from 'react-icons/fa';
import GuestHome from './guest';

// Artistic header styles with gradient and text effects
const leaderboardHeaderStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '15px 20px',
    border: 'none',
    borderRadius: '12px 12px 0 0',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
    position: 'relative' as const,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '65px'
};

const artisticTextStyle = {
    background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6347, #FF69B4, #9370DB)',
    backgroundSize: '300% 300%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'gradientShift 3s ease-in-out infinite',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    fontWeight: '700',
    fontSize: '1.1rem',
    letterSpacing: '1px'
};

interface Paper {
    _id: string;
    title: string;
    authors: string[];
    url?: string;
    averageRating: number;
}

// Main Home component that manages shared year context and renders child components
function Home() {
    const { currentYear, loading: yearLoading } = useYear();
    const [sharedSearchTerm, setSharedSearchTerm] = useState('');
    const [topPapers, setTopPapers] = useState<Paper[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // You can add logic here to determine if user is admin or guest
    // For now, we'll show both components side by side
    const isAdmin = true; // This should be determined by your auth logic
    
    // Add CSS animation for gradient shift
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(style);
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    const fetchTopPapers = useCallback(async () => {
        if (!currentYear || yearLoading) {
            console.log(`Leaderboard: Skipping fetch - year: ${currentYear}, yearLoading: ${yearLoading}`);
            return;
        }
        
        console.log(`Leaderboard: fetchTopPapers called for year: ${currentYear}`);
        setIsLoading(true);
        setError(null);
        
        try {
            console.log(`Fetching top papers for year: ${currentYear}`);
            const papers = await home.getPapersRankedByRating(20);
            console.log(`Received ${papers.length} papers for year ${currentYear}`);
            setTopPapers(papers);
        } catch (err: any) {
            console.error('Error fetching top papers:', err);
            setError('Failed to load leaderboard data');
        } finally {
            setIsLoading(false);
        }
    }, [currentYear, yearLoading]);

    useEffect(() => {
        if (!currentYear || yearLoading) {
            console.log(`Leaderboard: Skipping effect - year: ${currentYear}, yearLoading: ${yearLoading}`);
            return;
        }
        
        console.log(`Leaderboard: Year changed to: ${currentYear}, fetching new data...`);
        // Clear existing data immediately when year changes for instant visual feedback
        setTopPapers([]);
        // Fetch immediately for fastest response, but with a small delay to prevent UI flicker
        const timer = setTimeout(() => {
            fetchTopPapers();
        }, 10);
        
        return () => clearTimeout(timer);
    }, [currentYear, yearLoading, fetchTopPapers]);

    // Handle search term from Leaderboard
    const handleLeaderboardSearch = useCallback((searchTerm: string) => {
        setSharedSearchTerm(searchTerm);
    }, []);

    // Clear search term when year changes
    React.useEffect(() => {
        setSharedSearchTerm('');
    }, [currentYear]);

    const handlePaperClick = useCallback((paperTitle: string, e: React.MouseEvent) => {
        e.preventDefault();
        // Use the first few words of the title for a more targeted search
        const searchWords = paperTitle.split(' ').slice(0, 4).join(' ');
        handleLeaderboardSearch(searchWords);
    }, [handleLeaderboardSearch]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <FaCrown className="text-warning" style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))' }} />;
        if (rank === 2) return <FaMedal className="text-secondary" style={{ filter: 'drop-shadow(0 2px 4px rgba(108, 117, 125, 0.3))' }} />;
        if (rank === 3) return <FaAward className="text-danger" style={{ filter: 'drop-shadow(0 2px 4px rgba(220, 53, 69, 0.3))' }} />;
        return null;
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'text-success';
        if (rating >= 6) return 'text-primary';
        if (rating >= 4) return 'text-warning';
        return 'text-danger';
    };

    const getRatingBackground = (rating: number) => {
        if (rating >= 8) return 'rgba(40, 167, 69, 0.1)';
        if (rating >= 6) return 'rgba(0, 123, 255, 0.1)';
        if (rating >= 4) return 'rgba(255, 193, 7, 0.1)';
        return 'rgba(220, 53, 69, 0.1)';
    };

    const truncateTitle = (title: string, maxLength: number = 60) => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };

    const truncateAuthors = (authors: string[], maxAuthors: number = 2) => {
        if (authors.length <= maxAuthors) return authors.join(', ');
        return authors.slice(0, maxAuthors).join(', ') + ` +${authors.length - maxAuthors}`;
    };
    
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
                    <div className='d-flex mb-3' style={{ minHeight: '45px' }}> </div>
                    
                    {/* Leaderboard Component */}
                    <div className="card border-0 shadow-lg h-100" style={{ 
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '800px'
                    }}>
                        <div className="card-header" style={leaderboardHeaderStyle}>
                            <h5 className="mb-0 d-flex align-items-center">
                                <FaTrophy className="me-3" style={{ fontSize: '2.5rem', transform: 'rotate(-15deg)', color: '#FFD700' }} />
                                <span style={artisticTextStyle}>Top Ratings</span>
                                {yearLoading && (
                                    <span className="ms-2 badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>
                                        Changing year...
                                    </span>
                                )}
                                {isLoading && !yearLoading && (
                                    <span className="ms-2 badge bg-info text-white" style={{ fontSize: '0.7rem' }}>
                                        Loading...
                                    </span>
                                )}
                            </h5>
                        </div>
                        <div className="card-body p-0" style={{ overflow: 'auto', maxHeight: 'calc(800px - 85px)' }}>
                            {topPapers.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-chart-line fa-3x text-muted mb-3" style={{ opacity: 0.5 }}></i>
                                    <p className="text-muted fw-light">No papers available</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {topPapers.map((paper, index) => (
                                        <div 
                                            key={paper._id} 
                                            className="list-group-item border-0 py-4 px-2"
                                            style={{
                                                backgroundColor: index % 2 === 0 ? 'rgba(248, 249, 250, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderBottom: index < topPapers.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                minHeight: 'fit-content'
                                            }}
                                        >
                                            <div className="d-flex flex-column">
                                                <div className="mb-2">
                                                    <div 
                                                        className={`fw-bold ${getRatingColor(paper.averageRating)}`} 
                                                        style={{ 
                                                            fontSize: '1.3rem',
                                                            padding: '8px 12px',
                                                            borderRadius: '12px',
                                                            background: getRatingBackground(paper.averageRating),
                                                            minWidth: '60px',
                                                            display: 'inline-block',
                                                            marginBottom: '8px'
                                                        }}
                                                    >
                                                        {paper.averageRating.toFixed(1)}
                                                    </div>
                                                    <div className="text-muted fw-light" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                                                        avg rating
                                                    </div>
                                                </div>
                                                <div>
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => handlePaperClick(paper.title, e)}
                                                        className="text-decoration-none fw-semibold fst-italic"
                                                        style={{ 
                                                            color: '#2c3e50',
                                                            fontSize: '0.8rem',
                                                            lineHeight: '1.3',
                                                            transition: 'color 0.2s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#667eea';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = '#2c3e50';
                                                        }}
                                                    >
                                                        {truncateTitle(paper.title)}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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