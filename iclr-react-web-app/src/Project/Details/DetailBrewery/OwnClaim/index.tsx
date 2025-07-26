import { useDispatch, useSelector } from "react-redux";
import { ProjectState } from "../../../store";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import * as client from "./claimClient";
import * as userClient from "../../../User/client";
import { setCurrentUser } from "../../../Reducers/userReducer";

export default function OwnerClaim() {
  const { detailId } = useParams();
  const { currentUser } = useSelector((state: ProjectState) => state.userReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [brew, setBrew] = useState({id: "", name: "", website_url: ""});
  const [claim, setClaim] = useState({owner: "", brewery_ref: detailId, brewery_name: "", legalName: "", additional: "", completed: false, approved: false});

  const fetchProfile = async() => {
    try {
    const account = await userClient.profile();
    const user = await userClient.findUserById(account._id);
    dispatch(setCurrentUser(user))
    if (!user || user.role !== "OWNER") {
      alert("Not authorized to see this page")
      navigate("/User/Profile")
    }
  } catch (err) {
    navigate("/User/Profile")
  }
  }

  const submit = async () => {
    try {
      const newClaim = await client.createClaim(claim);
      setError("")
      alert("Request Submitted")
      navigate("/Search")
    } catch (err: any) {
      setError(err.response.data);
    }
  }

  useEffect(() => {
    const fetchBrewery = async () => {
      const url = `https://api.openbrewerydb.org/v1/breweries/${detailId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data) {
        navigate("/Search")
        return;
      }
      setBrew(data);
      setClaim(c => ({...c, brewery_name: data.name}));
    };

    const update = async () => {
      if (currentUser) {
        setClaim({...claim, owner: currentUser._id})
        const c = await client.findPendingClaim(currentUser._id);
        if (c) {
          alert("You have a pending request, resubmit when it's completed")
          navigate("/Search")
          return;
        }
      }
    }
    fetchProfile();
    fetchBrewery();
    update();
  }, [detailId]);

  return(
    <div className="container-fluid">

      <div className="card bg-secondary text-white" style={{ height: '100px' }}>
        <div className="card-body">
          <h3 className="card-title">{brew.name}</h3>
          <p className="card-text"><strong>Website:</strong>
            <a href={brew.website_url} className="ms-1 text-decoration-none text-white" target="_blank" rel="noopener noreferrer">{brew.website_url}</a>
          </p> 
        </div>
      </div>
      {error && <div className="alert alert-danger my-1">{error}</div>}
      <label htmlFor="userLegalName" className="form-label mt-2">Legal Name: </label>
      <input
        type="text"
        className="form-control"
        value={claim.legalName}
        id="userLegalName"
        onChange={(e) => setClaim({ ...claim, legalName: e.target.value })} required/>
      <label htmlFor="userAdditional" className="form-label mt-2">Additional: </label>
      <input
        type="text"
        className="form-control"
        value={claim.additional}
        id="userLegalName"
        onChange={(e) => setClaim({ ...claim, additional: e.target.value })} required/>    
        <button onClick={submit} className="btn bg-dark-subtle form-control mt-4">
          Submit your request
        </button>
      
    </div>
  );
} 