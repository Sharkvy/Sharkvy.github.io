import React, { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Line, Html, useGLTF } from "@react-three/drei"; // Assuming useGLTF is used for preloading or if you switch to it
import * as THREE from "three";

// ... existing code ...

export default function Planet({
  planetData, // Changed from individual props to the whole object
  position, // This position is for the AnimatedPlanet's group, Planet itself is at [0,0,0] within its own scaled group
  label,
  showOrbit = false,
  orbitRadius = 10,
  onClick = () => {},
}) {
  const { scene } = useGLTF(planetData.modelPath); // Use useGLTF hook for simplicity and caching

  // Calculate points for orbit line if showOrbit is true
  const points = useMemo(() => {
    // ... existing code ...
  }, [showOrbit, orbitRadius]);

  // Determine a vertical offset if it's the server planet
  const yOffset = planetData.id === "server" ? -0.5 : 0; // ADJUSTED: Changed -0.2 to -0.5

  return (
    <>
      {showOrbit && <Line points={points} color="white" lineWidth={1} />}
      {/* The main group for the planet model and its label, applying the yOffset */}
      <group position={[0, yOffset, 0]} onClick={onClick}>
        {" "}
        {/* Apply yOffset here */}
        {scene ? (
          <primitive
            object={scene.clone()} // Use .clone() if you might reuse the model
            scale={[planetData.size, planetData.size, planetData.size]}
          />
        ) : (
          // Fallback sphere if model fails to load (though useGLTF handles errors differently)
          <mesh>
            <sphereGeometry args={[planetData.size || 1, 32, 32]} />
            <meshStandardMaterial color={planetData.color || "orange"} />
          </mesh>
        )}
        {label && (
          // ... existing code ...
          <Html distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div
              style={{
                color: "white",
                fontSize: "1rem",
                textAlign: "center",
                marginTop: "20px", // Adjust as needed
              }}
            >
              {label}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// Required for GLTF loading - ensure this path is correct if you have it in public/
if (process.env.NODE_ENV === "development") {
  // Optional: only preload in dev
  useGLTF.preload && useGLTF.preload("/purple_planet.glb");
}
