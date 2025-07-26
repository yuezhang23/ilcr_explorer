import axios from 'axios';
axios.defaults.withCredentials = true;

// export const BASE_API = process.env.REACT_APP_API_BASE;

export const BEER_API = `/api/beers`;
export const STORE_API = `/api/stores`;


export interface Beer {
    _id: string;
    name: string;
    type: string;
    flavor: string;
    ingredients: Array<string>;
    };

export const createBeer = async (beer: any) => {
    const response = await axios.post(`${BEER_API}`, beer);
    return response.data;
};

export const deleteBeer = async (beer: any) => {
    const response = await axios.delete(`${BEER_API}/${beer._id}`);
    return response.data;
};

export const findBeerById = async (beerId: any) =>{
    const response = await axios.get(`${BEER_API}/${beerId}`);
    return response.data;
}

export const updateBeer = async (beerId: any, beer: any) => {
    const response = await axios.put(`${BEER_API}/${beerId}`, beer);
    return response.data;
};

export interface Store {
    _id: string;
    name: string;
    phone: string;
    location: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
}

export const createStore = async (store: any) => {
    const response = await axios.post(`${STORE_API}`, store);
    return response.data;
};

export const deleteStore = async (store: any) => {
    const response = await axios.delete(`${STORE_API}/${store._id}`);
    return response.data;
};

export const findStoreById = async (storeId: any) =>{
    const response = await axios.get(`${STORE_API}/${storeId}`);
    return response.data;
}

export const updateStore = async (storeId: any, store: any) => {
    const response = await axios.put(`${STORE_API}/${storeId}`, store);
    return response.data;
};


