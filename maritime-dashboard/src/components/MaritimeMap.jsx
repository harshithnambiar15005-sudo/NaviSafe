import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import socket from "../services/socket";

import initialBoats from "../data/boats";
import rescueBoats from "../data/rescueBoats";
import heatData from "../data/heatData";

import HeatmapLayer from "./HeatmapLayer";

function MaritimeMap() {

  const [boats, setBoats] = useState(initialBoats);

  useEffect(() => {

    socket.on("boatLocationUpdated", (boat) => {

      console.log("LIVE BOAT:", boat);

      setBoats((prevBoats) => {

        const existingBoat = prevBoats.find(
          (b) => b.id === boat.boatId
        );

        const updatedBoat = {
          id: boat.boatId,
          lat: boat.lastLatitude,
          lng: boat.lastLongitude,
          status: boat.status || "SAFE",
          batteryLevel: boat.batteryLevel,
          signalStrength: boat.signalStrength,
        };

        if (existingBoat) {

          return prevBoats.map((b) =>
            b.id === boat.boatId ? updatedBoat : b
          );

        }

        return [...prevBoats, updatedBoat];
      });
    });

    socket.on("boatStatusChanged", (data) => {

      setBoats((prevBoats) =>
        prevBoats.map((boat) =>
          boat.id === data.boatId
            ? { ...boat, status: data.status }
            : boat
        )
      );

    });

    return () => {
      socket.off("boatLocationUpdated");
      socket.off("boatStatusChanged");
    };

  }, []);

  const greenIcon = new L.Icon({
    iconUrl:
      "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
  });

  const redIcon = new L.Icon({
    iconUrl:
      "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
  });

  const blueIcon = new L.Icon({
    iconUrl:
      "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
  });

  return (
    <div style={{ height: "500px", width: "100%" }}>

      <MapContainer
        center={[9.30, 79.55]}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <HeatmapLayer points={heatData} />

        {boats.map((boat) => {

          let icon = greenIcon;

          if (boat.status === "DISTRESS") {
            icon = redIcon;
          }

          if (boat.status === "RESCUED") {
            icon = blueIcon;
          }

          return (
            <Marker
              key={boat.id}
              position={[boat.lat, boat.lng]}
              icon={icon}
            >
              <Popup>
                <div>
                  <h3>{boat.id}</h3>

                  <p>Status: {boat.status}</p>

                  <p>
                    Lat: {boat.lat?.toFixed(4)}
                  </p>

                  <p>
                    Lng: {boat.lng?.toFixed(4)}
                  </p>

                  <p>
                    Battery: {boat.batteryLevel ?? "--"}%
                  </p>

                  <p>
                    Signal: {boat.signalStrength ?? "--"}%
                  </p>

                </div>
              </Popup>
            </Marker>
          );
        })}

        {rescueBoats.map((boat) => (
          <Marker
            key={boat.id}
            position={[boat.lat, boat.lng]}
            icon={blueIcon}
          >
            <Popup>
              <div>
                <h3>{boat.id}</h3>
                <p>Rescue Boat</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {rescueBoats.map((rescue) => {

          const targetBoat = boats.find(
            (boat) => boat.id === rescue.targetBoat
          );

          if (!targetBoat) return null;

          return (
            <Polyline
              key={rescue.id}
              positions={[
                [rescue.lat, rescue.lng],
                [targetBoat.lat, targetBoat.lng],
              ]}
              color="blue"
            />
          );
        })}

      </MapContainer>

    </div>
  );
}

export default MaritimeMap;