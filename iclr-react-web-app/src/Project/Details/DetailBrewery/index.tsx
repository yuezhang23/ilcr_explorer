import { useParams } from "react-router";
import GoogleComponent from "../GoogleComponent";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ProjectState } from "../../store";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneAlt, faMapMarkerAlt, faBeer, faLeaf } from '@fortawesome/free-solid-svg-icons';

// export const BASE_API = process.env.REACT_APP_API_BASE;

interface Brewery {
  id: string;
  name: string;
  brewery_type: string;
  phone: string;
  website_url: string;
  city: string;
  state: string;
  country: string;
  address_1: string;
  latitude: string;
  longitude: string;
}

export interface Beer {
  _id: string;
  name: string;
  type: string;
  flavor: string;
  ingredients: Array<string>;
}

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

function DetailBrewery() {
  const { detailId } = useParams<{ detailId: string }>();
  const [brew, setBrew] = useState<Brewery | null>(null);
  const [beers, setBeers] = useState<Beer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const { currentUser } = useSelector((state: ProjectState) => state.userReducer);


  useEffect(() => {
    const fetchBrewery = async () => {
      const url = `https://api.openbrewerydb.org/v1/breweries/${detailId}`;
      const response = await fetch(url);
      const data = await response.json();
      setBrew(data);

      const beersUrl = `/api/beers/by-brewery/${detailId}`;
      const beersResponse = await fetch(beersUrl);
      const beersData = await beersResponse.json();
      console.log("Beers data:", beersData);
      setBeers(beersData);

      const storesUrl = `/api/stores/by-brewery/${detailId}`;
      const storesResponse = await fetch(storesUrl);
      const storesData = await storesResponse.json();
      console.log("Stores data:", storesData);
      setStores(storesData);
    };

    fetchBrewery();
  }, [detailId]);
  
  if (!brew) 
    { return <div>Loading brewery details...</div>; }
  
  return (
    <div className="container-fluid">
      <div className="row mb-2">
        {currentUser && (currentUser.role ==="OWNER") && 
          <div className="float-end"><Link to={`/Details/${detailId}/claim`} className="btn bg-warning-subtle float-end">+ Claim as Owner Request</Link></div>}
      </div>
      <div className="row">
        <div className="col-md-6">
          <div
            className="card bg-secondary text-white"
            style={{ height: "400px" }}
          >
            <div className="card-body">
              <h3 className="card-title">{brew.name}</h3>
              <p className="card-text">
                <strong>Type:</strong> {brew.brewery_type}
              </p>
              <p className="card-text">
                <strong>Phone:</strong> {brew.phone}
              </p>
              <p className="card-text">
                <strong>Website:</strong>
                <a
                  href={brew.website_url}
                  className="ms-1 text-decoration-none text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {brew.website_url}
                </a>
              </p>
              <p className="card-text">
                <strong>Address:</strong>{" "}
                {`${brew.address_1}, ${brew.city}, ${brew.state}, ${brew.country}`}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          {!brew.latitude || !brew.longitude ? (
            <>No Map Info</>
          ) : (
            <GoogleComponent
              center={{
                lat: parseFloat(brew.latitude),
                lng: parseFloat(brew.longitude),
              }}
            />
          )}
        </div>
        <div className=" col-md-6 mt-3">
          <h4>Beers</h4>
          <div className="beer-list">
            {beers.length > 0 ? (
              beers.map((beer) => (
                <div key={beer._id} className="card my-2 p-3 bg-light">
                  <h5 className="card-title" style={{ marginBottom: '10px' }}>{beer.name}</h5>
                  <p className="card-subtitle mb-2 text-muted">
                  <FontAwesomeIcon icon={faBeer} className="me-2" />
                  {beer.type}</p>
                  <p className="card-text">
                  <FontAwesomeIcon icon={faLeaf} className="me-2" />
                  {beer.flavor}</p>
                  <p className="card-text">
                    <strong>Ingredients: </strong>
                    {beer.ingredients.join(", ")}
                  </p>
                </div>
              ))
            ) : (
              <p>No beers available.</p>
            )}
          </div>
        </div>

        <div className="col-md-6 mt-3">
          <h4>Stores</h4>
          <div className="store-list">
            {stores.length > 0 ? (
              stores.map((store) => (
                <div key={store._id} className="card my-2 p-3 bg-light">
                  <h5 className="card-title" style={{ marginBottom: '10px' }}>{store.name}</h5>
                  <p className="card-text">
                    <FontAwesomeIcon icon={faPhoneAlt} className="me-2"/>
                    {store.phone}
                  </p>
                  <p className="card-text">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2"/>
                    {`${store.location.street}, ${store.location.city}, ${store.location.state}, ${store.location.country}`}
                  </p>
                </div>
              ))
            ) : (
              <p>No stores available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailBrewery;
