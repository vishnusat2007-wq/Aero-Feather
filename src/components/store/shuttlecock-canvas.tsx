"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ShuttlecockLights, ShuttlecockModel } from "@/components/store/shuttlecock-model";
import type { HighlightTarget } from "@/components/store/shuttlecock-timeline";

type SceneProps = {
  bloom: number;
  highlight: HighlightTarget;
  rotationY: number;
  enterOffset: [number, number, number];
  floatY: number;
  mouseTilt: { x: number; y: number };
};

function SceneContent({ bloom, highlight, rotationY, enterOffset, floatY, mouseTilt }: SceneProps) {
  const rigRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!rigRef.current) return;
    const damping = 1 - Math.pow(0.002, delta);
    rigRef.current.rotation.y = THREE.MathUtils.lerp(
      rigRef.current.rotation.y,
      rotationY + mouseTilt.y * 0.16,
      damping,
    );
    rigRef.current.rotation.x = THREE.MathUtils.lerp(
      rigRef.current.rotation.x,
      -0.04 + mouseTilt.x * 0.1,
      damping,
    );
  });

  return (
    <group ref={rigRef} position={enterOffset}>
      <ShuttlecockModel bloom={bloom} highlight={highlight} floatY={floatY} />
      <ContactShadows position={[0, -0.42, 0]} opacity={0.32} scale={1.5} blur={2.8} far={1} color="#07111f" />
    </group>
  );
}

export function ShuttlecockCanvas(props: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.1, 0.16, 2.55], fov: 31, near: 0.01, far: 10 }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ShuttlecockLights />
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
