import { useEffect, useState } from "react";
import { useThree, type MeshProps } from "@react-three/fiber";
import { useFBX, useAnimations } from "@react-three/drei";

function Player(props: MeshProps) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const fbx = useFBX("/golf-drive.fbx");

  const { ref, actions, mixer } = useAnimations(fbx.animations);

  // const { width, height } = useThree((state) => state.viewport);
  useEffect(() => {
    if (actions["mixamo.com"]) {
      const swing = actions["mixamo.com"];
      if (active) {
        swing.play();
      } else {
        swing.stop();
      }
    }
  }, [actions, mixer, fbx.animations, active]);

  return (
    <primitive
      object={fbx}
      scale={0.05}
      {...props}
      position={[0, -5, 0]}
      ref={ref}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

export { Player };
