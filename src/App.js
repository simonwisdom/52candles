import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import { PerspectiveCamera, Environment, Stage, Html } from '@react-three/drei';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import flame from './assets/flame.png'
import woodenFloor from './assets/brown-wooden-flooring.jpg'
import candleWax from './assets/candle-wax2.webp'

import { extend } from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import myFont from './assets/Roboto_Regular.json'

extend({ TextGeometry })

function CameraControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef(new THREE.Object3D());
  const controls = new OrbitControls(camera, gl.domElement);

  // Set the zoom and rotate speeds
  controls.zoomSpeed = 0.05;
  controls.rotateSpeed = 0.2;

  useFrame(() => controls.update());
  return null;
}

function getScreenPosition(mesh, camera, width, height) {
  const position = mesh.position.clone();
  const worldMatrix = mesh.matrixWorld.clone();

  // Compute the position of the mesh in world space
  position.applyMatrix4(worldMatrix);

  const vector = position.project(camera);
  const widthHalf = 0.5 * width;
  const heightHalf = 0.5 * height;

  vector.x = (vector.x * widthHalf) + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y
  };
}

function TableLeg(props) {
  const { position } = props;
  const texture = useLoader(THREE.TextureLoader, woodenFloor)
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.2, 0.2, 2, 32]} />
      <meshBasicMaterial attach="material" map={texture} />
    </mesh>
  );
}

function Table(props) {
  const tableRef = useRef();
  const tableLegs = useRef();
  const texture = useLoader(THREE.TextureLoader, woodenFloor)

  return (
    <group ref={tableRef}>
      <mesh {...props}>
        <boxGeometry args={[5, 0.2, 5]} />
        {/* <meshLambertMaterial color={0x8B4513} /> */}
        <meshBasicMaterial attach="material" map={texture} />
      </mesh>
      <group ref={tableLegs}>
        <TableLeg position={[2,-1.5,2]} />
        <TableLeg position={[-2,-1.5,2]} />
        <TableLeg position={[2,-1.5,-2]} />
        <TableLeg position={[-2,-1.5,-2]} />
      </group>

  </group>
  );
}

function FloatingNumber(text){
  const font = new FontLoader().parse(myFont);
  const displayText = text.text
  const textRef = useRef();

  const textOptions = {
    font,
    size: 0.1,
    height: 0.01,
  };


  return (
    <mesh position={[-0.1,0.6,0]} ref={textRef}
    >
        <textGeometry args={[`${displayText}`, textOptions]}/>
        <meshLambertMaterial attach='material' />
    </mesh>
   )
}

function CandleFlame(props, onClick) {
  const flameRef = useRef();
  const { position } = props;
  const texture = useLoader(THREE.TextureLoader, flame)
  const [showObject, setShowObject] = useState(false);
  const [hover, setHover] = useState(false);
  const { camera } = useThree();

  const index = props.index;

  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  const weekNumber = Math.floor((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  // console.log(index, weekNumber);

  const showFlame = () => {
    if (index < weekNumber) {
      setShowObject(true);
    }
  }

  useEffect(() => {
    showFlame();
  }, []);

  // if hover then make cursor a pointer
  useEffect(() => {
    if (hover && showObject) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
  })

  const handleClick = () => {
    if (onClick && showObject) {
      // Get the 2D position of the text box
      const { x, y } = getScreenPosition(flameRef.current, camera, window.innerWidth, window.innerHeight);

      console.log('Clicked', x, y);

      return (
        <mesh>
        <Html center>
          <div
            className='popup'
            style={{ position: 'absolute', left: `${x}px`, top: `${y}px` }}
            onClick={onClick}
          >
            Test
          </div>
        </Html>
        </mesh>
      );

      // // Create a new div to hold the popup content
      // const popup = document.createElement('div');
      // popup.classList.add('popup');
      // popup.style.left = `${x}px`;
      // popup.style.top = `${y}px`;

      // // Add some content to the popup
      // popup.innerHTML = 'Hello, world!';

      // // Append the popup to the document
      // document.body.appendChild(popup);

      // // Remove the popup when the user clicks outside of it
      // const removePopup = () => {
      //   document.body.removeChild(popup);
      //   document.removeEventListener('click', removePopup);
      // };

      // document.addEventListener('click', removePopup);
    }
  };

  // Animate the flame
  // useFrame(() => {
  //   flameRef.current.rotation.x += 0.01;
  //   flameRef.current.rotation.y += 0.01;
  // });

  return (
    <group ref={flameRef} visible={showObject} onClick={handleClick}>
    <mesh position={position}
    onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}
    >
      <planeGeometry attach="geometry" args={[0.15, 0.3]} />
      <meshBasicMaterial attach="material" map={texture} transparent />
    </mesh>
      <FloatingNumber position={[0,0,0]} text={`${index + 1}`}/>
    </group>
  );
}


function Candle({ position, index }) {
  const candleRef = useRef();
  // const { position } = props;
  const texture = useLoader(THREE.TextureLoader, candleWax)

  // Candle material
  const candleMaterial = new THREE.MeshStandardMaterial({
    color: "#E7E0CC",
    roughness: 1.5,
    metalness: 0.2,
    map: texture,
  });

  // Candle geometry
  const candleGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1, 32);

  // Candle mesh
  return (
    <group ref={candleRef} position={position} >
      <mesh geometry={candleGeometry} material={candleMaterial} />
      <CandleFlame position={[0,0.6,0]} index={index}/>
    </group>
  );
}

function CandleScene() {
  const lightRef = useRef();
  const angleRef = useRef(0);
  useFrame(() => {
    angleRef.current += 0.01;
    const radius = 1;
    const x = Math.sin(angleRef.current) * radius;
    const z = Math.cos(angleRef.current) * radius;
    lightRef.current.position.set(x, 1, z);
    lightRef.current.intensity = 0.5 + Math.random() * 0.5;
  });
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight ref={lightRef} color={0xffa500} distance={10} />
      <Table position={[0, -0.5, 0]} />

      {/* First 50 candles */}
      {Array.from({ length: 50 }).map((_, i) => {
        const row = Math.floor(i / 10) - 2.3;
        const column = i % 10 - 4.5;
        const x = column * 0.4;
        const z = row * 0.8;
        const y = 0;
        return <Candle key={i} position={[x, y, z]} index={i}/>;
      })}

      {/* Final 2 candles */}
         {Array.from({ length: 2 }).map((_, i) => {
        const row = Math.floor(i / 10) + 2.5;
        const column = i % 10 - 4.5;
        const x = column * 0.4;
        const z = row * 0.8;
        const y = 0;
        return <Candle key={i} position={[x, y, z]} />;
      })}
    </>
  );
}


function App() {
  return (
    <Canvas>
      <Suspense fallback={null}>
          <Stage environment={null} intensity={1} contactShadowOpacity={0.1} shadowBias={-0.0015}>
          <Environment
              background={true} // Whether to affect scene.background
              files={'cathedral.hdr'}
              path={'/'}
            />
          </Stage>
        </Suspense>
       <PerspectiveCamera position={[0, 0, 3]} />
      <CandleScene />
      <CameraControls />
    </Canvas>
  );
}

export default App;
