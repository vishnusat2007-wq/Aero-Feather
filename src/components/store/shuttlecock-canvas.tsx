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
    const damping = 1 - Math.pow(0.001, delta);
    rigRef.current.rotation.y = THREE.MathUtils.lerp(
      rigRef.current.rotation.y,
      rotationY + mouseTilt.y * 0.12,
      damping,
    );
    rigRef.current.rotation.x = THREE.MathUtils.lerp(
      rigRef.current.rotation.x,
      -0.06 + mouseTilt.x * 0.08,
      damping,
    );
  });

  return (
    <group ref={rigRef} position={enterOffset}>
      <ShuttlecockModel bloom={bloom} highlight={highlight} floatY={floatY} />
      <ContactShadows
        position={[0, -0.48, 0]}
        opacity={0.45}
        scale={1.8}
        blur={2.5}
        far={1.2}
        color="#030810"
      />
    </group>
  );
}

export function ShuttlecockCanvas(props: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.08, 2.65], fov: 28, near: 0.01, far: 20 }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ShuttlecockLights />
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
