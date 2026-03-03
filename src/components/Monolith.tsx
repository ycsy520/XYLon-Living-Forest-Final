import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Monolith: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, wireframeGeo } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.5, 0);
    const wire = new THREE.WireframeGeometry(geo);
    return { geometry: geo, wireframeGeo: wire };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      wireframeGeo.dispose();
    };
  }, [geometry, wireframeGeo]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.rotation.y = time * 0.1;
      meshRef.current.position.y = 1 + Math.sin(time) * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 1, 0]} geometry={geometry}>
        <meshPhysicalMaterial
          color={0x050505}
          roughness={0.1}
          metalness={0.9}
          transmission={0.2}
          emissive={0x0ea5e9} // Sky 500
          emissiveIntensity={0.5}
          flatShading={true}
        />
        <lineSegments scale={[1.05, 1.05, 1.05]} geometry={wireframeGeo}>
          <lineBasicMaterial
            color={0x38bdf8} // Sky 400
            opacity={0.3}
            transparent={true}
          />
        </lineSegments>
      </mesh>
    </group>
  );
};
