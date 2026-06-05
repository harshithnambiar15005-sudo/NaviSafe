import MaritimeMap from "../components/MaritimeMap";
import AlertPanel from "../components/AlertPanel";

function Dashboard() {
  return (
    <div>
      <div
        style={{
          background: "#003366",
          color: "white",
          padding: "15px",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Maritime Distress Dashboard
      </div>

      <AlertPanel />

      <MaritimeMap />
    </div>
  );
}

export default Dashboard;