import boats from "../data/boats";

function AlertPanel() {

  const distressBoats = boats.filter(
    (boat) => boat.status === "DISTRESS"
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "80px",
        right: "20px",
        background: "white",
        padding: "15px",
        borderRadius: "10px",
        width: "250px",
        zIndex: 1000,
        boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
      }}
    >
      <h2 style={{ color: "red" }}>
        Distress Alerts
      </h2>

      {distressBoats.length === 0 ? (
        <p>No active distress signals</p>
      ) : (
        distressBoats.map((boat) => (
          <div
            key={boat.id}
            style={{
              background: "red",
              color: "white",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "5px",
            }}
          >
            {boat.id} NEEDS HELP
          </div>
        ))
      )}
    </div>
  );
}

export default AlertPanel;