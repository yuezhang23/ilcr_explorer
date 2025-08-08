import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { AuthProvider } from '../contexts/AuthContext';
import Nav from './Nav';
import Home from './Home';
import Search from './Search';
import Signin from './User/Signin';
import Signup from './User/Signup';
import Profile from './User/Profile';
import Claims from './User/Claims';
// import Reviews from './User/Reviews';
import ProtectedRoute from '../components/ProtectedRoute';
import RatingHome from './Home/rating';
import PredictionDashboard from './Home/components/PredictionDashboard';

export default function Project() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <div className='d-flex flex-column' style={{ width: '100%', minHeight: '100vh' }}>
          <Nav />
          <Routes>
              <Route path="/" element={<Navigate to="Home" />} />
              <Route path="Home/*" element={<Home />} />
              <Route path="Analytics/*" element={<RatingHome/>} />
              <Route path="Dashboard/*" element={<PredictionDashboard/>} />
              <Route path="Search" element={<Search />} />
              <Route path="User/Signin" element={<Signin />} />
              <Route path="User/Signup" element={<Signup />} />
              <Route path="User/Profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              {/* <Route path="User/Owner/:ownerId/Claims" element={<Claims />} /> */}
              {/* <Route path="User/Admin/Review" element={<Reviews />} /> */}
          </Routes>
        </div>
      </AuthProvider>
    </Provider>
  );
}
