import React, { useEffect, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Planet from "./Planet";

function CameraController({ target }) {
  const { camera } = useThree();

  useFrame(() => {
    if (target) {
      camera.position.lerp(target, 0.1); // Smoothly move the camera to the target
      camera.lookAt(0, 0, 0); // Ensure the camera looks at the center
    }
  });

  return null;
}

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!selectedPlanet) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedPlanet]);

  const handlePlanetClick = (planetId, pos) => {
    setSelectedPlanet(planetId);
    setTargetPosition([pos[0], pos[1], pos[2] + 5]); // Zoom out slightly
  };

  const handleClose = () => {
    setSelectedPlanet(null);
    setTargetPosition(null);
  };
  console.log({ selectedPlanet, targetPosition, scrollY });

  return (
    <>
      {/* 3D Canvas */}
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
          <ambientLight intensity={1} /> {/* Increased intensity */}
          <directionalLight position={[10, 10, 5]} intensity={1.5} />{" "}
          {/* Increased intensity */}
          <Stars radius={100} depth={50} count={1000} factor={4} fade />
          {/* Other components */}
          {/* Controls when no planet is selected */}
          <OrbitControls enabled={!selectedPlanet} />
          {/* Camera controller to smoothly zoom */}
          <CameraController target={targetPosition} />
          {/* Planets */}
          <Planet
            position={[0, 0, -scrollY * 0.05]} // Always render at this position
            color="#4a90e2"
            size={1.5}
            label="Client"
            showOrbit
            onClick={() => handlePlanetClick("client", [0, 0, -scrollY * 0.05])}
          />
          <Planet
            position={[0, 0, -scrollY * 0.05 - 10]} // Always render at this position
            color="#f5a623"
            size={2}
            label="API"
            showOrbit
            onClick={() =>
              handlePlanetClick("api", [0, 0, -scrollY * 0.05 - 10])
            }
          />
          <Planet
            position={[0, 0, -scrollY * 0.05 - 20]} // Always render at this position
            color="#7ed321"
            size={1.2}
            label="Server"
            showOrbit
            onClick={() =>
              handlePlanetClick("server", [0, 0, -scrollY * 0.05 - 20])
            }
          />
        </Canvas>
      </div>

      {/* Scroll area */}
      <div style={{ height: "300vh" }}></div>

      {/* Description Box */}
      {/* Description Box */}
      {selectedPlanet && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "5%",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "300px",
            zIndex: 2,
          }}
        >
          <h2>{selectedPlanet ? selectedPlanet.toUpperCase() : ""}</h2>
          <p>
            This is the <strong>{selectedPlanet}</strong> layer of your web
            application. It handles...
          </p>
          <button onClick={handleClose} style={{ marginTop: "10px" }}>
            Close
          </button>
        </div>
      )}
    </>
  );
}

export default App;
