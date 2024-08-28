import viteLogo from "/vite.svg";
import { Card } from "@/components/ui/card";
import "./index.css";
import { Canvas } from "@react-three/fiber";

function App() {
  return (
    <div id="app" className="flex flex-col items-center text-center">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Card id="canvas-container" className="bg-foreground">
        <Canvas camera={{ position: [0, 0, 0] }}>
          <ambientLight intensity={0.1} />
          <directionalLight color="red" position={[0, 0, 5]} />
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial />
          </mesh>
        </Canvas>
      </Card>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
