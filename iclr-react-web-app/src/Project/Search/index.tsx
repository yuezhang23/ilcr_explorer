import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Search() {
  const [search, setSearch] = useState(localStorage.getItem('search') || '');
  const [markers, setMarkers] = useState(JSON.parse(localStorage.getItem('markers') || '[]'));
  const [page, setPage] = useState(parseInt(localStorage.getItem('page') ?? '1', 10));

  useEffect(() => {
    // Update local storage when markers or page changes
    localStorage.setItem('search', search);
    localStorage.setItem('markers', JSON.stringify(markers));
    localStorage.setItem('page', page.toString());
  }, [search, markers, page]);

  const handleSearch = async (page = 1) => {
    const url = `https://api.openbrewerydb.org/v1/breweries/search?query=${encodeURIComponent(search)}&per_page=20&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();
    setMarkers(data); 
    setPage(page);
  };

  return (
    <div className="container-fluid">
      <div className="row p-2 align-items-center">
        <div className="col">
          <input
            className="form-control"
            placeholder='Search for a brewery'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className="btn bg-success-subtle" onClick={() => handleSearch()}>Search</button>
        </div>
      </div>
      <div className="row p-2">
        <div className="col p-2" style={{ border: '1px solid #ccc', borderRadius: '5px', marginLeft: '13px', marginRight: '13px' }}>
          {markers.length > 0 ? markers.map((marker: any) => (
            <Link key={marker.id} to={`/Details/${marker.id}`} className="d-block p-2" style={{ textDecoration: 'none', color: 'black' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
              {marker.name}
            </Link>
          )) : <div className="text-center">No relevant breweries found.</div>}
        </div>
      </div>
      <div className="row p-2 justify-content-center">
        <div className="col-auto">
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => handleSearch(page - 1)}>Previous</button>
        </div>
        <div className="col-auto">
          <button className="btn btn-secondary" onClick={() => handleSearch(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default Search;
