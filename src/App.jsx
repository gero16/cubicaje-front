import React, { useState } from 'react'
import ProductForm from './components/ProductForm'
import ContainerSelector from './components/ContainerSelector'
import OptimizationResults from './components/OptimizationResults'
import PresetSelector from './components/PresetSelector'
import { useStore } from './store/store'

function App() {
  const { 
    products, 
    calculateOptimization, 
    loading, 
    results, 
    error, 
    progress,
    fillFloorWithPallets,
    setFillFloorWithPallets
  } = useStore()
  
  const [isContainerExpanded, setIsContainerExpanded] = useState(false)
  

  const handleCalculate = async () => {
    if (products.length === 0) {
      alert('Por favor, agrega al menos un producto')
      return
    }
    await calculateOptimization()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            🚢 Container Optimizer
          </h1>
          <p className="text-gray-600 text-lg">
            Calculadora de cubicaje para contenedores marítimos
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel izquierdo: Formularios */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Productos
              </h2>
              <PresetSelector />
              <ProductForm />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <button
                onClick={() => setIsContainerExpanded(!isContainerExpanded)}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h2 className="text-2xl font-semibold text-gray-800">
                  Contenedor
                </h2>
                <svg
                  className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${
                    isContainerExpanded ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isContainerExpanded && (
                <div className="transition-all duration-200">
                  <ContainerSelector />
                </div>
              )}
            </div>

            {/* Opción para llenar piso con pallets */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Opciones de Optimización
              </h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <label htmlFor="fill-floor-pallets" className="text-sm font-medium text-gray-700 cursor-pointer">
                    📦 Llenar Piso con Pallets
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Coloca pallets estratégicamente en el piso (solo si hay productos que pueden ir sobre ellos)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="fill-floor-pallets"
                    checked={fillFloorWithPallets}
                    onChange={(e) => setFillFloorWithPallets(e.target.checked)}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  <strong>✅ Calculador Matemático Activo:</strong> El sistema siempre usa el algoritmo determinístico que calcula posiciones exactas mediante operaciones geométricas.
                </p>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || products.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors duration-200 text-lg"
            >
              {loading ? 'Calculando...' : 'Calcular Optimización'}
            </button>
            
            {/* Mostrar progreso si está cargando */}
            {loading && progress.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">{progress.message}</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round(progress.percentage)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Mostrar mensaje de éxito cuando termine */}
            {!loading && progress.step === 'complete' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-2">✅</span>
                  <span className="text-sm font-medium text-green-800">{progress.message || 'Optimización completada'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho: Resultados */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Resultados
            </h2>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-500 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 whitespace-pre-line">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {results ? (
              <OptimizationResults />
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">
                  Agrega productos y calcula la optimización para ver los resultados
                </p>
                {loading && (
                  <p className="text-sm text-gray-400 mt-2">
                    Cargando resultados...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

