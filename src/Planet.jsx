import React, { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Line, Html, useGLTF } from "@react-three/drei"; 
import * as THREE from "three";

export default function Planet({
  planetData,
  position, 
  label,
  showOrbit = false,
  orbitRadius = 10,
  onClick = () => {},
}) {
  const { scene } = useGLTF(planetData.modelPath);

  // Calculate points for orbit line if showOrbit is true
  const points = useMemo(() => {
  }, [showOrbit, orbitRadius]);

  // Determine a vertical offset if it's the server planet
  const yOffset = planetData.id === "server" ? -0.5 : 0;

  return (
    <>
      {showOrbit && <Line points={points} color="white" lineWidth={1} />}
      <group position={[0, yOffset, 0]} onClick={onClick}>
        {" "}
        {scene ? (
          <primitive
            object={scene.clone()}
            scale={[planetData.size, planetData.size, planetData.size]}
          />
        ) : (
          <mesh>
            <sphereGeometry args={[planetData.size || 1, 32, 32]} />
            <meshStandardMaterial color={planetData.color || "orange"} />
          </mesh>
        )}
        {label && (
          <Html distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div
              style={{
                color: "white",
                fontSize: "1rem",
                textAlign: "center",
                marginTop: "20px",
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

if (process.env.NODE_ENV === "development") {
  useGLTF.preload && useGLTF.preload("/purple_planet.glb");
}
