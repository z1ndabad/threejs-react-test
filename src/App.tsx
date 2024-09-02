import { HollowGlobe } from "@/components/mesh/HollowGlobe";
import { Card, CardContent } from "@/components/ui/card";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import "@/index.css";
import viteLogo from "/vite.svg";

// TODO: scale canvas based on parent dimensions

function App() {
  const { containerRef, dimensions = { width: 0, height: 0 } } =
    useResizeObserver<HTMLDivElement>();
  const { width = 0, height = 0 } = dimensions;
  return (
    <div id="app" className="flex h-full flex-col items-center text-center">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Card id="canvas-container" className="bg-black h-3/4 w-3/4">
        <CardContent className="h-full" ref={containerRef}>
          <HollowGlobe width={width} height={height} />
        </CardContent>
      </Card>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
