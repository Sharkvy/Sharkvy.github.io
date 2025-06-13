import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import Planet from "./Planet"; // Your existing Planet component
import * as THREE from "three";

const planetsConfig = [
  {
    id: "client",
    name: "Client",
    modelPath: "planet_client.glb", 
    size: 0.5,
    description: "The part users interact with directly, it displays data and sends user actions to the server.",
    visualRadius: 0.75,
  },
  {
    id: "api",
    name: "API",
    modelPath: "planet_api.glb", 
    size: 0.0035,
    description: "The part that handles requests and responses between the client and server.",
    visualRadius: 0.75,
  },
  {
    id: "server",
    name: "Server",
    modelPath: "planet_server.glb",
    size: 0.11,
    description: "The part that manages data storage, processing, and business logic.",
    visualRadius: 0.75,
  },
];

const CAMERA_POSITION = [0, 2, 10];
const CAMERA_FOV = 60;
const FOCUS_POINT_DISTANCE = CAMERA_POSITION[2];

function AnimatedPlanet({
  planetData,
  index,
  currentPlanetIndex,
  totalPlanets,
}) {
  const groupRef = useRef();
  const planetRef = useRef();

  const targetPosition = new THREE.Vector3();
  const targetOverallScale = useRef(1); // This will be the scale for the planetRef group

  // Determine display offset from the currently selected planet
  let displayOffset = index - currentPlanetIndex;

  // Handle wrap-around for carousel effect
  if (totalPlanets > 1) {
    if (Math.abs(displayOffset) > totalPlanets / 2) {
      if (displayOffset > 0) {
        displayOffset -= totalPlanets;
      } else {
        displayOffset += totalPlanets;
      }
    }
  }

  const isSelected = displayOffset === 0;

  const SELECTED_Z_POSITION = 0;

  const SIDE_X_POSITION = 8; // Increased from 5 to make them more outward
  const SIDE_Y_POSITION = 0;
  const SIDE_Z_POSITION = -1; // Slightly less Z offset, or keep at -2 if preferred
  const SIDE_PLANET_SCALE = 0.5; // Adjusted scale for side planets

  const FAR_X_MULTIPLIER = 1.2; // Adjusted for potentially wider spread
  const FAR_Z_OFFSET = -2; // Adjusted Z offset for far planets
  const FAR_PLANET_SCALE = 0.25; // Adjusted scale for far planets

  if (isSelected) {
    targetPosition.set(0, 0, SELECTED_Z_POSITION);

    const targetFillProportion = 0.8;
    const desiredVisualDiameter =
      2 *
      FOCUS_POINT_DISTANCE *
      Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) *
      targetFillProportion;
    const scaleMultiplierForFocus =
      desiredVisualDiameter / (planetData.visualRadius * 2);
    targetOverallScale.current = scaleMultiplierForFocus;
  } else if (displayOffset === 1) {
    // Next planet (to the camera's right of focus)
    targetPosition.set(SIDE_X_POSITION, SIDE_Y_POSITION, SIDE_Z_POSITION);
    targetOverallScale.current = SIDE_PLANET_SCALE;
  } else if (displayOffset === -1) {
    // Previous planet (to the camera's left of focus)
    targetPosition.set(-SIDE_X_POSITION, SIDE_Y_POSITION, SIDE_Z_POSITION);
    targetOverallScale.current = SIDE_PLANET_SCALE;
  } else {
    // Planets further away
    const direction = displayOffset > 0 ? 1 : -1;
    // Calculate a base X for the "far" planets that's beyond the immediate side planets
    const farBaseX =
      SIDE_X_POSITION +
      (Math.abs(displayOffset) - 1) * SIDE_X_POSITION * FAR_X_MULTIPLIER;
    targetPosition.set(
      direction * farBaseX,
      SIDE_Y_POSITION,
      SIDE_Z_POSITION + FAR_Z_OFFSET // Further back than immediate side planets
    );
    targetOverallScale.current = FAR_PLANET_SCALE;
  }

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(targetPosition, 0.07);
      if (isSelected) {
        groupRef.current.rotation.y += 0.005;
      } else {
        groupRef.current.rotation.y = 0;
      }
    }
    if (planetRef.current) {
      const currentActualScale = planetRef.current.scale.x;
      const newActualScale = THREE.MathUtils.lerp(
        currentActualScale,
        targetOverallScale.current,
        0.1
      );
      planetRef.current.scale.set(
        newActualScale,
        newActualScale,
        newActualScale
      );
    }
  });

  // ... existing code in AnimatedPlanet ...
  return (
    <group ref={groupRef}>
      <group ref={planetRef}>
        <Planet
          planetData={planetData} // Pass the whole planetData object
          position={[0, 0, 0]}
          // modelPath={planetData.modelPath} // Already part of planetData
          // color={planetData.color} // Already part of planetData (if it exists)
          // size={planetData.size} // Already part of planetData
          label={
            (displayOffset === 1 || displayOffset === -1) && totalPlanets > 1
              ? planetData.name
              : ""
          }
          showOrbit={false}
        />
      </group>
    </group>
  );
}
// ...

