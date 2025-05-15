import React from "react";
import { Html, Line } from "@react-three/drei";

export default function Planet({
  position,
  color,
  size,
  label,
  showOrbit = false,
  orbitRadius = 10,
  onClick = () => {},
}) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push([
      Math.cos(angle) * orbitRadius,
      0,
      Math.sin(angle) * orbitRadius,
    ]);
  }

  return (
    <>
      {showOrbit && <Line points={points} color="white" lineWidth={1} />}
      <mesh position={position} onClick={onClick}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
        {label && (
          <Html distanceFactor={10}>
            <div
              style={{ color: "white", fontSize: "1rem", textAlign: "center" }}
            >
              {label}
            </div>
          </Html>
        )}
      </mesh>
    </>
  );
}
