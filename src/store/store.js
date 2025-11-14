import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Crear instancia de axios con timeout configurado globalmente
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 minutos (600 segundos) para optimizaciones complejas con muchos productos
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
  fillFloorWithPallets: false, // Toggle para llenar el piso con pallets estratégicamente
  progress: {
    message: '',
    percentage: 0,
    step: null
  },

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

  // Toggle llenar piso con pallets
  setFillFloorWithPallets: (value) => {
    set({ fillFloorWithPallets: value })
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

  // Calcular optimización con progreso usando SSE
  calculateOptimization: async () => {
    const { products, selectedContainer, fillFloorWithPallets } = get()
    // Siempre usar calculador matemático
    const useMathematicalCalculator = true
    
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

    set({ 
      loading: true, 
      error: null,
      progress: { message: 'Iniciando...', percentage: 0, step: null }
    })

    try {
      // Usar endpoint SSE para obtener progreso en tiempo real
      // Usar la URL completa del API desde la variable de entorno
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
      const optimizeUrl = `${apiUrl}/optimize-stream`
      
      const response = await fetch(optimizeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products.map(({ id, length, width, height, weight, name, priority, requires_pallet }) => ({
            name: name,
            dimensions: [length, width, height],
            weight: weight,
            priority: priority || 1,
            requires_pallet: requires_pallet || false,
          })),
          container: selectedContainer,
          use_mathematical_calculator: useMathematicalCalculator,
          fill_floor_with_pallets: fillFloorWithPallets || false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let receivedComplete = false
      let shouldExit = false

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('🔌 Conexión SSE cerrada. receivedComplete:', receivedComplete)
            // Si la conexión se cerró pero recibimos complete, está bien
            if (receivedComplete) {
              console.log('✅ Conexión cerrada después de recibir complete')
              break
            }
            // Si no recibimos complete, puede ser un error
            const currentState = get()
            console.error('❌ Conexión cerrada sin recibir complete. Estado actual:', {
              loading: currentState.loading,
              hasResults: !!currentState.results,
              progress: currentState.progress
            })
            throw new Error('La conexión se cerró antes de completar la optimización')
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim() === '') continue
            
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6)
                // Log el JSON crudo para debugging
                if (jsonStr.length > 200) {
                  console.log('📦 JSON recibido (truncado):', jsonStr.substring(0, 200) + '...')
                } else {
                  console.log('📦 JSON recibido:', jsonStr)
                }
                
                const data = JSON.parse(jsonStr)
                
                // Ignorar heartbeats en la UI (solo mantener conexión viva)
                if (data.step === 'heartbeat') {
                  continue
                }
                
                // Log todos los eventos para debugging
                console.log('📨 Evento SSE recibido:', {
                  step: data.step,
                  message: data.message?.substring(0, 50),
                  percentage: data.percentage,
                  hasResult: !!data.result,
                  resultItems: data.result?.items?.length,
                  hasDetails: !!data.details,
                  allKeys: Object.keys(data)
                })
                
                // Actualizar progreso
                if (data.step && data.message) {
                  set({
                    progress: {
                      message: data.message,
                      percentage: data.percentage || 0,
                      step: data.step
                    }
                  })
                  
                  // Si el mensaje dice "completada" pero no es el evento complete, podría ser un problema
                  if (data.message.toLowerCase().includes('completada') && data.step !== 'complete') {
                    console.warn('⚠️ Mensaje dice "completada" pero step no es "complete":', data.step)
                  }
                }

                // Si es el evento de completado, procesar resultado
                if (data.step === 'complete') {
                  receivedComplete = true
                  console.log('✅ Evento complete recibido:', data)
                  
                  if (data.result) {
                    console.log('✅ Resultado recibido:', data.result)
                    console.log('✅ Items en resultado:', data.result.items?.length)
                    console.log('✅ Estructura del resultado:', Object.keys(data.result))
                    
                    // Verificar estructura del resultado antes de guardar
                    if (!data.result || !data.result.items) {
                      console.error('❌ Resultado inválido:', data.result)
                      throw new Error('El resultado no tiene la estructura esperada')
                    }
                    
                    console.log('💾 Guardando resultado con', data.result.items.length, 'items')
                    
                    // Actualizar estado con resultados - usar forma directa
                    set({ 
                      results: data.result, 
                      loading: false,
                      progress: { message: 'Completado', percentage: 100, step: 'complete' }
                    })
                    
                    console.log('✅ Estado actualizado - verificando...')
                    
                    // Verificar inmediatamente después
                    const verifyState = get()
                    console.log('🔍 Verificación inmediata:', {
                      hasResults: !!verifyState.results,
                      resultsItems: verifyState.results?.items?.length,
                      loading: verifyState.loading,
                      resultsKeys: verifyState.results ? Object.keys(verifyState.results) : []
                    })
                    
                    // Verificar después de un pequeño delay también
                    setTimeout(() => {
                      const currentState = get()
                      console.log('🔍 Verificación después de 500ms:', {
                        hasResults: !!currentState.results,
                        resultsItems: currentState.results?.items?.length,
                        loading: currentState.loading
                      })
                    }, 500)
                    
                    // IMPORTANTE: Marcar para salir del while también
                    shouldExit = true
                    break
                  } else {
                    // Si no hay resultado pero dice complete, esperar un poco más
                    console.warn('⚠️ Evento complete recibido pero sin resultado, esperando...')
                    console.warn('⚠️ Datos recibidos:', JSON.stringify(data, null, 2))
                    // Esperar un poco más por si el resultado viene en el siguiente evento
                    continue
                  }
                }

                // Si hay error
                if (data.step === 'error') {
                  throw new Error(data.message || 'Error en la optimización')
                }
              } catch (e) {
                // Si es error de parsing, solo loguear y continuar
                if (e instanceof SyntaxError) {
                  console.warn('Error parseando evento SSE (posible línea incompleta):', e.message)
                  continue
                }
                // Si es otro error, lanzarlo
                throw e
              }
            }
          }
          
          // Salir del while si se procesó el evento complete con resultado
          if (shouldExit) {
            console.log('🚪 Saliendo del loop SSE después de recibir resultado')
            break
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Si llegamos aquí sin recibir el evento 'complete', algo salió mal
      if (!receivedComplete) {
        console.error('ERROR: No se recibió evento complete. Estado actual:', {
          loading: get().loading,
          results: get().results,
          progress: get().progress
        })
        // Asegurar que loading se ponga en false incluso si hay error
        set({ 
          loading: false,
          error: 'La conexión se cerró antes de completar la optimización'
        })
        throw new Error('La conexión se cerró antes de completar la optimización')
      }
      
    } catch (error) {
      console.error('Error al calcular optimización:', error)
      console.error('Estado en catch:', {
        loading: get().loading,
        results: get().results,
        error: get().error
      })
      
      // Detectar timeout específicamente
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        set({
          error: '⏱️ La optimización está tomando más tiempo del esperado. Esto puede ocurrir con muchos productos o configuraciones complejas. Por favor, intenta de nuevo o reduce el número de productos.',
          loading: false,
          progress: { message: '', percentage: 0, step: null }
        })
        return
      }
      
      const errorMessage = error.message || 'Error al calcular la optimización'
      set({
        error: errorMessage,
        loading: false,
        progress: { message: '', percentage: 0, step: null }
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

