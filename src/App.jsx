import ProductForm from './components/ProductForm'
import ContainerSelector from './components/ContainerSelector'
import OptimizationResults from './components/OptimizationResults'
import PresetSelector from './components/PresetSelector'
import { useStore } from './store/store'

function App() {
  const { products, calculateOptimization, loading, results, error } = useStore()

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
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Contenedor
              </h2>
              <ContainerSelector />
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || products.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors duration-200 text-lg"
            >
              {loading ? 'Calculando...' : 'Calcular Optimización'}
            </button>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

