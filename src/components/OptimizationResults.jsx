import { useState } from 'react'
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
  const { results, selectedItem, deselectItem, products } = useStore()
  const [showStrategyInfo, setShowStrategyInfo] = useState(false)
  const [activeTab, setActiveTab] = useState('entered') // 'entered' o 'notEntered'
  const [activeMetricsTab, setActiveMetricsTab] = useState('optimization') // 'optimization' o 'volume'

  if (!results) {
    return null
  }

  const totalWeight = results.items?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0
  const strategyInfo = results.strategy_info
  
  // Calcular volumen total deseado (todos los productos que el usuario quiere poner)
  const totalDesiredVolume = products.reduce((sum, product) => {
    const volume = (product.length || 0) * (product.width || 0) * (product.height || 0)
    return sum + volume
  }, 0)
  
  // Calcular volumen que efectivamente entró (items que están en el contenedor)
  const totalEnteredVolume = results.items?.reduce((sum, item) => {
    if (item.dimensions && item.dimensions.length >= 3) {
      const volume = item.dimensions[0] * item.dimensions[1] * item.dimensions[2]
      return sum + volume
    }
    return sum
  }, 0) || 0
  
  // Calcular volumen de items que no entraron
  // Primero intentar calcular desde items_that_dont_fit si existe
  let totalNotEnteredVolume = 0
  if (results.items_that_dont_fit && results.items_that_dont_fit.length > 0) {
    totalNotEnteredVolume = results.items_that_dont_fit.reduce((sum, item) => {
      if (item.dimensions && item.dimensions.length >= 3) {
        const volume = item.dimensions[0] * item.dimensions[1] * item.dimensions[2]
        return sum + volume
      }
      return sum
    }, 0)
  }
  
  // Si no hay items_that_dont_fit o el cálculo es 0, calcular por diferencia
  // Esto es útil cuando hay productos que no entraron pero no están en items_that_dont_fit
  if (totalNotEnteredVolume === 0 && totalDesiredVolume > totalEnteredVolume) {
    totalNotEnteredVolume = totalDesiredVolume - totalEnteredVolume
  }
  
  // Contar productos que no entraron
  const productsNotEntered = products.length - (results.items?.length || 0)
  
  // Crear lista de productos que no entraron
  // Primero usar items_that_dont_fit si está disponible
  let productsNotEnteredList = []
  
  if (results.items_that_dont_fit && results.items_that_dont_fit.length > 0) {
    // Usar la información del backend
    productsNotEnteredList = results.items_that_dont_fit.map(item => ({
      name: item.name,
      dimensions: item.dimensions || [0, 0, 0],
      weight: item.weight || 0,
      priority: item.priority || 1,
      reason: item.reason,
      max_dimension: item.max_dimension
    }))
  } else if (productsNotEntered > 0) {
    // Si no hay items_that_dont_fit, calcular comparando productos originales con items que entraron
    const enteredNames = new Set((results.items || []).map(item => item.name))
    productsNotEnteredList = products
      .filter(product => !enteredNames.has(product.name))
      .map(product => ({
        name: product.name,
        dimensions: [product.length || 0, product.width || 0, product.height || 0],
        weight: product.weight || 0,
        priority: product.priority || 1,
        reason: null,
        max_dimension: null
      }))
  }

  return (
    <div className="space-y-6">
      {/* Información detallada de estrategias (solo para calculador matemático) */}
      {strategyInfo && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              📊 Análisis de Estrategias de Optimización
            </h3>
            <button
              onClick={() => setShowStrategyInfo(!showStrategyInfo)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showStrategyInfo ? '▼ Ocultar detalles' : '▶ Ver detalles'}
            </button>
          </div>
          
          {/* Resumen de la mejor estrategia */}
          <div className="bg-white rounded-lg p-4 mb-3 border-l-4 border-green-500">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🏆</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-1">
                  Estrategia Elegida: {strategyInfo.best_strategy_description}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {strategyInfo.reasoning}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    <span className="font-semibold">Eficiencia:</span> {strategyInfo.best_efficiency?.toFixed(1)}%
                  </span>
                  <span className="text-gray-600">
                    <span className="font-semibold">Estrategias probadas:</span> {strategyInfo.total_strategies}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de todas las estrategias probadas */}
          {showStrategyInfo && strategyInfo.strategies_tested && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Comparación de Estrategias Probadas:
              </h4>
              {strategyInfo.strategies_tested.map((strategy, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    strategy.was_best
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {strategy.was_best && (
                          <span className="text-green-600 font-bold">✓</span>
                        )}
                        <span className={`font-medium ${strategy.was_best ? 'text-green-800' : 'text-gray-700'}`}>
                          {strategy.description}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          <span className="font-semibold">Eficiencia:</span> {strategy.efficiency?.toFixed(1)}%
                        </span>
                        <span>
                          <span className="font-semibold">Items colocados:</span> {strategy.items_placed} / {strategy.total_items}
                        </span>
                        {strategy.was_best && (
                          <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-semibold">
                            MEJOR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Información del algoritmo (para método heurístico) */}
      {!strategyInfo && results.strategy_used && (
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
              {results.strategy_used === 'mathematical_calculator' && 'Calculador Matemático'}
              {!['volumen_desc', 'volumen_asc', 'peso_desc', 'area_superficie_desc', 'altura_desc', 'default', 'mathematical_calculator'].includes(results.strategy_used) && results.strategy_used}
            </span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            El algoritmo probó múltiples estrategias y seleccionó la más eficiente
          </p>
        </div>
      )}
      
      {/* Métricas con pestañas */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Navegación de pestañas de métricas */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveMetricsTab('optimization')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeMetricsTab === 'optimization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Métricas de Optimización
            </button>
            <button
              onClick={() => setActiveMetricsTab('volume')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeMetricsTab === 'volume'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Estadísticas de Volumen de Cajas
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas de métricas */}
        <div className="p-4">
          {/* Pestaña 1: Métricas de Optimización */}
          {activeMetricsTab === 'optimization' && (
            <div className="space-y-4">
              {/* Métricas principales - Porcentajes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-gray-600 mb-1">Eficiencia de Volumen</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {results.efficiency?.toFixed(1) || results.volume_coverage_percentage?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Volumen usado del contenedor
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-xs text-gray-600 mb-1">Superficie Cubierta</p>
                  <p className="text-2xl font-bold text-green-600">
                    {results.surface_coverage_percentage?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Área base ocupada
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-xs text-gray-600 mb-1">Volumen Libre</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {results.volume_free_percentage?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Espacio disponible
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="text-xs text-gray-600 mb-1">Peso Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {totalWeight.toFixed(2)} kg
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Peso de todos los items
                  </p>
                </div>
              </div>
              
              {/* Métricas detalladas - Valores absolutos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Volumen Usado</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {results.used_volume?.toFixed(2) || 0} m³
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Volumen Libre</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {results.free_volume?.toFixed(2) || 0} m³
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña 2: Estadísticas de Volumen de Cajas */}
          {activeMetricsTab === 'volume' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-gray-600 mb-0.5">Volumen Total Deseado</p>
                  <p className="text-lg font-bold text-blue-600">
                    {totalDesiredVolume.toFixed(2)} m³
                  </p>
                  <p className="text-xs text-gray-500">
                    {products.length} productos
                  </p>
                </div>
                
                <div className="bg-white p-2 rounded-lg border-l-4 border-green-500">
                  <p className="text-xs text-gray-600 mb-0.5">Volumen que Entró</p>
                  <p className="text-lg font-bold text-green-600">
                    {totalEnteredVolume.toFixed(2)} m³
                  </p>
                  <p className="text-xs text-gray-500">
                    {results.items?.length || 0} items
                  </p>
                </div>
                
                {totalNotEnteredVolume > 0 ? (
                  <div className="bg-white p-2 rounded-lg border-l-4 border-orange-500">
                    <p className="text-xs text-gray-600 mb-0.5">Volumen que No Entró</p>
                    <p className="text-lg font-bold text-orange-600">
                      {totalNotEnteredVolume.toFixed(2)} m³
                    </p>
                    <p className="text-xs text-gray-500">
                      {productsNotEntered > 0 ? `${productsNotEntered} productos` : `${results.items_that_dont_fit?.length || 0} items`} fuera
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-2 rounded-lg border-l-4 border-gray-400">
                    <p className="text-xs text-gray-600 mb-0.5">Porcentaje Utilizado</p>
                    <p className="text-lg font-bold text-gray-600">
                      {totalDesiredVolume > 0 ? ((totalEnteredVolume / totalDesiredVolume) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Del volumen deseado
                    </p>
                  </div>
                )}
              </div>
              
              {/* Comparación visual si hay diferencia */}
              {totalDesiredVolume > 0 && totalEnteredVolume < totalDesiredVolume && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progreso</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {((totalEnteredVolume / totalDesiredVolume) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (totalEnteredVolume / totalDesiredVolume) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {totalEnteredVolume.toFixed(2)} m³ / {totalDesiredVolume.toFixed(2)} m³
                    {totalNotEnteredVolume > 0 && (
                      <span className="text-orange-600 ml-1">
                        ({totalNotEnteredVolume.toFixed(2)} m³ fuera - {productsNotEntered} productos)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
          <div className="absolute top-32 right-0 bg-white rounded-lg shadow-xl p-4 border-2 border-yellow-400 w-64 max-h-64 overflow-y-auto z-10">
            <div className="flex items-start justify-between mb-3 sticky top-0 bg-white pb-2 border-b border-gray-200">
              <h4 className="text-lg font-bold text-gray-800">Caja Seleccionada</h4>
              <button
                onClick={deselectItem}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 pt-2">
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

      {/* Pestañas de Disposición de Productos */}
      {(results.items && results.items.length > 0) || productsNotEnteredList.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Navegación de pestañas */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('entered')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'entered'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Productos en el Contenedor ({results.items?.length || 0})
              </button>
              {productsNotEnteredList.length > 0 && (
                <button
                  onClick={() => setActiveTab('notEntered')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                    activeTab === 'notEntered'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Productos que No Entraron ({productsNotEnteredList.length})
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                    ⚠️
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-4">
            {/* Pestaña 1: Productos que entraron */}
            {activeTab === 'entered' && results.items && results.items.length > 0 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
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

            {/* Pestaña 2: Productos que no entraron */}
            {activeTab === 'notEntered' && productsNotEnteredList.length > 0 && (
              <div>
                <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <span className="font-semibold">⚠️ Atención:</span> Los siguientes {productsNotEnteredList.length} productos no pudieron entrar en el contenedor.
                    {results.items?.length > 0 && (
                      <span className="ml-2">✅ Se empaquetaron {results.items.length} productos que sí caben.</span>
                    )}
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {productsNotEnteredList.map((item, index) => {
                      const volume = item.dimensions[0] * item.dimensions[1] * item.dimensions[2]
                      return (
                        <div 
                          key={index} 
                          className={`bg-white p-2 rounded border ${item.priority === 2 ? 'border-red-300 bg-red-50' : 'border-orange-200'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <strong className={item.priority === 2 ? 'text-red-800' : 'text-orange-800'}>
                                  {item.name}
                                </strong>
                                {item.priority === 2 && (
                                  <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-semibold">
                                    CRÍTICA
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-700 space-y-0.5">
                                <p>
                                  <span className="font-semibold">Dimensiones:</span> {item.dimensions[0].toFixed(2)}m × {item.dimensions[1].toFixed(2)}m × {item.dimensions[2].toFixed(2)}m
                                </p>
                                <p>
                                  <span className="font-semibold">Volumen:</span> {volume.toFixed(2)} m³
                                </p>
                                {item.weight > 0 && (
                                  <p>
                                    <span className="font-semibold">Peso:</span> {item.weight.toFixed(2)} kg
                                  </p>
                                )}
                                {item.max_dimension && (
                                  <p className="text-orange-600">
                                    <span className="font-semibold">Dimensión máxima:</span> {item.max_dimension.toFixed(2)}m
                                  </p>
                                )}
                                {item.reason && (
                                  <p className="text-gray-600 italic mt-1">
                                    <span className="font-semibold">Razón:</span> {item.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje si no hay contenido en la pestaña activa */}
            {activeTab === 'entered' && (!results.items || results.items.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay productos en el contenedor.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default OptimizationResults

