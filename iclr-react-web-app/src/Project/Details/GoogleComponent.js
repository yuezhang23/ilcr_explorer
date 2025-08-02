import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { memo, useCallback, useState } from 'react';
// export const API_KEY = process.env.REACT_GOOGLE_API_KEY

const containerStyle = {
  width: 'auto',
  height: '400px'
};

function GoogleComponent({ center }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBlkNVZUx2CsW77JQ67XY5WhxD95Pb8K3Y'
  })

  const [zoom, setZoom] = useState(14);
  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    map.setZoom(zoom)
    setMap(map);
  }, [center]); 

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);


  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {
          <MarkerF position={center}
            draggable={true}/>
        }
      </GoogleMap>
  ) : "";
}
export default memo(GoogleComponent);
