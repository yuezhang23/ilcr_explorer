import axios from 'axios';
axios.defaults.withCredentials = true;

// export const BASE_API = process.env.REACT_APP_API_BASE;
export const CLAIM_API = `/api/claims`;
export const USERS_API = `/api/users`;

export interface Claim { _id: string; brewery_ref?: string; brewery_name: string; 
  owner?: string; legalName: string; additional?: string,
  completed?:boolean, approved?:boolean};

export const createClaim = async (claim: any) => {
  const response = await axios.post(`${CLAIM_API}`, claim);
  return response.data;
};

export const deleteClaim = async (claim: any) => {
  const response = await axios.delete(`${CLAIM_API}/${claim._id}`);
  return response.data;
};

export const findClaimById = async(claimId: any) =>{
  const response = await axios.get(`${CLAIM_API}/${claimId}`);
  return response.data;
}

export const updateClaim = async (claimId: any, claim: any) => {
  const response = await axios.put(`${CLAIM_API}/${claimId}`, claim);
  return response.data;
};

export const findAllClaims = async() =>{
  const response = await axios.get(`${CLAIM_API}`);
  return response.data;
}

export const findUserClaims = async(userId: any) =>{
  const response = await axios.get(`${USERS_API}/${userId}/claims`);
  return response.data;
}

export const findAllPending = async() =>{
  const response = await axios.get(`${CLAIM_API}/?completion=${"false"}`);
  return response.data;
}

export const findAllCompleted = async() =>{
  const response = await axios.get(`${CLAIM_API}/?completion=${"true"}`);
  return response.data;
}

// only one pending request is allowed in applicaton
export const findPendingClaim = async(userId: any) =>{
  const response = await axios.get(`${USERS_API}/${userId}/claims/pending`);
  return response.data[0];
}