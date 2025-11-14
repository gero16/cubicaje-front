import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { useStore } from '../store/store'
import { useMemo } from 'react'

// Función para obtener el color de un item basado en su índice
function getItemColor(index) {
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80',
    '#EC7063', '#5DADE2', '#F39C12', '#A569BD', '#58D68D',
    '#F1948A', '#3498DB', '#E67E22', '#1ABC9C', '#E74C3C',
  ]
  
  if (index < colorPalette.length) {
    return colorPalette[index]
  }
  
  const goldenRatio = 0.618033988749895
  const hue = (index * goldenRatio * 360) % 360
  const saturation = 60 + (index % 3) * 15
  const lightness = 45 + (Math.floor(index / 3) % 3) * 10
  
  return `hsl(${Math.floor(hue)}, ${saturation}%, ${lightness}%)`
}

// Componente para una caja individual
function Box({ position, dimensions, color, name, index, onClick }) {
  const [x, y, z] = position
  const [length, height, width] = dimensions
  
  return (
    <mesh
      position={[x + length / 2, y + height / 2, z + width / 2]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        document.body.style.cursor = 'default'
      }}
    >
      <boxGeometry args={[length, height, width]} />
      <meshStandardMaterial color={color} opacity={0.8} transparent />
    </mesh>
  )
}

// Componente para el contenedor (wireframe)
function Container({ dimensions }) {
  const [length, width, height] = dimensions
  
  // Crear las aristas del contenedor
  const edges = useMemo(() => {
    const edges = []
    const corners = [
      [0, 0, 0],
      [length, 0, 0],
      [length, 0, width],
      [0, 0, width],
      [0, height, 0],
      [length, height, 0],
      [length, height, width],
      [0, height, width],
    ]
    
    // Aristas inferiores
    edges.push([corners[0], corners[1]])
    edges.push([corners[1], corners[2]])
    edges.push([corners[2], corners[3]])
    edges.push([corners[3], corners[0]])
    
    // Aristas superiores
    edges.push([corners[4], corners[5]])
    edges.push([corners[5], corners[6]])
    edges.push([corners[6], corners[7]])
    edges.push([corners[7], corners[4]])
    
    // Aristas verticales
    edges.push([corners[0], corners[4]])
    edges.push([corners[1], corners[5]])
    edges.push([corners[2], corners[6]])
    edges.push([corners[3], corners[7]])
    
    return edges
  }, [length, width, height])
  
  return (
    <group>
      {edges.map((edge, i) => (
        <Line
          key={i}
          points={edge}
          color="gray"
          lineWidth={2}
        />
      ))}
    </group>
  )
}

// Componente para las reglas (rulers)
function Rulers({ dimensions }) {
  const [length, width, height] = dimensions
  const tickSize = 0.1
  const tickSpacing = 0.5
  
  const lengthTicks = []
  for (let i = 0; i <= length; i += tickSpacing) {
    lengthTicks.push(i)
  }
  
  const widthTicks = []
  for (let i = 0; i <= width; i += tickSpacing) {
    widthTicks.push(i)
  }
  
  const heightTicks = []
  for (let i = 0; i <= height; i += tickSpacing) {
    heightTicks.push(i)
  }
  
  return (
    <group>
      <group position={[-0.3, 0, 0]}>
        <Line
          points={[[0, 0, 0], [0, 0, length]]}
          color="black"
          lineWidth={2}
        />
        {lengthTicks.map((tick) => (
          <group key={`length-${tick}`}>
            <Line
              points={[[0, 0, tick], [-tickSize, 0, tick]]}
              color="black"
              lineWidth={1.5}
            />
            <Text
              position={[-tickSize - 0.1, 0, tick]}
              fontSize={0.08}
              color="black"
              anchorX="right"
              anchorY="middle"
            >
              {tick.toFixed(1)}m
            </Text>
          </group>
        ))}
        <Text
          position={[-0.5, 0, length / 2]}
          fontSize={0.12}
          color="black"
          rotation={[0, 0, Math.PI / 2]}
        >
          Largo
        </Text>
      </group>
      
      <group position={[0, 0, -0.3]}>
        <Line
          points={[[0, 0, 0], [width, 0, 0]]}
          color="black"
          lineWidth={2}
        />
        {widthTicks.map((tick) => (
          <group key={`width-${tick}`}>
            <Line
              points={[[tick, 0, 0], [tick, 0, -tickSize]]}
              color="black"
              lineWidth={1.5}
            />
            <Text
              position={[tick, 0, -tickSize - 0.1]}
              fontSize={0.08}
              color="black"
              anchorX="center"
              anchorY="top"
            >
              {tick.toFixed(1)}m
            </Text>
          </group>
        ))}
        <Text
          position={[width / 2, 0, -0.5]}
          fontSize={0.12}
          color="black"
        >
          Ancho
        </Text>
      </group>
      
      <group position={[-0.3, 0, -0.3]}>
        <Line
          points={[[0, 0, 0], [0, height, 0]]}
          color="black"
          lineWidth={2}
        />
        {heightTicks.map((tick) => (
          <group key={`height-${tick}`}>
            <Line
              points={[[0, tick, 0], [-tickSize, tick, 0]]}
              color="black"
              lineWidth={1.5}
            />
            <Text
              position={[-tickSize - 0.1, tick, 0]}
              fontSize={0.08}
              color="black"
              anchorX="right"
              anchorY="middle"
            >
              {tick.toFixed(1)}m
            </Text>
          </group>
        ))}
        <Text
          position={[-0.5, height / 2, 0]}
          fontSize={0.12}
          color="black"
          rotation={[0, 0, Math.PI / 2]}
        >
          Altura
        </Text>
      </group>
    </group>
  )
}

function Container3DView({ results }) {
  const { selectItem, containers, selectedContainer } = useStore()
  
  if (!results || !results.items || results.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No hay items para mostrar</p>
      </div>
    )
  }
  
  const container = containers.find(c => c.id === selectedContainer) || containers[1]
  const containerDims = container 
    ? [container.dimensions.length, container.dimensions.width, container.dimensions.height]
    : [12.19, 2.44, 2.59]
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [15, 10, 15], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Container dimensions={containerDims} />
        <Rulers dimensions={containerDims} />
        
        {results.items.map((item, index) => {
          const color = getItemColor(index)
          const position = item.position || [0, 0, 0]
          const dimensions = item.dimensions || [1, 1, 1]
          
          return (
            <Box
              key={index}
              position={position}
              dimensions={dimensions}
              color={color}
              name={item.name}
              index={index}
              onClick={() => {
                selectItem({
                  id: index,
                  name: item.name,
                  color: color,
                  realDimensions: dimensions
                })
              }}
            />
          )
        })}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
        
        <gridHelper args={[20, 20, '#888', '#ccc']} />
      </Canvas>
    </div>
  )
}

export default Container3DView

