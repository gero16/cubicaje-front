import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import { useStore } from '../store/store'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

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
function Box({ position, dimensions, color, name, index, onClick, isPallet, offset }) {
  const [x, y, z] = position
  const [length, height, width] = dimensions
  const [offsetX, offsetY, offsetZ] = offset || [0, 0, 0]
  
  // Aplicar offset a la posición
  const adjustedX = x + offsetX
  const adjustedY = y + offsetY
  const adjustedZ = z + offsetZ
  
  // Si es un pallet, usar estilo wireframe y color marrón
  if (isPallet) {
    return (
      <group>
        <mesh
          position={[adjustedX + length / 2, adjustedY + height / 2, adjustedZ + width / 2]}
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
          <meshStandardMaterial 
            color="#8B4513" 
            opacity={0.6} 
            transparent 
            wireframe={false}
          />
        </mesh>
        {/* Mostrar estructura del pallet con líneas */}
        <Line
          points={[
            [adjustedX, adjustedY, adjustedZ],
            [adjustedX + length, adjustedY, adjustedZ],
            [adjustedX + length, adjustedY, adjustedZ + width],
            [adjustedX, adjustedY, adjustedZ + width],
            [adjustedX, adjustedY, adjustedZ],
            [adjustedX, adjustedY + height, adjustedZ],
            [adjustedX + length, adjustedY + height, adjustedZ],
            [adjustedX + length, adjustedY + height, adjustedZ + width],
            [adjustedX, adjustedY + height, adjustedZ + width],
            [adjustedX, adjustedY + height, adjustedZ],
          ]}
          color="#654321"
          lineWidth={2}
        />
      </group>
    )
  }
  
  return (
    <mesh
      position={[adjustedX + length / 2, adjustedY + height / 2, adjustedZ + width / 2]}
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
function Container({ dimensions, offset }) {
  const [length, width, height] = dimensions
  const [offsetX, offsetY, offsetZ] = offset || [0, 0, 0]
  
  // Crear las aristas del contenedor
  const edges = useMemo(() => {
    const edges = []
    const corners = [
      [0 + offsetX, 0 + offsetY, 0 + offsetZ],
      [length + offsetX, 0 + offsetY, 0 + offsetZ],
      [length + offsetX, 0 + offsetY, width + offsetZ],
      [0 + offsetX, 0 + offsetY, width + offsetZ],
      [0 + offsetX, height + offsetY, 0 + offsetZ],
      [length + offsetX, height + offsetY, 0 + offsetZ],
      [length + offsetX, height + offsetY, width + offsetZ],
      [0 + offsetX, height + offsetY, width + offsetZ],
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
function Rulers({ dimensions, offset }) {
  const [length, width, height] = dimensions
  const [offsetX, offsetY, offsetZ] = offset || [0, 0, 0]
  const tickSize = 0.15  // Aumentado de 0.1 a 0.15 para marcas más visibles
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
      <group position={[-0.4 + offsetX, offsetY, offsetZ]}>
        <Line
          points={[[0, 0, 0], [0, 0, length]]}
          color="#1a1a1a"
          lineWidth={4}
        />
        {lengthTicks.map((tick) => (
          <group key={`length-${tick}`}>
            <Line
              points={[[0, 0, tick], [-tickSize, 0, tick]]}
              color="#1a1a1a"
              lineWidth={3}
            />
            <Text
              position={[-tickSize - 0.15, 0, tick]}
              fontSize={0.15}
              color="#1a1a1a"
              anchorX="right"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#ffffff"
            >
              {tick.toFixed(1)}m
            </Text>
          </group>
        ))}
        <Text
          position={[-0.7, 0, length / 2]}
          fontSize={0.2}
          color="#1a1a1a"
          rotation={[0, 0, Math.PI / 2]}
          outlineWidth={0.03}
          outlineColor="#ffffff"
        >
          Largo
        </Text>
      </group>
      
      <group position={[offsetX, offsetY, -0.4 + offsetZ]}>
        <Line
          points={[[0, 0, 0], [width, 0, 0]]}
          color="#1a1a1a"
          lineWidth={4}
        />
        {widthTicks.map((tick) => (
          <group key={`width-${tick}`}>
            <Line
              points={[[tick, 0, 0], [tick, 0, -tickSize]]}
              color="#1a1a1a"
              lineWidth={3}
            />
            <Text
              position={[tick, 0, -tickSize - 0.15]}
              fontSize={0.15}
              color="#1a1a1a"
              anchorX="center"
              anchorY="top"
              outlineWidth={0.02}
              outlineColor="#ffffff"
            >
              {tick.toFixed(1)}m
            </Text>
          </group>
        ))}
        <Text
          position={[width / 2, 0, -0.7]}
          fontSize={0.2}
          color="#1a1a1a"
          outlineWidth={0.03}
          outlineColor="#ffffff"
        >
          Ancho
        </Text>
      </group>
      
      <group position={[-0.4 + offsetX, offsetY, -0.4 + offsetZ]}>
        <Line
          points={[[0, 0, 0], [0, height, 0]]}
          color="#1a1a1a"
          lineWidth={4}
        />
        {heightTicks.map((tick) => (
          <group key={`height-${tick}`}>
            <Line
              points={[[0, tick, 0], [-tickSize, tick, 0]]}
              color="#1a1a1a"
              lineWidth={3}
            />
            <Text
              position={[-tickSize - 0.15, tick, 0]}
              fontSize={0.15}
              color="#1a1a1a"
              anchorX="right"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#ffffff"
            >
              {tick.toFixed(1)}m
            </Text>
          </group>
        ))}
        <Text
          position={[-0.7, height / 2, 0]}
          fontSize={0.2}
          color="#1a1a1a"
          rotation={[0, 0, Math.PI / 2]}
          outlineWidth={0.03}
          outlineColor="#ffffff"
        >
          Altura
        </Text>
      </group>
    </group>
  )
}

function Container3DView({ results, productsNotEntered = [] }) {
  const { selectItem, containers, selectedContainer } = useStore()
  const controlsRef = useRef()
  
  const container = containers.find(c => c.id === selectedContainer) || containers[1]
  const containerDims = container 
    ? [container.dimensions.length, container.dimensions.width, container.dimensions.height]
    : [12.19, 2.44, 2.59]
  
  if ((!results || !results.items || results.items.length === 0) && productsNotEntered.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No hay items para mostrar</p>
      </div>
    )
  }
  
  // Calcular offset para el contenedor principal
  const [length, width, height] = containerDims
  const containerOffset = [-length / 2, 0, -width / 2]
  
  // Calcular posición de cámara para ver tanto el contenedor como el área de exclusión
  const hasExcludedProducts = productsNotEntered.length > 0
  const cameraPosition = hasExcludedProducts 
    ? [20, 12, 15] // Más alejada y alta para ver ambas áreas
    : [15, 10, 15] // Posición normal si no hay productos excluidos
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Contenedor principal con items que entraron */}
        {results && results.items && results.items.length > 0 && (
          <>
            <Container dimensions={containerDims} offset={containerOffset} />
            <Rulers dimensions={containerDims} offset={containerOffset} />
            
            {results.items.map((item, index) => {
              const isPallet = item.type === 'pallet' || item.name?.startsWith('Pallet_')
              const color = isPallet ? '#8B4513' : getItemColor(index)
              const position = item.position || [0, 0, 0]
              const dimensions = item.dimensions || [1, 1, 1]
              
              return (
                <Box
                  key={`entered-${index}`}
                  position={position}
                  dimensions={dimensions}
                  color={color}
                  name={item.name}
                  index={index}
                  isPallet={isPallet}
                  offset={containerOffset}
                  onClick={() => {
                    selectItem({
                      id: index,
                      name: item.name,
                      color: color,
                      realDimensions: dimensions,
                      isPallet: isPallet
                    })
                  }}
                />
              )
            })}
          </>
        )}
        
        {/* Área de productos que no entraron */}
        {productsNotEntered.length > 0 && (() => {
          // Calcular área para productos excluidos (a la derecha del contenedor)
          const excludedAreaWidth = Math.max(8, containerDims[0] * 0.8)
          const excludedAreaDepth = Math.max(6, containerDims[2] * 0.8)
          
          // Calcular posición del área de exclusión (a la derecha del contenedor)
          const excludedOffsetX = containerDims[0] / 2 + excludedAreaWidth / 2 + 3
          const excludedOffsetY = 0
          const excludedOffsetZ = -containerDims[2] / 2
          
          // Organizar productos en un grid
          const itemsPerRow = Math.ceil(Math.sqrt(productsNotEntered.length))
          const spacing = 0.8 // Espacio entre cajas
          
          // Calcular el tamaño máximo de caja para el espaciado
          const maxBoxSize = Math.max(
            ...productsNotEntered.map(p => Math.max(...p.dimensions))
          )
          
          return (
            <group>
              {/* Área visual delimitada para productos excluidos (rectángulo en el suelo) */}
              <Line
                points={[
                  [excludedOffsetX - excludedAreaWidth / 2, excludedOffsetY, excludedOffsetZ - excludedAreaDepth / 2],
                  [excludedOffsetX + excludedAreaWidth / 2, excludedOffsetY, excludedOffsetZ - excludedAreaDepth / 2],
                  [excludedOffsetX + excludedAreaWidth / 2, excludedOffsetY, excludedOffsetZ + excludedAreaDepth / 2],
                  [excludedOffsetX - excludedAreaWidth / 2, excludedOffsetY, excludedOffsetZ + excludedAreaDepth / 2],
                  [excludedOffsetX - excludedAreaWidth / 2, excludedOffsetY, excludedOffsetZ - excludedAreaDepth / 2],
                ]}
                color="#ff6b6b"
                lineWidth={3}
              />
              
              {/* Etiqueta del área */}
              <Text
                position={[excludedOffsetX, excludedOffsetY + 1.5, excludedOffsetZ]}
                fontSize={0.2}
                color="#ff6b6b"
                anchorX="center"
                anchorY="middle"
              >
                Productos Excluidos
              </Text>
              
              {/* Renderizar productos excluidos */}
              {productsNotEntered.map((product, index) => {
                const row = Math.floor(index / itemsPerRow)
                const col = index % itemsPerRow
                
                // Calcular posición dentro del área de exclusión
                const totalWidth = itemsPerRow * (maxBoxSize + spacing) - spacing
                const startX = excludedOffsetX - totalWidth / 2
                const startZ = excludedOffsetZ - excludedAreaDepth / 2 + 1
                
                const [dimLength, dimHeight, dimWidth] = product.dimensions
                const x = startX + col * (maxBoxSize + spacing) + dimLength / 2
                const z = startZ + row * (maxBoxSize + spacing)
                const y = excludedOffsetY + dimHeight / 2
                
                // Usar color rojo/naranja para indicar que no entró
                const excludedColor = product.priority === 2 ? '#ff4444' : '#ff8800'
                
                return (
                  <mesh
                    key={`excluded-${index}`}
                    position={[x, y, z]}
                    onClick={() => {
                      selectItem({
                        id: `excluded-${index}`,
                        name: product.name,
                        color: excludedColor,
                        realDimensions: product.dimensions,
                        isPallet: false,
                        isExcluded: true
                      })
                    }}
                    onPointerOver={(e) => {
                      e.stopPropagation()
                      document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={(e) => {
                      document.body.style.cursor = 'default'
                    }}
                  >
                    <boxGeometry args={[dimLength, dimHeight, dimWidth]} />
                    <meshStandardMaterial 
                      color={excludedColor} 
                      opacity={0.7} 
                      transparent
                      wireframe={false}
                    />
                  </mesh>
                )
              })}
            </group>
          )
        })()}
        
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={100}
          panSpeed={1.5}
          zoomSpeed={1.2}
          rotateSpeed={0.8}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
        />
        
        <gridHelper args={hasExcludedProducts ? [40, 40, '#888', '#ccc'] : [20, 20, '#888', '#ccc']} />
      </Canvas>
    </div>
  )
}

export default Container3DView

