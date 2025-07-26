
import { useEffect, useState } from "react";
import { Claim } from "../Details/DetailBrewery/OwnClaim/claimClient";
import * as client from "../Details/DetailBrewery/OwnClaim/claimClient";
import * as userClient from "./client";
import { useNavigate, useParams } from "react-router";
import { BsFillCheckCircleFill, BsPencil } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function Reviews() {
  const [completed, setCompleted] = useState<Claim[] | null>(null);
  const [pending, setPending] = useState<Claim[] | null>(null);
  const [cur, setCur] = useState<Claim>({_id: "", brewery_name: "Select Request First", legalName: "Select Request First", 
    additional: "Select Request First", completed: false, approved: false});
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const account = await userClient.profile();
      const user = await userClient.findUserById(account._id);
      if (!user || user.role !== "ADMIN") {
        alert("Not authorized to see this page")
        navigate("/User/Profile")
      }
    } catch (err) {
      navigate("/User/Profile")
    }
  }

  const strToBool = (value: any) => {
    return value.toLowerCase() === "true";
  }

  const handleChangeA = (e: any) => {
    console.log(cur)
    const { value } = e.target;
    const boolValue = strToBool(value); 
    setCur({...cur, approved: boolValue})
  }; 

  const handleChangeC = (e: any) => {
    const { value } = e.target;
    const boolValue = strToBool(value); 
    setCur({...cur, completed: boolValue})
  };

  const selectClaim = async (claim: Claim) => {
    try {
      const c = await client.findClaimById(claim._id);
      setCur(c);
    } catch (err) {
      console.log(err);
    }
  };

  const updateClaim = async () => {
    try {
      if (!cur._id) {
        throw new Error("first, select a claim request to update")
      }
      const status = await client.updateClaim(cur._id, cur);
      if (pending) {
        setPending(pending.map((c) =>
          (c._id === cur._id ? cur : c)));
        fetchPending();
        fetchCompleted();
      alert("Successfully updated the claim request")
      }
    } catch (err: any) {
      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
      alert(err.message)
      }
      console.log(err);
    }
  };

  const fetchCompleted = async () => {
    try {
      const c = await client.findAllCompleted();
      setCompleted(c);
    } catch (err: any) {
      console.log(err.response.data)
    }
  };

  const fetchPending = async () => {
    try {
      const c = await client.findAllPending();
      setPending(c);
    } catch (err: any) {
      console.log(err.response.data)
    }
  };

  useEffect(() => { 
    fetchProfile();
    fetchCompleted();
    fetchPending();
  }, []);
  
  return (
    <div className="container-fluid">
      <Link to="/User/Profile" className="btn bg-warning-subtle w-100 mb-2">
        Back to Your Profile page
      </Link>
      <h4>Pending Claim Requests</h4>
      <div className="table-responsive-sm">
        <table className="table table-striped">
          <thead>
           
            <tr className="align-middle">
              <td>{cur?.brewery_name}</td>
              <td>{cur?.legalName}</td>
              <td>{cur?.additional}</td>
              <td>
                <select className="me-2 mb-1" value={cur.approved ? "true" : "false"} 
                  onChange={(e) => {handleChangeA(e)}}>
                  <option value="true">Approved</option>
                  <option value="false">Rejected</option>
                </select> 
              </td>
              <td>
                <select className="me-2 mb-1" value={cur.completed ? "true" : "false"} 
                  onChange={(e) => {handleChangeC(e)}}>
                  <option value="true">Complete</option>
                  <option value="false">Pending</option>
                </select> 
              </td>
              <td>
              <BsFillCheckCircleFill type="button"
                onClick={updateClaim} className="me-2 text-success fs-2"/>
              </td>
            </tr>
            <tr>
              <th>Brewery Name</th>
              <th>Name Entered</th>
              <th>Additional Info</th>
              <th>Approval Status</th>
              <th>Completion Status</th>
              <th>Edit Pending Request</th>
            </tr>
          </thead>
          <tbody>
            {pending?.map((claim, index) => (
            <tr key={index} className="align-middle">
              <td>{claim.brewery_name}</td>
              <td>{claim.legalName}</td>
              <td>{claim.additional}</td>
              <td>{"Pending"}</td>
              <td>{"Pending"}</td>
              <td>
                <button className="btn btn-warning me-2" onClick={() => selectClaim(claim)}>
                  <BsPencil />
                </button>
              </td>
            </tr>))}

          </tbody>
        </table>
      </div>

      <h4>Completed Claim Requests</h4>
      <div className="table-responsive-sm">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Brewery Name</th>
              <th>Name Entered</th>
              <th>Additional Info</th>
              <th>Approval Status</th>
              <th>Completion Status</th>
              <th>Completed Request ID</th>
            </tr>
          </thead>
          <tbody>
            {completed?.map((claim, index) => (
            <tr key={index} className="align-middle">
              <td>{claim.brewery_name}</td>
              <td>{claim.legalName}</td>
              <td>{claim.additional}</td>
              <td>{claim.approved ? "Approved" : "Rejected"}</td>
              <td>{"Completed"}</td>
              <td>{claim._id}</td>
            </tr>))}

          </tbody>
        </table>
      </div>
    </div>
  )
}
