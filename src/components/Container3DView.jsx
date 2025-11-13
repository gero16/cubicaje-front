import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useMemo } from 'react'
import { useStore } from '../store/store'

function Container3DView({ results }) {
  const { containers, selectedContainer, selectItem, selectedItem } = useStore()
  
  const container = containers.find(c => c.id === selectedContainer) || containers[1]
  const containerDims = container.dimensions

  // Escalar para visualización (multiplicar por 10 para mejor visualización)
  const scale = 10
  // Mapear dimensiones del contenedor: [length, width, height] -> [width, height, length] para Three.js
  const containerSize = [
    containerDims.width * scale,   // width -> x
    containerDims.height * scale,   // height -> y
    containerDims.length * scale,   // length -> z
  ]

  // Calcular posición de cámara basada en el tamaño del contenedor
  const maxDimension = Math.max(...containerSize)
  const cameraDistance = maxDimension * 2.5 // Alejar la cámara más
  const cameraPosition = [
    cameraDistance,
    cameraDistance * 0.8, // Ligeramente más alto
    cameraDistance
  ]

  // Función para obtener color consistente basado en índice
  // Usa una distribución mejorada del espacio de color HSL para mayor variedad
  const getItemColor = (index) => {
    // Paleta de colores predefinida para los primeros 20 items
    const colorPalette = [
      '#FF6B6B', // Rojo coral
      '#4ECDC4', // Turquesa
      '#45B7D1', // Azul cielo
      '#FFA07A', // Salmón
      '#98D8C8', // Verde menta
      '#F7DC6F', // Amarillo
      '#BB8FCE', // Púrpura claro
      '#85C1E2', // Azul claro
      '#F8B739', // Naranja
      '#52BE80', // Verde esmeralda
      '#EC7063', // Rojo claro
      '#5DADE2', // Azul
      '#F39C12', // Naranja oscuro
      '#A569BD', // Púrpura
      '#58D68D', // Verde lima
      '#F1948A', // Rosa salmón
      '#3498DB', // Azul brillante
      '#E67E22', // Naranja quemado
      '#1ABC9C', // Verde turquesa
      '#E74C3C', // Rojo
    ]
    
    // Si hay menos de 20 items, usar la paleta predefinida
    if (index < colorPalette.length) {
      return colorPalette[index]
    }
    
    // Para más de 20 items, usar distribución mejorada en HSL
    // Usar el número áureo (golden ratio) para distribución uniforme
    const goldenRatio = 0.618033988749895
    const hue = (index * goldenRatio * 360) % 360
    
    // Variar saturación y luminosidad para más variedad
    const saturation = 60 + (index % 3) * 15 // 60%, 75%, 90%
    const lightness = 45 + (Math.floor(index / 3) % 3) * 10 // 45%, 55%, 65%
    
    return `hsl(${Math.floor(hue)}, ${saturation}%, ${lightness}%)`
  }
  
  const items = useMemo(() => {
    if (!results.items) return []
    
    return results.items.map((item, index) => {
      // Asumimos que el item tiene dimensiones en el resultado
      // Si no, usamos dimensiones por defecto
      const itemDims = item.dimensions || [1, 1, 1]
      const position = item.position || [0, 0, 0]
      
      // El backend devuelve: position = [length (z), height (y), width (x)]
      // Necesitamos convertir a: [x (width), y (height), z (length)] para Three.js
      // position[0] = length (z en Three.js)
      // position[1] = height (y en Three.js)
      // position[2] = width (x en Three.js)
      
      return {
        id: index,
        name: item.name || `Item ${index + 1}`,
        // Convertir coordenadas: [length, height, width] -> [width, height, length]
        position: [
          position[2] * scale,  // width -> x
          position[1] * scale,   // height -> y
          position[0] * scale,   // length -> z
        ],
        // Dimensiones: [length, width, height] -> [width, height, length]
        size: [
          itemDims[1] * scale,  // width -> x
          itemDims[2] * scale,  // height -> y
          itemDims[0] * scale,  // length -> z
        ],
        // Guardar dimensiones reales para mostrar en las etiquetas
        realDimensions: itemDims,
        color: getItemColor(index),
        weight: item.weight,
        originalItem: item, // Guardar referencia al item original
      }
    })
  }, [results.items, scale])

  return (
    <Canvas camera={{ position: cameraPosition, fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      
      {/* Contenedor (wireframe) */}
      <mesh position={[containerSize[0] / 2, containerSize[1] / 2, containerSize[2] / 2]}>
        <boxGeometry args={containerSize} />
        <meshStandardMaterial color="#cccccc" wireframe opacity={0.3} transparent />
      </mesh>

      {/* Items */}
      {items.map((item) => {
        const itemPosition = [
          item.position[0] + item.size[0] / 2,
          item.position[1] + item.size[1] / 2,
          item.position[2] + item.size[2] / 2,
        ]
        
        const isSelected = selectedItem?.id === item.id
        
        return (
          <group key={item.id}>
            {/* Caja - clickeable */}
            <mesh 
              position={itemPosition}
              onClick={(e) => {
                e.stopPropagation()
                selectItem(item)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'auto'
              }}
            >
              <boxGeometry args={item.size} />
              <meshStandardMaterial 
                color={item.color} 
                opacity={isSelected ? 0.8 : 1}
                transparent={isSelected}
                emissive={isSelected ? item.color : '#000000'}
                emissiveIntensity={isSelected ? 0.3 : 0}
              />
            </mesh>
            
            {/* Borde resaltado si está seleccionado */}
            {isSelected && (
              <mesh position={itemPosition}>
                <boxGeometry args={[
                  item.size[0] + 0.2,
                  item.size[1] + 0.2,
                  item.size[2] + 0.2
                ]} />
                <meshStandardMaterial 
                  color="#ffff00" 
                  wireframe 
                  opacity={0.8}
                  transparent
                />
              </mesh>
            )}
            
            {/* Etiqueta con nombre - más grande y visible */}
            <Text
              position={[
                itemPosition[0],
                itemPosition[1] + item.size[1] / 2 + 1.2, // Más arriba
                itemPosition[2]
              ]}
              fontSize={1.2}
              color={isSelected ? "#ffff00" : "#000000"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#ffffff"
              fontWeight="bold"
            >
              {item.name}
            </Text>
            
            {/* Etiqueta con dimensiones - más visible */}
            <Text
              position={[
                itemPosition[0],
                itemPosition[1] + item.size[1] / 2 + 0.5,
                itemPosition[2]
              ]}
              fontSize={0.7}
              color={isSelected ? "#ffff00" : "#333333"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.03}
              outlineColor="#ffffff"
            >
              {item.realDimensions[0].toFixed(2)}×{item.realDimensions[1].toFixed(2)}×{item.realDimensions[2].toFixed(2)}m
            </Text>
          </group>
        )
      })}

      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={maxDimension * 0.5} // Distancia mínima de zoom
        maxDistance={maxDimension * 5} // Distancia máxima de zoom (muy alejado)
        enablePan={true} // Permitir movimiento lateral
        enableZoom={true} // Permitir zoom con rueda del mouse
        enableRotate={true} // Permitir rotación
        autoRotate={false}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.8}
        onClick={(e) => {
          // Si se hace click en el fondo, deseleccionar
          if (e.intersections.length === 0) {
            useStore.getState().deselectItem()
          }
        }}
      />
    </Canvas>
  )
}

export default Container3DView

