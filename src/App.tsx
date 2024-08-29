import viteLogo from "/vite.svg";
import { Card } from "@/components/ui/card";
import "./index.css";
import { Canvas } from "@react-three/fiber";
import { Player } from "@/components/mesh/Player";

function App() {
  return (
    <div id="app" className="flex h-full flex-col items-center text-center">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Card id="canvas-container" className="bg-foreground h-3/4 w-3/4">
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.01} />
          <directionalLight color="white" position={[5, 0, 0]} />
          <Player />
        </Canvas>
      </Card>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
