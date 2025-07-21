import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import './App.css';

const tileServers = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'OpenStreetMap Standard'
  },
  cartoLight: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'CartoDB Light'
  },
  cartoDark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'CartoDB Dark'
  }
};

// Helper function to convert degrees to radians
function toRadians(deg) {
  return deg * Math.PI / 180;
}

// Helper function to convert radians to degrees
function toDegrees(rad) {
  return rad * 180 / Math.PI;
}

// Function to calculate tile coordinates from latitude and longitude
function latLonToTile(lat, lon, zoom) {
  const n = Math.pow(2, zoom);
  const latRad = toRadians(lat);
  const xtile = Math.floor(n * ((lon + 180) / 360));
  const ytile = Math.floor(n * (1 - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2);
  return { x: xtile, y: ytile };
}

// Function to calculate latitude and longitude from tile coordinates
function tileToLatLon(x, y, zoom) {
  const n = Math.pow(2, zoom);
  const lon = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
  const lat = toDegrees(latRad);
  return { lat: lat, lon: lon };
}

// Function to get tile URL
function getTileUrl(x, y, z, styleKey) {
  const tileServer = tileServers[styleKey];
  if (!tileServer) {
    console.error(`Tile server for style key '${styleKey}' not found.`);
    return '';
  }
  // Replace {s} with a common subdomain if needed, or handle it dynamically
  // For simplicity, we'll assume {s} is not strictly necessary for export or can be ignored.
  // If {r} is present, replace it with @2x for retina or empty string for standard
  let url = tileServer.url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
  url = url.replace('{s}', 'a'); // Use a default subdomain, or implement more robust handling
  url = url.replace('{r}', ''); // Remove {r} for now, or add logic for retina tiles
  return url;
}

// Custom hook to get map instance
function MapController({ bounds, setBounds }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.on('boxzoomend', (e) => {
        setBounds(e.boxZoomBounds);
      });
    }
  }, [map, setBounds]);

  return null;
}

function App() {
  const [bounds, setBounds] = useState(null);
  const [format, setFormat] = useState('png');
  const [zoom, setZoom] = useState(15);
  const [selectedStyle, setSelectedStyle] = useState('osm'); // Default to OpenStreetMap Standard
  const mapRef = useRef();

  const handleDownload = async () => {
    if (!bounds) {
      alert('Please select an area on the map first.');
      return;
    }

    if (format === 'png') {
      // Calculate tile range for the selected bounds and zoom level
      const northWest = bounds.getNorthWest();
      const southEast = bounds.getSouthEast();

      const startTile = latLonToTile(northWest.lat, northWest.lng, zoom);
      const endTile = latLonToTile(southEast.lat, southEast.lng, zoom);

      const minX = Math.min(startTile.x, endTile.x);
      const maxX = Math.max(startTile.x, endTile.x);
      const minY = Math.min(startTile.y, endTile.y);
      const maxY = Math.max(startTile.y, endTile.y);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const tileWidth = 256;
      const tileHeight = 256;

      canvas.width = (maxX - minX + 1) * tileWidth;
      canvas.height = (maxY - minY + 1) * tileHeight;

      let loadedTiles = 0;
      const totalTiles = (maxX - minX + 1) * (maxY - minY + 1);

      const tilePromises = [];

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const img = new Image();
          img.crossOrigin = 'Anonymous'; // Required for CORS to prevent canvas tainting
          img.src = getTileUrl(x, y, zoom, selectedStyle);

          const promise = new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, (x - minX) * tileWidth, (y - minY) * tileHeight, tileWidth, tileHeight);
              loadedTiles++;
              // You could add a progress bar update here
              console.log(`Loaded ${loadedTiles}/${totalTiles} tiles`);
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load tile: ${img.src}`);
              reject(new Error(`Failed to load tile: ${img.src}`));
            };
          });
          tilePromises.push(promise);
        }
      }

      try {
        await Promise.all(tilePromises);
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `map_export_${zoom}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          alert('PNG map downloaded!');
        }, 'image/png');
      } catch (error) {
        alert('Failed to download map. Check console for details.');
        console.error('Map download error:', error);
      }
    } else if (format === 'svg') {
      alert('SVG export is not yet implemented. Please select PNG.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OSM Map Exporter</h1>
      </header>
      <div className="map-container">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '600px', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution={tileServers[selectedStyle].attribution}
            url={tileServers[selectedStyle].url}
          />
          {bounds && (
            <Rectangle bounds={bounds} pathOptions={{ color: 'red', weight: 1, fillOpacity: 0.1 }} />
          )}
          <MapController bounds={bounds} setBounds={setBounds} />
        </MapContainer>
      </div>
      <div className="controls">
        <div>
          <label>Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>
        </div>
        <div>
          <label>Zoom Level:</label>
          <input
            type="number"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            min="1"
            max="19"
          />
        </div>
        <div>
          <label>Map Style:</label>
          <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
            {Object.entries(tileServers).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleDownload}>Download Map</button>
      </div>
    </div>
  );
}

export default App;