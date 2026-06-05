# Maritime Distress Alert & Rescue Tracking System Backend

This repository contains the production-quality MVP backend for the student engineering project: **Maritime Distress Alert and Rescue Tracking System**.

## System Architecture

```
Boat Device (ESP32)
      ↓ (LoRa)
LoRa Mesh Network (SX1278)
      ↓ (Serial)
Gateway ESP32
      ↓ (Wi-Fi / MQTT)
MQTT Broker
      ↓
Node.js Backend (Express.js) ← Socket.IO → React Dashboard
      ↓
PostgreSQL Database (Sequelize ORM)
```

**GSM Fallback (SIM900A):**
If the LoRa Mesh connection fails or is unavailable, the boat hardware falls back to GSM, posting GPS distress payloads directly to the backend's HTTP fallback endpoint.

---

## Directory Structure

```
├── migrations/                # Database schema migrations
│   └── 20260527000000-create-tables.js
├── scripts/                   # Seeding and mock simulation utilities
│   ├── seed.js
│   └── mock-mqtt-publisher.js
├── src/
│   ├── config/
│   │   └── database.js        # Sequelize ORM configuration
│   ├── controllers/           # API controllers (Boats, Distress, Rescue, GSM, Analytics)
│   ├── middleware/            # Centralized error handler and validation
│   ├── models/                # Sequelize database models
│   ├── mqtt/
│   │   └── mqtt.client.js     # Subscribes to MQTT and stores telemetry
│   ├── routes/                # REST endpoints routing
│   ├── services/              # Core business services (analytics, heatmap calculation)
│   ├── sockets/
│   │   └── socket.service.js  # Real-time WebSocket emitter
│   ├── app.js                 # Express Application setup
│   └── server.js              # Server entry point
├── .env.example               # Example env config template
├── .env                       # Local environment secrets
├── package.json               # Package dependencies & scripts
└── README.md                  # This documentation file
```

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **PostgreSQL** running locally or remotely
- **MQTT Broker** (e.g. Mosquitto, EMQX, or a public/free broker for testing like HiveMQ/test.mosquitto.org)

---

## Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your database credentials and MQTT broker URL:
```env
PORT=5000
DATABASE_URL=postgres://postgres:password@localhost:5432/maritime_distress
MQTT_URL=mqtt://localhost:1883
```

*(Note: Create the `maritime_distress` database in PostgreSQL before proceeding.)*

### 3. Run Database Migrations & Seeds
Initialize tables and populate sample mock boats:
```bash
# Seed database (this will sync models and run seed data insertion)
npm run db:seed
```

### 4. Start Server
Run in development mode (with nodemon):
```bash
npm run dev
```

The server will automatically boot Express, authenticate & sync models with PostgreSQL, subscribe to the MQTT broker, and open a WebSocket channel on port `5000`.

---

## REST API Reference

### 1. Boats (`/api/boats`)
- `GET /api/boats` - Retrieve all boats.
- `GET /api/boats/:id` - Retrieve a boat by primary key (UUID).
- `POST /api/boats` - Create a boat.
  - *Payload:* `{"boatId": "BOAT_12", "ownerName": "John Doe", "registrationNumber": "REG-12"}`
- `PUT /api/boats/:id` - Update status/telemetry of a boat.
  - *Payload:* `{"status": "DISTRESS", "lastLatitude": 9.28, "lastLongitude": 79.55}`
- `DELETE /api/boats/:id` - Delete a boat.

### 2. Locations (`/api/locations`)
- `GET /api/locations/latest` - Fetch current active location coordinates for all boats.
- `GET /api/locations/history/:boatId` - Fetch the historical trajectory of a specific boat (returns up to 100 entries).

### 3. Distress (`/api/distress`)
- `GET /api/distress` - Retrieve all distress history log.
- `POST /api/distress` - Manually trigger/report a distress event.
  - *Payload:* `{"boatId": "BOAT_12", "lat": 9.28, "lng": 79.55, "message": "SOS Engine Failure"}`
- `PATCH /api/distress/:id/resolve` - Resolve a distress alert. (Updates boat status to `RESCUED`).

### 4. Rescue Missions (`/api/rescue`)
- `GET /api/rescue` - List all rescue missions.
- `POST /api/rescue` - Assign a boat to rescue another.
  - *Payload:* `{"distressBoatId": "BOAT_12", "rescueBoatId": "BOAT_01"}`
- `PATCH /api/rescue/:id` - Update rescue mission status (`ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`).

### 5. GSM Fallback Distress (`/api/gsm`)
- `POST /api/gsm/distress` - Endpoint for SIM900A GSM Fallback messages.
  - *Payload:* `{"boatId": "BOAT_12", "lat": 9.28, "lng": 79.55, "message": "SOS"}`
  - *Actions:* Creates distress log, updates boat status to `DISTRESS`, broadcasts Socket.IO events.

### 6. Analytics (`/api/analytics`)
- `GET /api/analytics/heatmap` - Returns density grouped coordinates `[[lat, lng, intensity], ...]`.
- `GET /api/analytics/distress-frequency` - Distress count breakdown by boat ID.
- `GET /api/analytics/rescue-stats` - Count breakdown by rescue mission status.

---

## Socket.IO Real-Time Events

Dashboard clients can connect to `http://localhost:5000` via Socket.IO and listen to the following events:

1. **`boatLocationUpdated`**: Emitted when a boat's GPS coordinate or telemetry gets updated.
   - *Payload:* `{"boatId": "BOAT_12", "lastLatitude": 9.28, "lastLongitude": 79.55, "batteryLevel": 87, "signalStrength": 75, "status": "SAFE", "timestamp": "2026-05-27T15:00:00Z"}`
2. **`distressAlert`**: Emitted when a distress alert is raised.
   - *Payload:* DistressAlert database object.
3. **`boatStatusChanged`**: Emitted when a boat's status updates.
   - *Payload:* `{"boatId": "BOAT_12", "status": "DISTRESS"}`
4. **`rescueMissionAssigned`**: Emitted when a rescue mission is started.
   - *Payload:* RescueMission database object.
5. **`rescueMissionCompleted`**: Emitted when a rescue mission is completed.
   - *Payload:* RescueMission database object.
6. **`relayPathUpdated`**: Emitted when a new mesh communication path is registered.
   - *Payload:* RelayPath database object.

---

## Testing & Simulating Hardware

### Using the Mock Publisher
To test the backend without real hardware, start the backend server, and then run the mock publisher script in a separate terminal:
```bash
node scripts/mock-mqtt-publisher.js
```
This script will:
1. Connect to the local MQTT broker.
2. Stream simulated coordinates to `boats/location` every 5 seconds.
3. Post a simulated distress SOS to `boats/distress` after 10 seconds.
4. Broadcast relay mesh path updates to `boats/relay`.
