import { useParams } from "react-router";
import GoogleComponent from "../../GoogleComponent";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ProjectState } from "../../../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faMapMarkerAlt,
  faBeer,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import * as detailClient from "./detailClient";
import { BsPencil } from "react-icons/bs";
import { BsTrash3Fill } from "react-icons/bs";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

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

function OwnerDetailBrewery() {
  const { detailId } = useParams<{ detailId: string }>();
  const [brew, setBrew] = useState<Brewery | null>(null);
  const [beers, setBeers] = useState<Beer[]>([]);
  const [beer, setBeer] = useState<Beer>({
    _id: "",
    name: "",
    type: "",
    flavor: "",
    ingredients: [],
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [store, setStore] = useState<Store>({
    _id: "",
    name: "",
    phone: "",
    location: {
      street: "",
      city: "",
      state: "",
      country: "",
    },
  });

  const { currentUser } = useSelector(
    (state: ProjectState) => state.userReducer
  );

  const [showBeerModal, setShowBeerModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const toggleBeerModal = () => setShowBeerModal(!showBeerModal);
const toggleStoreModal = () => setShowStoreModal(!showStoreModal);


  const handleCreateBeer = async () => {
    const newBeerData = {
      ...beer,
      brewery: {
        remote_id: detailId,
      },
    };

    try {
      const newBeer = await detailClient.createBeer(newBeerData);
      setBeers([newBeer, ...beers]);
      alert("Beer created successfully");
    } catch (error) {
      console.error("Failed to create beer", error);
    }
  };

  const handleDeleteBeer = async (beer: any) => {
    try {
      await detailClient.deleteBeer(beer);
      setBeers(beers.filter((b) => b._id !== beer._id));
      alert("Beer deleted successfully");
    } catch (error) {
      console.error("Failed to delete beer", error);
    }
  };

  const handleUpdateBeer = async () => {
    try {
      if (!beer._id) {
        throw new Error("Select a beer to update first");
      }
      await detailClient.updateBeer(beer._id, beer);
      setBeers(beers.map((b) => (b._id === beer._id ? beer : b)));
      alert("Beer updated successfully");
    } catch (error) {
      console.error("Failed to update beer", error);
    }
  };



  const handleCreateStore = async () => {
    const newStoreData = {
      ...store,
      breweries: {
        remote_id: detailId,
      },
    };

    try {
      const newStore = await detailClient.createStore(newStoreData);
      setStores([newStore, ...stores]);
      alert("Store created successfully");
    } catch (error) {
      console.error("Failed to create store", error);
    }
  };

  const handleDeleteStore = async (store: any) => {
    try {
      await detailClient.deleteStore(store);
      setStores(stores.filter((s) => s._id !== store._id));
      alert("Store deleted successfully");
    } catch (error) {
      console.error("Failed to delete store", error);
    }
  };

  const handleUpdateStore = async () => {
    try {
      if (!store._id) {
        throw new Error("Select a store to update first");
      }
      await detailClient.updateStore(store._id, store);
      setStores(stores.map((s) => (s._id === store._id ? store : s)));
      alert("Store updated successfully");
    } catch (error) {
      console.error("Failed to update store", error);
    }
  };


  const renderBeerModal = () => (
    <Modal show={showBeerModal} onHide={toggleBeerModal}>
      <Modal.Header closeButton>
        <Modal.Title>{beer._id ? "Edit Beer" : "Create Beer"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBeerName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter beer name"
              value={beer.name}
              onChange={(e) => setBeer({ ...beer, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBeerType">
            <Form.Label>Type</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter beer type"
              value={beer.type}
              onChange={(e) => setBeer({ ...beer, type: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBeerFlavor">
            <Form.Label>Flavor</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter beer flavor"
              value={beer.flavor}
              onChange={(e) => setBeer({ ...beer, flavor: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBeerIngredients">
            <Form.Label>Ingredients</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter ingredients, separated by commas"
              value={beer.ingredients.join(", ")}
              onChange={(e) =>
                setBeer({ ...beer, ingredients: e.target.value.split(", ") })
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={toggleBeerModal}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            beer._id ? handleUpdateBeer() : handleCreateBeer();
            toggleBeerModal();
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderStoreModal = () => (
    <Modal show={showStoreModal} onHide={toggleStoreModal}>
      <Modal.Header closeButton>
        <Modal.Title>{store._id ? "Edit Store" : "Create Store"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formStoreName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter store name"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formStorePhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter store phone"
              value={store.phone}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formStoreStreet">
            <Form.Label>Street</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter store street"
              value={store.location.street}
              onChange={(e) =>
                setStore({
                  ...store,
                  location: { ...store.location, street: e.target.value },
                })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formStoreCity">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter store city"
              value={store.location.city}
              onChange={(e) =>
                setStore({
                  ...store,
                  location: { ...store.location, city: e.target.value },
                })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formStoreState">
            <Form.Label>State</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter store state"
              value={store.location.state}
              onChange={(e) =>
                setStore({
                  ...store,
                  location: { ...store.location, state: e.target.value },
                })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formStoreCountry">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter store country"
              value={store.location.country}
              onChange={(e) =>
                setStore({
                  ...store,
                  location: { ...store.location, country: e.target.value },
                })
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={toggleStoreModal}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            store._id ? handleUpdateStore() : handleCreateStore();
            toggleStoreModal();
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );

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

  if (!brew) {
    return <div>Loading brewery details...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-2">
        {currentUser && currentUser.role === "OWNER" && (
          <div className="float-end">
            <Link
              to={`/Details/${detailId}/claim`}
              className="btn bg-warning-subtle float-end"
            >
              + Claim as Owner Request
            </Link>
          </div>
        )}
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
        <div className="col-md-6 mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Beers</h4>
            <Button
              variant="success"
              onClick={() => {
                setBeer({
                  _id: "",
                  name: "",
                  type: "",
                  flavor: "",
                  ingredients: [],
                });
                toggleBeerModal();
              }}
              style={{ height: "40px" }}
            >
              + Add Beer
            </Button>
          </div>
          <div className="beer-list">
            {beers.length > 0 ? (
              beers.map((beer) => (
                <div key={beer._id} className="card my-2 p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title" style={{ marginBottom: "10px" }}>
                      {beer.name}
                    </h5>
                    <div>
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleDeleteBeer(beer)}
                        style={{ fontSize: "0.8rem" }}
                      >
                        <BsTrash3Fill />
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => {
                          setBeer(beer);
                          toggleBeerModal();
                        }}
                        style={{ fontSize: "0.8rem" }}
                      >
                        <BsPencil />
                      </button>
                    </div>
                  </div>
                  <p className="card-subtitle mb-2 text-muted">
                    <FontAwesomeIcon icon={faBeer} className="me-2" />
                    {beer.type}
                  </p>
                  <p className="card-text">
                    <FontAwesomeIcon icon={faLeaf} className="me-2" />
                    {beer.flavor}
                  </p>
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
        {renderBeerModal()}

        <div className="col-md-6 mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Stores</h4>
            <Button
              variant="success"
              onClick={() => {
                setStore({
                  _id: "",
                  name: "",
                  phone: "",
                  location: {
                    street: "",
                    city: "",
                    state: "",
                    country: "",
                  },
                });
                toggleStoreModal();
              }}
              style={{ height: "40px" }}
            >
              + Add Store
            </Button>
          </div>
          <div className="store-list">
            {stores.length > 0 ? (
              stores.map((store) => (
                <div key={store._id} className="card my-2 p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title" style={{ marginBottom: "10px" }}>
                    {store.name}
                  </h5>
                  <div>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDeleteStore(store)}
                      style={{ fontSize: "0.8rem" }}
                    >
                      <BsTrash3Fill />
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setStore(store);
                        toggleStoreModal();
                      }}
                      style={{ fontSize: "0.8rem" }}
                    >
                      <BsPencil />
                    </button>
                  </div>
                  </div>
                  <p className="card-subtitle mb-2 text-muted">
                    <FontAwesomeIcon icon={faPhoneAlt} className="me-2" />
                    {store.phone}
                  </p>
                  <p className="card-subtitle mb-2 text-muted">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    {`${store.location.street}, ${store.location.city}, ${store.location.state}, ${store.location.country}`}
                  </p>
                </div>
              ))
            ) : (
              <p>No stores available.</p>
            )}
          </div>
        </div>
        {renderStoreModal()}
      </div>
    </div>
  );
}

export default OwnerDetailBrewery;
