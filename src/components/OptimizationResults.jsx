import { useStore } from '../store/store'
import Container3DView from './Container3DView'

// Función para obtener el color de un item basado en su índice
// Usa la misma lógica que Container3DView para consistencia
function getItemColor(index) {
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

function OptimizationResults() {
  const { results, selectedItem, deselectItem } = useStore()

  if (!results) return null

  const totalWeight = results.items?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Advertencia si hay items que no caben */}
      {results.items_that_dont_fit && results.items_that_dont_fit.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-orange-500 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Algunos productos no caben en el contenedor
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p className="mb-2">Los siguientes productos quedaron fuera:</p>
                <ul className="list-disc list-inside space-y-1">
                  {results.items_that_dont_fit.map((item, index) => (
                    <li key={index} className={item.priority === 2 ? 'font-bold text-red-700' : ''}>
                      <strong>{item.name}</strong>
                      {item.priority === 2 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-semibold">
                          CRÍTICA (Prioridad 2)
                        </span>
                      )}
                      {' '}- Dimensiones: {item.dimensions[0].toFixed(2)}m × {item.dimensions[1].toFixed(2)}m × {item.dimensions[2].toFixed(2)}m
                      {item.max_dimension && (
                        <span className="text-orange-600">
                          {' '}(Dimensión máxima: {item.max_dimension.toFixed(2)}m)
                        </span>
                      )}
                      {item.reason && (
                        <span className="text-gray-600 text-xs block ml-4">
                          Razón: {item.reason}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-orange-600">
                  Se empaquetaron {results.items?.length || 0} productos que sí caben en el contenedor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Eficiencia</p>
          <p className="text-3xl font-bold text-blue-600">
            {results.efficiency?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Volumen usado</p>
          <p className="text-3xl font-bold text-green-600">
            {results.used_volume?.toFixed(2) || 0} m³
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Volumen libre</p>
          <p className="text-3xl font-bold text-purple-600">
            {results.free_volume?.toFixed(2) || 0} m³
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Peso total</p>
          <p className="text-3xl font-bold text-orange-600">
            {totalWeight.toFixed(2)} kg
          </p>
        </div>
      </div>

      {/* Información del algoritmo */}
      {results.strategy_used && (
        <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Estrategia de optimización:</span>{' '}
            <span className="text-indigo-700">
              {results.strategy_used === 'volumen_desc' && 'Volumen descendente (más grandes primero)'}
              {results.strategy_used === 'volumen_asc' && 'Volumen ascendente (más pequeños primero)'}
              {results.strategy_used === 'peso_desc' && 'Peso descendente'}
              {results.strategy_used === 'area_superficie_desc' && 'Área de superficie descendente'}
              {results.strategy_used === 'altura_desc' && 'Altura descendente'}
              {results.strategy_used === 'default' && 'Estrategia por defecto'}
              {!['volumen_desc', 'volumen_asc', 'peso_desc', 'area_superficie_desc', 'altura_desc', 'default'].includes(results.strategy_used) && results.strategy_used}
            </span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            El algoritmo probó múltiples estrategias y seleccionó la más eficiente
          </p>
        </div>
      )}

      {/* Visualización 3D */}
      <div className="bg-gray-100 rounded-lg p-4 relative" style={{ height: '500px' }}>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Visualización 3D
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Haz click en una caja para ver detalles)
          </span>
        </h3>
        <Container3DView results={results} />
        
        {/* Panel de información de caja seleccionada */}
        {selectedItem && (
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-xl p-4 border-2 border-yellow-400 max-w-xs z-10">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-800">Caja Seleccionada</h4>
              <button
                onClick={deselectItem}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: selectedItem.color }}
                />
                <span className="font-semibold text-gray-800">{selectedItem.name}</span>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Dimensiones:</span>
                </p>
                <p className="text-sm text-gray-800 ml-4">
                  Largo: {selectedItem.realDimensions[0].toFixed(2)} m<br/>
                  Ancho: {selectedItem.realDimensions[1].toFixed(2)} m<br/>
                  Alto: {selectedItem.realDimensions[2].toFixed(2)} m
                </p>
              </div>
              
              {results.items.find(i => i.name === selectedItem.name)?.weight && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Peso:</span>{' '}
                    {results.items.find(i => i.name === selectedItem.name).weight.toFixed(2)} kg
                  </p>
                </div>
              )}
              
              {results.items.find(i => i.name === selectedItem.name)?.position && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Posición:</span>
                  </p>
                  <p className="text-sm text-gray-800 ml-4">
                    X: {results.items.find(i => i.name === selectedItem.name).position[0].toFixed(2)} m<br/>
                    Y: {results.items.find(i => i.name === selectedItem.name).position[1].toFixed(2)} m<br/>
                    Z: {results.items.find(i => i.name === selectedItem.name).position[2].toFixed(2)} m
                  </p>
                </div>
              )}
              
              {results.items.find(i => i.name === selectedItem.name)?.efficiency_score !== undefined && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Score de Eficiencia:</span>
                  </p>
                  <div className="ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            (results.items.find(i => i.name === selectedItem.name).efficiency_score || 0) >= 80 ? 'bg-green-500' :
                            (results.items.find(i => i.name === selectedItem.name).efficiency_score || 0) >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, results.items.find(i => i.name === selectedItem.name).efficiency_score || 0)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {results.items.find(i => i.name === selectedItem.name).efficiency_score?.toFixed(1) || 0}/100
                      </span>
                    </div>
                    {results.items.find(i => i.name === selectedItem.name).could_improve && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Se encontraron {results.items.find(i => i.name === selectedItem.name).alternative_positions || 0} posiciones alternativas mejores
                      </p>
                    )}
                    {!results.items.find(i => i.name === selectedItem.name).could_improve && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Esta es una posición óptima para esta caja
                      </p>
                    )}
                    {results.items.find(i => i.name === selectedItem.name).empty_spaces_around !== undefined && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Espacios vacíos alrededor:</span>{' '}
                          {results.items.find(i => i.name === selectedItem.name).empty_spaces_around?.toFixed(2) || 0} m²
                        </p>
                        {results.items.find(i => i.name === selectedItem.name).space_utilization !== undefined && (
                          <p className="text-xs text-gray-600">
                            <span className="font-semibold">Uso del espacio en su nivel:</span>{' '}
                            {results.items.find(i => i.name === selectedItem.name).space_utilization?.toFixed(1) || 0}%
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-semibold">Factores evaluados:</span><br/>
                      • Altura (más bajo mejor)<br/>
                      • Estabilidad (apoyado correctamente)<br/>
                      • Espacios vacíos alrededor<br/>
                      • Dimensiones vs espacio disponible<br/>
                      • Uso del espacio total del nivel
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de items */}
      {results.items && results.items.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Disposición de productos ({results.items.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.items.map((item, index) => {
              const itemColor = getItemColor(index)
              const isSelected = selectedItem?.name === item.name
              
              return (
                <div
                  key={index}
                  className={`bg-gray-50 p-3 rounded-md text-sm cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-yellow-400 bg-yellow-50' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    // Buscar el item en el 3D y seleccionarlo
                    const item3D = {
                      id: index,
                      name: item.name,
                      color: itemColor,
                      realDimensions: item.dimensions
                    }
                    useStore.getState().selectItem(item3D)
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: itemColor }}
                    />
                    <p className={`font-medium ${isSelected ? 'text-yellow-800' : 'text-gray-800'}`}>
                      {item.name || `Item ${index + 1}`}
                    </p>
                  </div>
                  <div className="ml-7 space-y-1">
                    <p className="text-gray-600 text-xs">
                      Dimensiones: {item.dimensions?.[0]?.toFixed(2) || 0} × {item.dimensions?.[1]?.toFixed(2) || 0} × {item.dimensions?.[2]?.toFixed(2) || 0} m
                    </p>
                    {item.weight && (
                      <p className="text-gray-600 text-xs">
                        Peso: {item.weight.toFixed(2)} kg
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      Posición: ({item.position?.[0]?.toFixed(2) || 0}, {item.position?.[1]?.toFixed(2) || 0}, {item.position?.[2]?.toFixed(2) || 0})
                      {item.rotation !== undefined && ` | Rotación: ${item.rotation}°`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default OptimizationResults

