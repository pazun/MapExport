# OSM Map Exporter

A simple web tool to browse and download high-resolution PNG or SVG maps of a selected area from OpenStreetMap.

## Project Requirements

### Frontend Stack:
*   HTML, CSS, JavaScript
*   React
*   Leaflet.js for interactive maps
*   OpenStreetMap as the map data provider

### Core Features:
*   An interactive Leaflet map embedded on the page.
*   A draggable/resizable rectangle or bounding box the user can position over the desired area.
*   Controls to:
    *   Select image format: PNG or SVG
    *   Select zoom level or resolution
    *   Trigger the export/download
*   High-resolution rendering of the selected map area into a downloadable image (even beyond screen resolution, ideally using a library or tile stitching method).

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Make sure you have Node.js and npm (Node Package Manager) installed on your system.

### Installation

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository_url>
    cd osm-map-exporter
    ```
    (Note: This step is not applicable if you received the project files directly.)

2.  **Navigate to the project directory:**
    ```bash
    cd /Users/pazun/Documents/codes/maps
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

To start the development server, run:

```bash
npm start
```

This will open the application in your default web browser at `http://localhost:3000`.

## Export Functionality (Future Enhancements)

The current version includes a placeholder for the download logic. For high-resolution exports beyond screen resolution, you would typically integrate a library or implement a tile stitching method. Here are some recommendations:

*   **`leaflet-image`**: A Leaflet plugin to export the map view as an image. Useful for screen-resolution captures.
*   **`dom-to-image`** or **`html2canvas`**: Libraries that can render HTML content (including the map) to an image. Might be suitable for screen-resolution or slightly larger captures.
*   **Tile Stitching**: For truly high-resolution exports, you would need to programmatically fetch map tiles for the selected bounding box at a higher zoom level than displayed, and then stitch them together into a single image. This often involves server-side processing or a more complex client-side implementation.
*   **Mapbox Static API / Other Static Map APIs**: For very high-resolution or custom styling needs, using a static map API (like Mapbox Static Images API or similar services from other providers) can be an effective solution. You would send the bounding box and desired resolution to the API, and it would return a pre-rendered image.

## Project Structure

```
/osm-map-exporter
├── public/
│   └── index.html
├── src/
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   └── index.js
├── package.json
├── package-lock.json
└── README.md
```