"use client";

import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  type AgentAvatarProfile,
  createDefaultAgentAvatarProfile,
} from "@/lib/avatars/profile";
import { RunningAvatarLoader } from "@/features/agents/components/RunningAvatarLoader";

const PreviewFigure = ({
  profile,
  onFirstFrame,
}: {
  profile: AgentAvatarProfile;
  onFirstFrame: () => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const reportedReadyRef = useRef(false);

  useEffect(() => {
    reportedReadyRef.current = false;
  }, [profile]);

  useFrame((state) => {
    if (!reportedReadyRef.current) {
      reportedReadyRef.current = true;
      onFirstFrame();
    }
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.35 + 0.25;
  });

  // Disney / Pixar Minion Theme
  const MINION_YELLOW = "#facc15";
  const MINION_DENIM = "#2563eb";
  const MINION_DENIM_DARK = "#1d4ed8";
  const MINION_GLOVE = "#18181b";
  const MINION_BOOT = "#18181b";

  const skin = MINION_YELLOW;
  const topColor = MINION_YELLOW;
  const bottomColor = MINION_DENIM;
  const shoeColor = MINION_BOOT;
  const hairColor = "#18181b";
  const accessoryColor = topColor;
  const sleeveColor = MINION_YELLOW;
  const cuffColor = MINION_GLOVE;

  return (
    <group ref={groupRef} position={[0, -0.72, 0]} scale={[1.45, 1.45, 1.45]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>

      {profile.accessories.backpack ? (
        <group position={[0, 0.31, -0.08]}>
          <mesh>
            <boxGeometry args={[0.16, 0.2, 0.06]} />
            <meshLambertMaterial color={accessoryColor} />
          </mesh>
        </group>
      ) : null}

      {/* Minion denim overall legs */}
      <group position={[-0.05, 0.12, 0]}>
        <mesh>
          <boxGeometry args={[0.07, 0.14, 0.08]} />
          <meshLambertMaterial color={bottomColor} />
        </mesh>
        <mesh position={[0, -0.09, 0.012]}>
          <boxGeometry args={[0.074, 0.052, 0.13]} />
          <meshLambertMaterial color={shoeColor} />
        </mesh>
      </group>
      <group position={[0.05, 0.12, 0]}>
        <mesh>
          <boxGeometry args={[0.07, 0.14, 0.08]} />
          <meshLambertMaterial color={bottomColor} />
        </mesh>
        <mesh position={[0, -0.09, 0.012]}>
          <boxGeometry args={[0.074, 0.052, 0.13]} />
          <meshLambertMaterial color={shoeColor} />
        </mesh>
      </group>

      {/* Minion yellow torso body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.19, 0.22, 0.1]} />
        <meshLambertMaterial color={topColor} />
      </mesh>

      {/* Overalls waist & bibs */}
      <mesh position={[0, 0.23, 0]}>
        <boxGeometry args={[0.194, 0.08, 0.104]} />
        <meshLambertMaterial color={MINION_DENIM} />
      </mesh>
      <mesh position={[0, 0.29, 0.054]}>
        <boxGeometry args={[0.13, 0.12, 0.012]} />
        <meshLambertMaterial color={MINION_DENIM} />
      </mesh>
      <mesh position={[0, 0.275, 0.061]}>
        <boxGeometry args={[0.07, 0.048, 0.005]} />
        <meshLambertMaterial color={MINION_DENIM_DARK} />
      </mesh>
      <mesh position={[0, 0.275, 0.065]}>
        <circleGeometry args={[0.014, 16]} />
        <meshBasicMaterial color="#18181b" />
      </mesh>
      <mesh position={[0, 0.275, 0.066]}>
        <circleGeometry args={[0.007, 12]} />
        <meshBasicMaterial color="#d4d4d8" />
      </mesh>

      <mesh position={[0, 0.29, -0.054]}>
        <boxGeometry args={[0.13, 0.12, 0.012]} />
        <meshLambertMaterial color={MINION_DENIM} />
      </mesh>

      {/* Overalls suspenders straps */}
      <mesh position={[-0.062, 0.33, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.026, 0.17, 0.108]} />
        <meshLambertMaterial color={MINION_DENIM_DARK} />
      </mesh>
      <mesh position={[-0.055, 0.325, 0.061]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.062, 0.33, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.026, 0.17, 0.108]} />
        <meshLambertMaterial color={MINION_DENIM_DARK} />
      </mesh>
      <mesh position={[0.055, 0.325, 0.061]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Yellow bare minion arms & black gloves */}
      <group position={[-0.13, 0.3, 0]}>
        <mesh position={[0, -0.07, 0]}>
          <boxGeometry args={[0.058, 0.14, 0.058]} />
          <meshLambertMaterial color={MINION_YELLOW} />
        </mesh>
        <mesh position={[0, -0.138, 0]}>
          <boxGeometry args={[0.064, 0.025, 0.064]} />
          <meshLambertMaterial color={MINION_GLOVE} />
        </mesh>
        <mesh position={[0, -0.165, 0]}>
          <boxGeometry args={[0.052, 0.05, 0.052]} />
          <meshLambertMaterial color={MINION_GLOVE} />
        </mesh>
      </group>
      <group position={[0.13, 0.3, 0]}>
        <mesh position={[0, -0.07, 0]}>
          <boxGeometry args={[0.058, 0.14, 0.058]} />
          <meshLambertMaterial color={MINION_YELLOW} />
        </mesh>
        <mesh position={[0, -0.138, 0]}>
          <boxGeometry args={[0.064, 0.025, 0.064]} />
          <meshLambertMaterial color={MINION_GLOVE} />
        </mesh>
        <mesh position={[0, -0.165, 0]}>
          <boxGeometry args={[0.052, 0.05, 0.052]} />
          <meshLambertMaterial color={MINION_GLOVE} />
        </mesh>
      </group>

      {/* Minion neck & capsule head */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.07, 0.05, 0.07]} />
        <meshLambertMaterial color={skin} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.088, 0.055, 16, 24]} />
        <meshLambertMaterial color={skin} />
      </mesh>

      {profile.hair.style === "short" ? (
        <mesh position={[0, 0.59, 0]}>
          <boxGeometry args={[0.18, 0.05, 0.15]} />
          <meshLambertMaterial color={hairColor} />
        </mesh>
      ) : null}
      {profile.hair.style === "parted" ? (
        <>
          <mesh position={[0, 0.585, 0]}>
            <boxGeometry args={[0.18, 0.045, 0.15]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
          <mesh position={[-0.03, 0.62, 0.01]} rotation={[0.1, 0, -0.2]}>
            <boxGeometry args={[0.12, 0.03, 0.08]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
        </>
      ) : null}
      {profile.hair.style === "spiky" ? (
        <>
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[0.17, 0.035, 0.14]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
          <mesh position={[-0.05, 0.62, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
          <mesh position={[0, 0.635, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.04]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
          <mesh position={[0.05, 0.62, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
        </>
      ) : null}
      {profile.hair.style === "bun" ? (
        <>
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[0.18, 0.04, 0.15]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
          <mesh position={[0, 0.63, -0.03]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshLambertMaterial color={hairColor} />
          </mesh>
        </>
      ) : null}

      {profile.accessories.hatStyle === "cap" ? (
        <>
          <mesh position={[0, 0.63, 0]}>
            <boxGeometry args={[0.18, 0.03, 0.16]} />
            <meshLambertMaterial color={accessoryColor} />
          </mesh>
          <mesh position={[0, 0.615, 0.07]}>
            <boxGeometry args={[0.09, 0.012, 0.05]} />
            <meshLambertMaterial color={accessoryColor} />
          </mesh>
        </>
      ) : null}
      {profile.accessories.hatStyle === "beanie" ? (
        <mesh position={[0, 0.63, 0]}>
          <boxGeometry args={[0.19, 0.06, 0.17]} />
          <meshLambertMaterial color={accessoryColor} />
        </mesh>
      ) : null}

      {profile.accessories.headset ? (
        <>
          <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.095, 0.008, 8, 24, Math.PI]} />
            <meshLambertMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[-0.105, 0.51, 0]}>
            <boxGeometry args={[0.018, 0.05, 0.028]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
          <mesh position={[0.105, 0.51, 0]}>
            <boxGeometry args={[0.018, 0.05, 0.028]} />
            <meshLambertMaterial color="#475569" />
          </mesh>
        </>
      ) : null}

      {/* Minion dark goggle strap */}
      <mesh position={[0, 0.505, 0]}>
        <boxGeometry args={[0.185, 0.025, 0.178]} />
        <meshStandardMaterial color="#27272a" roughness={0.65} />
      </mesh>

      {/* Minion dual metallic silver goggles */}
      <mesh position={[-0.04, 0.505, 0.085]}>
        <torusGeometry args={[0.026, 0.0055, 12, 24]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.04, 0.505, 0.085]}>
        <torusGeometry args={[0.026, 0.0055, 12, 24]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.505, 0.09]}>
        <boxGeometry args={[0.015, 0.008, 0.008]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Eye sclera */}
      <mesh position={[-0.04, 0.505, 0.086]}>
        <circleGeometry args={[0.025, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.04, 0.505, 0.086]}>
        <circleGeometry args={[0.025, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Minion brown irises & pupils */}
      <mesh position={[-0.04, 0.505, 0.088]}>
        <circleGeometry args={[0.017, 24]} />
        <meshBasicMaterial color="#382116" />
      </mesh>
      <mesh position={[0.04, 0.505, 0.088]}>
        <circleGeometry args={[0.017, 24]} />
        <meshBasicMaterial color="#382116" />
      </mesh>

      {/* Highlights & twinkles */}
      <mesh position={[-0.034, 0.512, 0.091]}>
        <circleGeometry args={[0.006, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.046, 0.512, 0.091]}>
        <circleGeometry args={[0.006, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.046, 0.498, 0.091]}>
        <circleGeometry args={[0.0035, 12]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
      <mesh position={[0.034, 0.498, 0.091]}>
        <circleGeometry args={[0.0035, 12]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>

      {/* Rosy blush cheeks */}
      <mesh position={[-0.056, 0.465, 0.086]}>
        <circleGeometry args={[0.016, 20]} />
        <meshBasicMaterial color="#ff8ca3" transparent opacity={0.78} />
      </mesh>
      <mesh position={[0.056, 0.465, 0.086]}>
        <circleGeometry args={[0.016, 20]} />
        <meshBasicMaterial color="#ff8ca3" transparent opacity={0.78} />
      </mesh>

      {/* Minion sprout hair tuft on top */}
      <group position={[0, 0.62, 0]}>
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.0025, 0.004, 0.032, 8]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        <mesh position={[-0.012, 0.015, 0]} rotation={[0, 0, 0.22]}>
          <cylinderGeometry args={[0.002, 0.0035, 0.026, 8]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        <mesh position={[0.012, 0.015, 0]} rotation={[0, 0, -0.22]}>
          <cylinderGeometry args={[0.002, 0.0035, 0.026, 8]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
      </group>

      {/* Cute coral smile */}
      <mesh position={[0, 0.458, 0.088]}>
        <boxGeometry args={[0.052, 0.014, 0.01]} />
        <meshBasicMaterial color="#c45869" />
      </mesh>
    </group>
  );
};

export const AgentAvatarPreview3D = ({
  profile,
  className = "",
}: {
  profile: AgentAvatarProfile | null | undefined;
  className?: string;
}) => {
  const resolvedProfile = useMemo(
    () => profile ?? createDefaultAgentAvatarProfile("preview"),
    [profile]
  );
  const profileKey = useMemo(() => JSON.stringify(resolvedProfile), [resolvedProfile]);
  const [readyProfileKey, setReadyProfileKey] = useState<string | null>(null);
  const isReady = readyProfileKey === profileKey;

  return (
    <div className={`relative ${className}`}>
      {!isReady ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#070b16] text-white/70">
          <RunningAvatarLoader size={26} trackWidth={72} label="Loading avatar..." />
        </div>
      ) : null}
      <Canvas key={profileKey} camera={{ position: [0, 0.7, 2.5], fov: 34 }}>
        <color attach="background" args={["#070b16"]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 4, 5]} intensity={2.4} />
        <directionalLight position={[-4, 2, 3]} intensity={0.9} color="#89a6ff" />
        <PreviewFigure
          profile={resolvedProfile}
          onFirstFrame={() => {
            setReadyProfileKey(profileKey);
          }}
        />
        <Environment preset="city" />
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={1.8} minPolarAngle={1.1} />
      </Canvas>
    </div>
  );
};
