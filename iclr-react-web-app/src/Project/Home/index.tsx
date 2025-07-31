import React, { useEffect, useState } from 'react';
import * as home from './home';
import { useAuth } from '../../contexts/AuthContext';
import axios from "axios";
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
// import UsrHome from './user';
// import GuestHome from './guest';
import RatingHome from './rating'
import AdminHome from './admin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
axios.defaults.withCredentials = true;


function Home() {
  const { user, isAuthenticated } = useAuth();
  const [done, setDone] = useState(false)
  const [val, setVal] = useState("likes")
  const [ranks, setRanks] = useState([]);


  const fetchRankings = async () => {
    try {
      const rankings = await home.getPapersRankedByLikes(8); 
      if (rankings.length > 0) {
        setRanks(rankings.map((rank: any) => ({...rank, metareviews : rank.metareviews.rating})))
        setVal('likes')
      }
    } catch (error: any) {
      console.error(error.response.data);
    }
  } 
  
  const greetings = async () => {
    if (!isAuthenticated || !user) {
      toast.info(
        <span>Hey, <strong className='text-danger'>  Guest </strong>! Have fun here!</span>, {icon: false})
    }
    else if (user.role === 'ADMIN') {
      toast.info(
        <span>Hey, <strong className='text-danger'> {user.firstName}</strong>! Happy to have you!</span>, {icon: false})
      }
      else if (user.role === 'USER') {
        toast.info(
          <span>Hey, <strong className='text-danger'> {user.firstName}</strong>! Have fun here!</span>, {icon: false})
        }
        else {
          toast.info(
          <span>Hey, <strong className='text-danger'> {user.firstName}</strong>! Claim your breweries here!</span>, {icon: false})
    }
  }
  

  // useEffect(() => {
  //   fetchRankings()
  // }, [done, currentIclr]);
  
  useEffect(() => {
    greetings()
  }, [isAuthenticated, user]);


  return (
    <div className='d-flex mx-2'>
       {/* <div className='col-2 d-none d-lg-block'>
        <button className='btn bg-success-subtle text-primary btn-sm' onClick={() => setDone(!done)}> <strong>SWITCH</strong> </button>
        <span className='text-middle'>
        <ToastContainer  autoClose={1000} position="top-center" hideProgressBar={true} closeButton={false}
        toastStyle={{color: '#FF7F50', whiteSpace:'nowrap', width: '500px'}}/>
        </span>
        <ul className="list-group flex-grow-1"> 
            <span className='text-start text-primary ms-2' > Top <strong className='text-danger'>{val}</strong></span>
            <br></br>
            {ranks && ranks.map((rank: any, index : number) => ( 
            <li key= {index} 
                className={ "list-group-item d-flex row mx-2 rounded-2"} >
                <div className=' col-3 text-danger fs-2'>
                    {index +1}  
                </div>
                <div className='col-9 text-primary'>
                    {rank.title}
                    {/* <div className=' text-success'>
                    Type : {rank.brewery_type}
                    </div> */}
                    {/* <div className='col text-danger'>
                    <FaRocket className= "me-3 text-danger "/>
                        {val} : {rank.likeCount}
                    </div>
                </div>
                    
            </li> 
            ))}
        </ul>
      </div> */}
      <div className="col-9 flex-grow-1">
          <Routes>
              <Route path="/" element={<Navigate to="Guest"/>} />
              {/* <Route path="Guest" element={<GuestHome/>} /> */}
              {/* <Route path="User" element={<GuestHome/>} /> */}
              {/* <Route path="User/:usrId" element={<UsrHome/>} /> */}
              <Route path="Guest/*" element={<AdminHome/>} />
              <Route path="Analytics/*" element={<RatingHome/>} />
          </Routes>
      </div>
    </div>
  );
}
export default Home;