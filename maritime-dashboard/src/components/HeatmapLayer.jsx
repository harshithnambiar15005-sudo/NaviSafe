import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

function HeatmapLayer({ points }) {

  const map = useMap();

  const heatLayerRef = useRef(null);

  useEffect(() => {

    // REMOVE OLD HEATMAP
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // CREATE NEW HEATMAP
    heatLayerRef.current = L.heatLayer(points, {
      radius: 50,
      blur: 25,
      maxZoom: 10,
    });

    // ADD TO MAP
    heatLayerRef.current.addTo(map);

    // CLEANUP
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };

  }, [map, points]);

  return null;
}

export default HeatmapLayer;