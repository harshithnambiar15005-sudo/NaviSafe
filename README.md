# Maritime Distress Alert and Rescue Tracking System

## Overview

The Maritime Distress Alert and Rescue Tracking System is an IoT-based emergency response platform designed to improve the safety of fishermen and small vessels operating in coastal waters.

The system enables boats to transmit their real-time location, distress alerts, and status updates through a combination of GPS, LoRa, MQTT, and web technologies. A centralized monitoring dashboard visualizes vessel locations, rescue missions, communication relay paths, and high-risk maritime zones in real time.

---

## Problem Statement

Many fishing vessels operate in remote coastal regions where communication infrastructure is limited. During emergencies such as storms, equipment failures, collisions, or medical incidents, rescue authorities often face challenges in:

* Locating distressed vessels quickly
* Monitoring vessel movements in real time
* Coordinating rescue operations efficiently
* Maintaining communication in low-network areas

This project aims to provide a reliable and scalable solution for maritime emergency monitoring and rescue coordination.

---

## Features

### Vessel Tracking

* Real-time GPS location tracking
* Live vessel status monitoring
* Dynamic map visualization

### Distress Alert System

* Emergency SOS transmission
* Instant distress notifications
* Priority alert handling

### Rescue Coordination

* Rescue boat assignment
* Rescue route visualization
* Mission status monitoring

### Communication Network

* MQTT-based message transport
* LoRa relay communication support

### Risk Monitoring

* Maritime risk heatmap
* High-risk area identification
* Incident monitoring dashboard

---

## System Architecture

### Hardware Layer

* ESP32 Microcontroller
* Neo-6M GPS Module
* SX1278 LoRa Module

### Communication Layer

* LoRa
* MQTT Protocol
* WebSockets

### Backend Layer

* Node.js
* Express.js
* Socket.IO
* MQTT.js

### Frontend Layer

* React
* Vite
* React Leaflet
* Leaflet Heatmap

### Database Layer

* PostgreSQL
* Sequelize ORM

---

## Technology Stack

| Category      | Technologies                        |
| ------------- | ----------------------------------- |
| Frontend      | React, Vite, React Leaflet, Leaflet |
| Backend       | Node.js, Express.js, Socket.IO      |
| Database      | PostgreSQL, Sequelize               |
| Communication | MQTT, WebSockets, LoRa              |
| Hardware      | ESP32, Neo-6M GPS, SX1278           |

---

## Project Structure

```text
maritime-project/
│
├── maritime-dashboard/
│   ├── src/
│   └── public/
│
├── migrations/
├── scripts/
├── src/
│
├── package.json
├── README.md
└── .gitignore
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd maritime-project
```

### Install Backend Dependencies

```bash
npm install
```

### Install Frontend Dependencies

```bash
cd maritime-dashboard
npm install
```

---

## Running the Application

### Start MQTT Broker

```bash
mosquitto
```

### Start Backend Server

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd maritime-dashboard
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## MQTT Topics

| Topic          | Purpose                         |
| -------------- | ------------------------------- |
| boats/location | Vessel location updates         |
| boats/distress | Emergency distress alerts       |
| boats/status   | Vessel status updates           |
| boats/relay    | Communication relay information |

---

## Future Enhancements

* AI-based route optimization
* Weather integration
* Satellite communication support
* Mobile application
* Predictive risk analysis
* Automatic rescue recommendation system

---

## Applications

* Coastal Safety Monitoring
* Fisheries Management
* Maritime Search and Rescue
* Disaster Response Operations
* Marine Traffic Monitoring

---


## License

This project is developed for academic and educational purposes.
