import React, { useEffect, useState } from 'react';
import * as home from './home';
import { useAuth } from '../../contexts/AuthContext';
import axios from "axios";
import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
// import UsrHome from './user';
// import GuestHome from './guest';
import RatingHome from './rating'
import AdminHome from './admin';
import Leaderboard from './components/Leaderboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRocket } from 'react-icons/fa';
import { adminStyles } from './styles/adminStyles';
axios.defaults.withCredentials = true;


function Home() {
  const { user, isAuthenticated } = useAuth();
  const [done, setDone] = useState(false)
  const [val, setVal] = useState("Ratings")
  const [ranks, setRanks] = useState([]);



  return (               
      <div className="d-flex mx-2 flex-column">
        <Routes>
            <Route path="/" element={<Navigate to="Guest"/>} />
            {/* <Route path="Guest" element={<GuestHome/>} /> */}
            {/* <Route path="User" element={<GuestHome/>} /> */}
            {/* <Route path="User/:usrId" element={<UsrHome/>} /> */}
            <Route path="Guest/*" element={<AdminHome/>} />
            <Route path="Analytics/*" element={<RatingHome/>} />
        </Routes>
      </div>
  );
}
export default Home;