function App() {
  const [currentPlanetIndex, setCurrentPlanetIndex] = useState(0);
  const dragInfo = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    threshold: 75, // Minimum drag distance in pixels to trigger a swipe
  });

  const handleNextPlanet = () => {
    setCurrentPlanetIndex(
      (prevIndex) => (prevIndex + 1) % planetsConfig.length
    );
  };

  const handlePrevPlanet = () => {
    setCurrentPlanetIndex(
      (prevIndex) =>
        (prevIndex - 1 + planetsConfig.length) % planetsConfig.length
    );
  };

  const selectedPlanetData = planetsConfig[currentPlanetIndex];

  const handlePointerDown = (event) => {
    if (event.target.tagName === "BUTTON") return; // Ignore clicks on UI buttons
    dragInfo.current.isDragging = true;
    dragInfo.current.startX = event.clientX;
    dragInfo.current.currentX = event.clientX;
    event.currentTarget.style.cursor = "grabbing";
  };

  const handlePointerMove = (event) => {
    if (!dragInfo.current.isDragging) return;
    dragInfo.current.currentX = event.clientX;
    // Optional: Add visual feedback during drag here (e.g., slightly moving planets)
  };

  const handlePointerUp = (event) => {
    if (!dragInfo.current.isDragging) return;
    dragInfo.current.isDragging = false;
    event.currentTarget.style.cursor = "grab";

    const draggedDistance = dragInfo.current.currentX - dragInfo.current.startX;

    if (Math.abs(draggedDistance) > dragInfo.current.threshold) {
      if (draggedDistance < 0) {
        // Dragged left
        handleNextPlanet();
      } else {
        // Dragged right
        handlePrevPlanet();
      }
    }
  };

  const handlePointerLeave = (event) => {
    if (dragInfo.current.isDragging) {
      // If mouse leaves while dragging, treat it as a drag end
      handlePointerUp(event);
    }
  };

  return (
    <>
      {/* Planet Name Display */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "2rem",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        {selectedPlanetData.name}
      </div>

      {/* Navigation Buttons (Optional: can be removed if drag is primary) */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex", // Keep them for now or remove
          gap: "20px",
        }}
      >
        <button
          onClick={handlePrevPlanet}
          style={{ padding: "10px 20px", fontSize: "1rem" }}
        >
          Previous
        </button>
        <button
          onClick={handleNextPlanet}
          style={{ padding: "10px 20px", fontSize: "1rem" }}
        >
          Next
        </button>
      </div>

      {/* 3D Canvas container for drag events */}
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1,
          background: "black",
          cursor: "grab", // Initial cursor style
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave} // Handle mouse leaving the area while dragging
      >
        <Canvas camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <Stars radius={100} depth={50} count={1000} factor={4} fade />

          {planetsConfig.map((planet, index) => (
            <AnimatedPlanet
              key={planet.id}
              planetData={planet}
              // isSelected={index === currentPlanetIndex} // No longer needed, calculated inside
              index={index} // Pass the planet's own index
              currentPlanetIndex={currentPlanetIndex} // Pass the currently selected index
              totalPlanets={planetsConfig.length} // Pass the total number of planets
            />
          ))}
        </Canvas>
      </div>

      {/* Description Box for selected planet */}
      {selectedPlanetData && (
        <div
          style={{
            position: "fixed",
            top: "calc(20px + 3rem + 20px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            maxWidth: "500px",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            zIndex: 10,
            textAlign: "center",
          }}
        >
          <h2>{selectedPlanetData.name}</h2>
          <p>{selectedPlanetData.description}</p>
        </div>
      )}
    </>
  );
}

export default App;
 