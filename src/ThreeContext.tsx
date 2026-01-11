import { Suspense, ReactNode } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

interface ThreeContextProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
}

export default function ThreeContext({
  children,
  ...props
}: ThreeContextProps) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  return (
    <Suspense fallback={null}>
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f5",
        }}
        dpr={dpr}
        frameloop="demand"
        orthographic
        camera={{
          position: [0, -100, 200],
          zoom: 3,
          near: 0.1,
          far: 1000,
        }}
        {...props}
      >
        <OrbitControls target={[0, 70, 0]} />
        <Grid
          args={[200, 200]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#a0a0a0"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#707070"
          fadeDistance={500}
          infiniteGrid
          rotation={[Math.PI / 2, 0, 0]}
        />
        <ambientLight intensity={4} />
        <pointLight position={[100, 100, 100]} />
        {children}
      </Canvas>
    </Suspense>
  );
}
