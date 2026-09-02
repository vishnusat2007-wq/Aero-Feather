"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { HighlightTarget } from "@/components/store/shuttlecock-timeline";

const FEATHER_COUNT = 16;
const BASE_SPLAY = 0.5;
const SKIRT_RADIUS = 0.165;

function createFeatherVaneGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.01, 0.05);
  shape.bezierCurveTo(0.058, 0.2, 0.062, 0.34, 0.05, 0.46);
  shape.bezierCurveTo(0.034, 0.54, 0.012, 0.58, 0, 0.6);
  shape.bezierCurveTo(-0.012, 0.58, -0.034, 0.54, -0.05, 0.46);
  shape.bezierCurveTo(-0.062, 0.34, -0.058, 0.2, -0.01, 0.05);
  shape.lineTo(0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.009,
    bevelEnabled: true,
    bevelThickness: 0.0015,
    bevelSize: 0.0015,
    bevelSegments: 2,
  });
  geo.translate(0, 0.06, -0.0045);
  geo.rotateX(-0.05);
  return geo;
}

function createFeatherTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 288;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.35, "#faf6ef");
  grad.addColorStop(0.85, "#efe8dc");
  grad.addColorStop(1, "#e5ddd0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(165,155,140,0.22)";
  ctx.lineWidth = 0.7;
  for (let y = 16; y < canvas.height - 16; y += 4) {
    const spread = 10 + (y / canvas.height) * 18;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, y);
    ctx.lineTo(canvas.width / 2 - spread, y + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, y);
    ctx.lineTo(canvas.width / 2 + spread, y + 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(230,225,215,0.5)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 6);
  ctx.lineTo(canvas.width / 2, canvas.height - 8);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type FeatherProps = {
  index: number;
  bloom: number;
  highlight: HighlightTarget;
  featherTexture: THREE.CanvasTexture;
  vaneGeometry: THREE.ExtrudeGeometry;
};

function Feather({ index, bloom, highlight, featherTexture, vaneGeometry }: FeatherProps) {
  const angle = (index / FEATHER_COUNT) * Math.PI * 2;
  const lit = highlight === "feathers" && (index % 3 === 0 || index === 5 || index === 11);
  const splay = BASE_SPLAY * (1 + bloom);
  const x = Math.cos(angle) * SKIRT_RADIUS;
  const z = Math.sin(angle) * SKIRT_RADIUS;

  return (
    <group position={[x, 0.1, z]} rotation={[-splay, -angle + Math.PI / 2, 0]}>
      <mesh position={[0, 0.035, 0]} castShadow>
        <cylinderGeometry args={[0.003, 0.0045, 0.07, 6]} />
        <meshStandardMaterial
          color="#c9b896"
          roughness={0.78}
          metalness={0.04}
          emissive={lit ? "#20b6e8" : "#000000"}
          emissiveIntensity={lit ? 0.15 : 0}
        />
      </mesh>
      <mesh geometry={vaneGeometry} castShadow receiveShadow renderOrder={index}>
        <meshStandardMaterial
          map={featherTexture}
          color={lit ? "#f8fcff" : "#faf7f2"}
          roughness={0.8}
          metalness={0.02}
          emissive={lit ? "#20b6e8" : "#000000"}
          emissiveIntensity={lit ? 0.25 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

type ShuttlecockModelProps = {
  bloom: number;
  highlight: HighlightTarget;
  floatY: number;
};

export function ShuttlecockModel({ bloom, highlight, floatY }: ShuttlecockModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const vaneGeometry = useMemo(() => createFeatherVaneGeometry(), []);
  const featherTexture = useMemo(() => createFeatherTexture(), []);

  useFrame(() => {
    if (rootRef.current) rootRef.current.position.y = floatY;
  });

  const corkHighlight = highlight === "cork";
  const bindHighlight = highlight === "binding";
  const showGeometry = highlight === "geometry";

  return (
    <group ref={rootRef} rotation={[-0.2, 0.4, 0.06]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.138, 48, 28, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#f2ece4"
          roughness={0.62}
          metalness={0.05}
          emissive={corkHighlight ? "#20b6e8" : "#000000"}
          emissiveIntensity={corkHighlight ? 0.2 : 0}
        />
      </mesh>
      {corkHighlight && (
        <mesh position={[0, 0.01, 0]}>
          <sphereGeometry args={[0.146, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#20b6e8" transparent opacity={0.14} />
        </mesh>
      )}

      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.13, 0.013, 14, 56]} />
        <meshStandardMaterial
          color="#1a5240"
          roughness={0.5}
          metalness={0.1}
          emissive={bindHighlight ? "#20b6e8" : "#000000"}
          emissiveIntensity={bindHighlight ? 0.22 : 0}
        />
      </mesh>

      {[0.23, 0.36].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.098 - i * 0.014, 0.0035, 8, 56]} />
          <meshStandardMaterial
            color="#f7f4ee"
            roughness={0.88}
            emissive={bindHighlight ? "#20b6e8" : "#000000"}
            emissiveIntensity={bindHighlight ? 0.14 : 0}
          />
        </mesh>
      ))}

      {showGeometry &&
        [0.28, 0.35, 0.42].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.105 + i * 0.02, 0.0018, 4, 72, Math.PI * 0.92]} />
            <meshBasicMaterial color="#20b6e8" transparent opacity={0.5 - i * 0.12} />
          </mesh>
        ))}

      {Array.from({ length: FEATHER_COUNT }).map((_, i) => (
        <Feather
          key={i}
          index={i}
          bloom={bloom}
          highlight={highlight}
          featherTexture={featherTexture}
          vaneGeometry={vaneGeometry}
        />
      ))}
    </group>
  );
}

export function ShuttlecockLights() {
  return (
    <>
      <ambientLight intensity={0.62} color="#f0f4fa" />
      <directionalLight position={[2.8, 5, 3.2]} intensity={1.5} color="#ffffff" castShadow />
      <directionalLight position={[-2.2, 2.8, -1.8]} intensity={0.5} color="#d0e4f5" />
      <pointLight position={[-2, 1.4, 1.5]} intensity={1.25} color="#20b6e8" />
      <pointLight position={[1.8, 0.5, -1.2]} intensity={0.4} color="#168cd8" />
      <spotLight
        position={[0, 2.5, 0.8]}
        angle={0.45}
        penumbra={0.8}
        intensity={0.6}
        color="#ffffff"
      />
    </>
  );
}
