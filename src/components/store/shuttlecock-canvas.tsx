"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  ShuttlecockLights,
  ShuttlecockModel,
} from "@/components/store/shuttlecock-model";
import type { HighlightTarget } from "@/components/store/shuttlecock-timeline";

type SceneProps = {
  bloom: number;
  highlight: HighlightTarget;
  rotationY: number;
  enterOffset: [number, number, number];
  floatY: number;
  mouseTilt: { x: number; y: number };
};

function SceneContent({
  bloom,
  highlight,
  rotationY,
  enterOffset,
  floatY,
  mouseTilt,
}: SceneProps) {
  const rigRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!rigRef.current) return;
    rigRef.current.rotation.y = THREE.MathUtils.lerp(
      rigRef.current.rotation.y,
      rotationY + mouseTilt.y * 0.08,
      1 - Math.pow(0.001, delta),
    );
    rigRef.current.rotation.x = THREE.MathUtils.lerp(
      rigRef.current.rotation.x,
      -0.12 + mouseTilt.x * 0.06,
      1 - Math.pow(0.001, delta),
    );
  });

  return (
    <group ref={rigRef} position={enterOffset}>
      <ShuttlecockModel bloom={bloom} highlight={highlight} floatY={floatY} />
      <ContactShadows
        position={[0, -0.02, 0]}
        opacity={0.55}
        scale={1.2}
        blur={2.2}
        far={0.5}
        color="#000814"
      />
    </group>
  );
}

export function ShuttlecockCanvas(props: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.32, 0.18, 0.62], fov: 38, near: 0.01, far: 10 }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ShuttlecockLights />
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
