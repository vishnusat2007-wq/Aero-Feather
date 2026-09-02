"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { HighlightTarget } from "@/components/store/shuttlecock-timeline";

const FEATHER_COUNT = 16;
const BASE_RADIUS = 0.165;
const TOP_RADIUS = 0.46;
const FEATHER_HEIGHT = 0.74;

function createVaneGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.012, 0.21);
  shape.bezierCurveTo(-0.048, 0.29, -0.072, 0.43, -0.075, 0.60);
  shape.bezierCurveTo(-0.074, 0.69, -0.050, 0.745, 0, 0.77);
  shape.bezierCurveTo(0.050, 0.745, 0.074, 0.69, 0.075, 0.60);
  shape.bezierCurveTo(0.072, 0.43, 0.048, 0.29, 0.012, 0.21);
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape, 20);
  return geo;
}

function createFeatherTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 640);
  g.addColorStop(0, "#fffef9");
  g.addColorStop(0.55, "#f8f4e9");
  g.addColorStop(1, "#e9dfcd");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 160, 640);
  ctx.strokeStyle = "rgba(145,130,105,.25)";
  ctx.lineWidth = 1;
  for (let y = 25; y < 610; y += 9) {
    const width = 26 + y * 0.045;
    ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(80 - width, y + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(80 + width, y + 10); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(188,166,126,.65)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(80, 640); ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type FeatherProps = {
  index: number;
  bloom: number;
  highlight: HighlightTarget;
  texture: THREE.CanvasTexture;
  geometry: THREE.ShapeGeometry;
};

function Feather({ index, bloom, highlight, texture, geometry }: FeatherProps) {
  const angle = (index / FEATHER_COUNT) * Math.PI * 2;
  const radial = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  const open = bloom / 0.12;
  const baseX = radial.x * BASE_RADIUS;
  const baseZ = radial.z * BASE_RADIUS;
  const outward = Math.atan2(TOP_RADIUS - BASE_RADIUS, FEATHER_HEIGHT) + open * 0.045;
  const lit = highlight === "feathers" && index % 3 === 0;

  return (
    <group position={[baseX, -0.045, baseZ]} rotation={[0, -angle + Math.PI / 2, -outward]}>
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.0045, 0.007, 0.76, 8]} />
        <meshStandardMaterial color="#d5bd91" roughness={0.8} />
      </mesh>
      <mesh geometry={geometry} castShadow renderOrder={index}>
        <meshStandardMaterial map={texture} color={lit ? "#f2fbff" : "#fffdf7"} roughness={0.9} side={THREE.DoubleSide}
          emissive={lit ? "#20b6e8" : "#000000"} emissiveIntensity={lit ? 0.22 : 0} transparent opacity={0.96} />
      </mesh>
    </group>
  );
}

type ShuttlecockModelProps = { bloom: number; highlight: HighlightTarget; floatY: number };

export function ShuttlecockModel({ bloom, highlight, floatY }: ShuttlecockModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => createVaneGeometry(), []);
  const texture = useMemo(() => createFeatherTexture(), []);
  useFrame(() => { if (rootRef.current) rootRef.current.position.y = floatY; });

  const cork = highlight === "cork";
  const binding = highlight === "binding";
  const geometryGlow = highlight === "geometry";

  return (
    <group ref={rootRef} position={[0, -0.07, 0]} rotation={[0.03, 0.25, -0.06]} scale={1.02}>
      {/* Realistic rounded cork base: flat impact face below, feathers above. */}
      <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.155, 0.178, 0.24, 64]} />
        <meshStandardMaterial color="#eee3d2" roughness={0.88} emissive={cork ? "#20b6e8" : "#000"} emissiveIntensity={cork ? 0.14 : 0} />
      </mesh>
      <mesh position={[0, -0.315, 0]} scale={[1, 0.5, 1]} castShadow>
        <sphereGeometry args={[0.178, 64, 32]} />
        <meshStandardMaterial color="#f5ecdf" roughness={0.82} emissive={cork ? "#20b6e8" : "#000"} emissiveIntensity={cork ? 0.14 : 0} />
      </mesh>

      {/* Green retaining band and two thread bindings. */}
      <mesh position={[0, -0.048, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.162, 0.013, 16, 72]} />
        <meshStandardMaterial color="#174f3d" roughness={0.52} emissive={binding ? "#20b6e8" : "#000"} emissiveIntensity={binding ? 0.22 : 0} />
      </mesh>
      {[0.11, 0.22].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BASE_RADIUS + y * 0.19, 0.004, 8, 72]} />
          <meshStandardMaterial color="#eee8d9" roughness={0.9} emissive={binding ? "#20b6e8" : "#000"} emissiveIntensity={binding ? 0.18 : 0} />
        </mesh>
      ))}

      {Array.from({ length: FEATHER_COUNT }).map((_, i) => (
        <Feather key={i} index={i} bloom={bloom} highlight={highlight} texture={texture} geometry={geometry} />
      ))}

      {geometryGlow && [0.34, 0.49, 0.64].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.21 + i * 0.045, 0.0018, 6, 96]} />
          <meshBasicMaterial color="#20b6e8" transparent opacity={0.52 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function ShuttlecockLights() {
  return <>
    <ambientLight intensity={0.78} color="#f5f8ff" />
    <directionalLight position={[2.8, 4.5, 4]} intensity={1.7} color="#ffffff" castShadow />
    <directionalLight position={[-3, 2, -2]} intensity={0.65} color="#cde9ff" />
    <pointLight position={[-2.5, 0.8, 2]} intensity={0.75} color="#20b6e8" />
  </>;
}
