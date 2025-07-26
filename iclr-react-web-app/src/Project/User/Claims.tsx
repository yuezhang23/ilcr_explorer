import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as client from "../Details/DetailBrewery/OwnClaim/claimClient";
import * as userClient from "./client";
import axios from "axios";
import { Claim } from "../Details/DetailBrewery/OwnClaim/claimClient";
import { BsFillCheckCircleFill, BsTrash3Fill } from "react-icons/bs";
axios.defaults.withCredentials = true;

export default function Claims() {
  const { ownerId } = useParams();
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [cur, setCur] = useState<Claim | null>(null);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const account = await userClient.profile();
      const user = await userClient.findUserById(account._id);
      if (!user || user.role !== "OWNER" || user._id !== ownerId) {
        alert("Not authorized to see this page")
        navigate("/User/Profile")
      }
    } catch (err) {
      navigate("/User/Profile")
    }
  }

  const deleteClaim = async (claim: Claim) => {
    try {
      if (claims) {
      await client.deleteClaim(claim);
      setClaims(claims.filter((c) => c._id !== claim._id));
      setPending(false)
      alert("Successfully deleted pending request")
    }
    } catch (err) {
      console.log(err);
    }
  }

  const updateClaim = async () => {
    try {
      if (!cur) {
        throw new Error("No pending claim request")
      }
      console.log(cur)
      const status = await client.updateClaim(cur._id, cur);
      if (claims) 
        setClaims(claims?.map((c) => (c._id === cur._id ? cur : c)));
      alert("Successfully updated the pending claim")
    } catch (err: any) {
      alert(err.response.data.message)
    }
  };

  const pendingRequest = async () => {
    try {
      const c = await client.findPendingClaim(ownerId);
      setCur(c);
      setPending(true)
    } catch (err) {
      console.log(err);
    }
  }; 

  const fetchClaims = async () => {
    const c = await client.findUserClaims(ownerId);
    setClaims(c);
  };

  useEffect(() => { 
    fetchProfile();
    fetchClaims(); 
    pendingRequest();
  }, []);
  
  return (
    <div className="container-fluid">
      <Link to="/User/Profile" className="btn bg-warning-subtle w-100 mb-2">
        Back to Your Profile page
      </Link>

      <h3>Edit Your Pending Requests</h3>

      <div className="table-responsive-sm">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Brewery Name</th>
              <th>Name Entered</th>
              <th>Additional Info</th>
              <th>Completion Status</th>
              <th>Approval Status</th>
              <th>Edit Pending Request</th>
            </tr>
            { pending && cur && <>
            <tr className="align-middle">
              <td>
                {cur.brewery_name}
              </td>
              <td>
                <input value={cur.legalName} onChange={(e) => setCur({ ...cur, legalName: e.target.value })}
                  placeholder="change your name here"/>
              </td>
              <td>
                <input value={cur.additional} onChange={(e) =>
                  setCur({ ...cur, additional: e.target.value })}/>
              </td>
              <td> Pending </td>
              <td> Pending </td>
              <td>            
                <BsFillCheckCircleFill type="button"
                  onClick={updateClaim} className="me-2 text-success fs-2"/>
                <button className="btn bg-danger-subtle me-2" onClick={() => deleteClaim(cur)}>
                  <BsTrash3Fill className="mb-1"/>
                </button>
              </td>
            </tr>
            </> }
          </thead>
        </table>
      </div>


      <h3 className="mt-4">All submitted Requests</h3>
      <div className="table-responsive-sm">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Brewery Name</th>
              <th>Name Entered</th>
              <th>Additional Info</th>
              <th>Completion Status</th>
              <th>Approval Status</th>
            </tr>
          </thead>
          <tbody>
            {claims?.map((claim, index) => (
              <tr key={index} className="align-middle">
                <td>{claim.brewery_name}</td>
                <td>{claim.legalName}</td>
                <td>{claim.additional}</td>
                <td>{ !claim.completed ? "Pending" : "Completed" }</td>
                <td>{claim.completed ? (claim.approved ? "Approved" : "Rejected") : "Pending"}</td>               
              </tr>))}
          </tbody>
        </table>
      </div>
      
      
    </div>
  );
}

