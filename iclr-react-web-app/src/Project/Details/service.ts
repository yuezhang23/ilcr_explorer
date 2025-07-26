import axios from 'axios';
axios.defaults.withCredentials = true;

// export const BASE_API = process.env.REACT_APP_API_BASE;
export const BREW_API = `/api/breweries`;
//set as https://api.openbrewerydb.org/v1/breweries on netlify and in .env 


export const randomBreweryFromAPI = async () => {
  const response = await axios.get(`${BREW_API}/random`)
  if (response) {
    return response.data;
  } else {
    const local = await axios.get(`/api/admin/breweries/random`)
    return local.data;
  }
}


export const getAllBreweries = async () => {
  const response = await axios.get(`${BREW_API}`);
  if (response) {
    return response.data;
  } else {
    const local = await axios.get(`/api/admin/breweries`);
    return local.data;
  }
}


export const getBreweryFromAPIs = async (ids : any[], usrId : any) => {
  const brs = []
  const uniqueArray = Array.from(new Set(ids));
  for (const i of uniqueArray) {
    const response = await axios.get(`${BREW_API}/${i}/${usrId}`)
    if (response) {
      brs.push(response.data)
    }
  }
  return brs;
}