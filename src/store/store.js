import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Crear instancia de axios con timeout configurado globalmente
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutos (300 segundos) para optimizaciones complejas
  headers: {
    'Content-Type': 'application/json',
  },
})

const useStore = create((set, get) => ({
  products: [],
  selectedContainer: '40ft',
  loading: false,
  results: null,
  error: null,
  selectedItem: null, // Item seleccionado en el 3D

  // Tipos de contenedores disponibles
  containers: [
    { id: '20ft', name: '20 pies', dimensions: { length: 6.06, width: 2.44, height: 2.59 } },
    { id: '40ft', name: '40 pies', dimensions: { length: 12.19, width: 2.44, height: 2.59 } },
    { id: '40ft-hc', name: '40 pies High Cube', dimensions: { length: 12.19, width: 2.44, height: 2.90 } },
  ],

  // Agregar producto
  addProduct: (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    }
    set((state) => ({
      products: [...state.products, newProduct],
    }))
  },

  // Eliminar producto
  removeProduct: (productId) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    }))
  },

  // Actualizar producto
  updateProduct: (productId, updates) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
    }))
  },

  // Seleccionar contenedor
  setSelectedContainer: (containerId) => {
    set({ selectedContainer: containerId })
  },

  // Validar que productos caben en contenedor
  validateProductsFit: () => {
    const { products, selectedContainer, containers } = get()
    const container = containers.find(c => c.id === selectedContainer)
    if (!container) return { valid: true }

    const containerDims = [
      container.dimensions.length,
      container.dimensions.width,
      container.dimensions.height
    ].sort((a, b) => b - a) // Ordenar de mayor a menor

    const warnings = []
    
    for (const product of products) {
      const productDims = [
        product.length,
        product.width,
        product.height
      ].sort((a, b) => b - a) // Ordenar de mayor a menor
      
      // Verificar si cabe en alguna orientación
      const canFit = productDims.every((dim, i) => dim <= containerDims[i])
      
      if (!canFit) {
        warnings.push({
          product: product.name,
          maxDimension: productDims[0],
          containerMaxDimension: containerDims[0],
          message: `${product.name}: La dimensión máxima (${productDims[0].toFixed(2)}m) excede el espacio disponible del contenedor (${containerDims[0].toFixed(2)}m)`
        })
      }
    }

    return {
      valid: warnings.length === 0,
      warnings
    }
  },

  // Calcular optimización
  calculateOptimization: async () => {
    const { products, selectedContainer } = get()
    
    if (products.length === 0) {
      set({ error: 'Debes agregar al menos un producto' })
      return
    }

    // Validar antes de calcular
    const validation = get().validateProductsFit()
    if (!validation.valid) {
      const warningMessages = validation.warnings.map(w => w.message).join('\n')
      if (!confirm(`⚠️ Advertencia: Algunos productos pueden no caber en el contenedor:\n\n${warningMessages}\n\n¿Deseas continuar de todos modos?`)) {
        return
      }
    }

    set({ loading: true, error: null })

    try {
      const response = await apiClient.post('/api/calculate', {
        products: products.map(({ id, ...rest }) => ({
          ...rest,
          priority: rest.priority || 1, // Asegurar que siempre tenga prioridad (default 1)
        })),
        container: selectedContainer,
      })

      set({ results: response.data, loading: false })
    } catch (error) {
      console.error('Error al calcular optimización:', error)
      
      // Detectar timeout específicamente
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        set({
          error: '⏱️ La optimización está tomando más tiempo del esperado. Esto puede ocurrir con muchos productos o configuraciones complejas. Por favor, intenta de nuevo o reduce el número de productos.',
          loading: false,
        })
        return
      }
      
      // FastAPI devuelve 'detail', Express puede devolver 'message' o 'detail'
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al calcular la optimización'
      set({
        error: errorMessage,
        loading: false,
      })
    }
  },

  // Limpiar resultados
  clearResults: () => {
    set({ results: null, error: null, selectedItem: null, selectedPreset: null })
  },

  // Seleccionar item en el 3D
  selectItem: (item) => {
    set({ selectedItem: item })
  },

  // Deseleccionar item
  deselectItem: () => {
    set({ selectedItem: null })
  },

  // Cargar conjunto predefinido de productos
  loadPreset: (presetProducts, presetKey) => {
    const newProducts = presetProducts.map((product, index) => ({
      ...product,
      id: `preset-${Date.now()}-${index}`,
    }))
    set({ 
      products: newProducts, 
      results: null, 
      error: null, 
      selectedItem: null,
      selectedPreset: presetKey || null
    })
  },
  
  selectedPreset: null, // Preset actualmente seleccionado
}))

export { useStore }

