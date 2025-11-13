import { useStore } from '../store/store'

// Conjuntos predefinidos de productos
const PRESETS = {
  '10-cajas-usuario': {
    name: '15 Cajas (Tu conjunto)',
    description: 'Las 15 cajas que proporcionaste',
    container: '40ft',
    products: [
      { name: 'caja 1', length: 1, width: 1, height: 1, weight: 1 },
      { name: 'caja 2', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'caja 3', length: 1, width: 2, height: 3, weight: 4 },
      { name: 'caja 4', length: 1, width: 2, height: 4, weight: 4 },
      { name: 'caja 5', length: 0.5, width: 0.7, height: 2, weight: 4 },
      { name: 'caja 6', length: 2.2, width: 1.1, height: 1, weight: 3 },
      { name: 'caja 7', length: 2.1, width: 0.6, height: 0.7, weight: 5 },
      { name: 'caja 8', length: 0.5, width: 0.5, height: 2, weight: 5 },
      { name: 'caja 9', length: 0.7, width: 0.7, height: 1, weight: 3 },
      { name: 'caja 10', length: 1, width: 1, height: 0.5, weight: 1 },
      { name: 'caja 11', length: 2, width: 1, height: 0.5, weight: 1 },
      { name: 'caja 12', length: 0.5, width: 1.4, height: 1.5, weight: 1 }, 
      { name: 'caja 13', length: 2.5, width: 2.4, height: 1.5, weight: 1 }, 
      { name: 'caja 14', length: 0.5, width: 1.4, height: 1.5, weight: 1 }, 
      { name: 'caja 15', length: 1.5, width: 1, height: 1.5, weight: 1 }, 
    ]
  },
  'lleno-maximo-40ft': {
    name: 'Lleno Máximo (40ft)',
    description: 'Muchas cajas pequeñas que llenan casi todo el espacio',
    container: '40ft',
    products: [
      // Cajas pequeñas que llenan el espacio eficientemente
      { name: 'P1', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P2', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P3', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P4', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P5', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P6', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P7', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P8', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P9', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P10', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P11', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P12', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P13', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P14', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P15', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P16', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P17', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P18', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P19', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P20', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P21', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P22', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P23', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P24', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P25', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P26', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P27', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P28', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P29', length: 1, width: 1, height: 1, weight: 2 },
      { name: 'P30', length: 1, width: 1, height: 1, weight: 2 },
    ]
  },
  'lleno-maximo-20ft': {
    name: 'Lleno Máximo (20ft)',
    description: 'Muchas cajas pequeñas que llenan casi todo el espacio',
    container: '20ft',
    products: [
      { name: 'S1', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S2', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S3', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S4', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S5', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S6', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S7', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S8', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S9', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S10', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S11', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S12', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      { name: 'S13', length: 2.8, width: 1.8, height: 1, weight: 1.5 },
      { name: 'S14', length: 0.8, width: 1.2, height: 2.5, weight: 1.5 },
      { name: 'S15', length: 1.8, width: 1.2, height: 1.2, weight: 1.5 },
      { name: 'S15', length: 0.8, width: 1.8, height: 0.8, weight: 1.5 },
      { name: 'S15', length: 0.8, width: 0.8, height: 0.8, weight: 1.5 },
      
    ]
  },
  'sobrecarga-40ft': {
    name: 'Sobrecarga (40ft)',
    description: 'Cajas que exceden la capacidad - algunas no cabrán',
    container: '40ft',
    products: [
      { name: 'Grande 1', length: 3, width: 2.5, height: 2.6, weight: 50 }, // Muy grande, no cabe
      { name: 'Grande 2', length: 2.5, width: 2.5, height: 2.6, weight: 45 }, // Muy grande, no cabe
      { name: 'Mediana 1', length: 2, width: 2, height: 2, weight: 30 },
      { name: 'Mediana 2', length: 2, width: 2, height: 2, weight: 30 },
      { name: 'Mediana 3', length: 2, width: 2, height: 2, weight: 30 },
      { name: 'Mediana 4', length: 2, width: 2, height: 2, weight: 30 },
      { name: 'Mediana 5', length: 2, width: 2, height: 2, weight: 30 },
      { name: 'Mediana 6', length: 2, width: 2, height: 2, weight: 30 },
      { name: 'Mediana 7', length: 2, width: 2, height: 2, weight: 30 },
      { name: 'Mediana 8', length: 2, width: 2, height: 2, weight: 30 },
    ]
  },
  'sobrecarga-altura': {
    name: 'Sobrecarga Altura',
    description: 'Cajas que exceden la altura del contenedor',
    container: '40ft',
    products: [
      { name: 'Alta 1', length: 1, width: 1, height: 3, weight: 10 }, // Excede altura
      { name: 'Alta 2', length: 1, width: 1, height: 3, weight: 10 }, // Excede altura
      { name: 'Alta 3', length: 1, width: 1, height: 2.7, weight: 9 }, // Excede altura
      { name: 'Normal 1', length: 1.5, width: 1.5, height: 1.5, weight: 15 },
      { name: 'Normal 2', length: 1.5, width: 1.5, height: 1.5, weight: 15 },
      { name: 'Normal 3', length: 1.5, width: 1.5, height: 1.5, weight: 15 },
    ]
  },
  'cajas-pequenas': {
    name: 'Cajas Pequeñas',
    description: 'Conjunto de cajas pequeñas para pruebas',
    container: '20ft',
    products: [
      { name: 'Caja A', length: 0.5, width: 0.5, height: 0.5, weight: 1 },
      { name: 'Caja B', length: 0.6, width: 0.6, height: 0.6, weight: 1.5 },
      { name: 'Caja C', length: 0.7, width: 0.7, height: 0.7, weight: 2 },
      { name: 'Caja D', length: 0.8, width: 0.8, height: 0.8, weight: 2.5 },
      { name: 'Caja E', length: 1, width: 1, height: 1, weight: 3 },
    ]
  },
  'cajas-medianas': {
    name: 'Cajas Medianas',
    description: 'Conjunto de cajas medianas',
    container: '40ft',
    products: [
      { name: 'Caja M1', length: 1.5, width: 1, height: 1, weight: 5 },
      { name: 'Caja M2', length: 1.2, width: 1.2, height: 1.2, weight: 6 },
      { name: 'Caja M3', length: 1.8, width: 1, height: 0.8, weight: 4 },
      { name: 'Caja M4', length: 1, width: 1.5, height: 1, weight: 5 },
    ]
  },
  'cajas-grandes': {
    name: 'Cajas Grandes',
    description: 'Conjunto de cajas grandes',
    container: '40ft',
    products: [
      { name: 'Caja G1', length: 2, width: 1.5, height: 1.5, weight: 10 },
      { name: 'Caja G2', length: 2.2, width: 1.2, height: 1.2, weight: 12 },
      { name: 'Caja G3', length: 1.8, width: 1.8, height: 1.5, weight: 15 },
    ]
  },
  'mixto': {
    name: 'Mixto (Variado)',
    description: 'Mezcla de cajas de diferentes tamaños',
    container: '40ft',
    products: [
      { name: 'Pequeña 1', length: 0.5, width: 0.5, height: 0.5, weight: 1 },
      { name: 'Pequeña 2', length: 0.7, width: 0.7, height: 0.7, weight: 2 },
      { name: 'Mediana 1', length: 1.2, width: 1, height: 1, weight: 5 },
      { name: 'Mediana 2', length: 1.5, width: 1.2, height: 1, weight: 6 },
      { name: 'Grande 1', length: 2, width: 1.5, height: 1.2, weight: 10 },
      { name: 'Grande 2', length: 2.2, width: 1.1, height: 1, weight: 8 },
    ]
  },
  'optimizacion-extrema': {
    name: 'Optimización Extrema',
    description: 'Muchas cajas pequeñas variadas para máximo aprovechamiento',
    container: '40ft',
    products: [
      { name: 'E1', length: 0.6, width: 0.6, height: 0.6, weight: 1 },
      { name: 'E2', length: 0.6, width: 0.6, height: 0.6, weight: 1 },
      { name: 'E3', length: 0.8, width: 0.8, height: 0.8, weight: 2 },
      { name: 'E4', length: 0.8, width: 0.8, height: 0.8, weight: 2 },
      { name: 'E5', length: 1, width: 1, height: 1, weight: 3 },
      { name: 'E6', length: 1, width: 1, height: 1, weight: 3 },
      { name: 'E7', length: 1.2, width: 1, height: 1, weight: 4 },
      { name: 'E8', length: 1.2, width: 1, height: 1, weight: 4 },
      { name: 'E9', length: 1.5, width: 1, height: 1, weight: 5 },
      { name: 'E10', length: 1.5, width: 1, height: 1, weight: 5 },
      { name: 'E11', length: 0.5, width: 0.5, height: 1.5, weight: 2 },
      { name: 'E12', length: 0.5, width: 0.5, height: 1.5, weight: 2 },
      { name: 'E13', length: 0.7, width: 0.7, height: 1.5, weight: 3 },
      { name: 'E14', length: 0.7, width: 0.7, height: 1.5, weight: 3 },
      { name: 'E15', length: 1, width: 1, height: 1.5, weight: 4 },
      { name: 'E16', length: 1, width: 1, height: 1.5, weight: 4 },
      { name: 'E17', length: 1.2, width: 1.2, height: 1, weight: 5 },
      { name: 'E18', length: 1.2, width: 1.2, height: 1, weight: 5 },
      { name: 'E19', length: 1.5, width: 1.2, height: 1, weight: 6 },
      { name: 'E20', length: 1.5, width: 1.2, height: 1, weight: 6 },
    ]
  },
  'sobrecarga-masiva-40ft': {
    name: 'Sobrecarga Masiva (40ft)',
    description: 'Muchas cajas - algunas no cabrán. Algunas tienen prioridad 2 (críticas)',
    container: '40ft',
    products: [
      // Cajas críticas (prioridad 2) - deben entrar sí o sí
      { name: 'CRÍTICA 1', length: 2, width: 2, height: 2, weight: 30, priority: 2 },
      { name: 'CRÍTICA 2', length: 2, width: 2, height: 2, weight: 30, priority: 2 },
      { name: 'CRÍTICA 3', length: 1.5, width: 1.5, height: 1.5, weight: 25, priority: 2 },
      { name: 'CRÍTICA 4', length: 1.5, width: 1.5, height: 1.5, weight: 25, priority: 2 },
      { name: 'CRÍTICA 5', length: 1.5, width: 1.5, height: 1.5, weight: 25, priority: 2 },
      
      // Cajas normales (prioridad 1) - intentarán entrar
      { name: 'Normal 1', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 2', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 3', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 4', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 5', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 6', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 7', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 8', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 9', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 10', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 11', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 12', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 13', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 14', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 15', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 16', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 17', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 18', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 19', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 20', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 21', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 22', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 23', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 24', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
      { name: 'Normal 25', length: 1.2, width: 1.2, height: 1.2, weight: 20, priority: 1 },
    ]
  },
  'sobrecarga-masiva-20ft': {
    name: 'Sobrecarga Masiva (20ft)',
    description: 'Muchas cajas para 20ft - algunas no cabrán. Algunas tienen prioridad 2',
    container: '20ft',
    products: [
      // Cajas críticas (prioridad 2)
      { name: 'CRÍTICA A', length: 1.5, width: 1.5, height: 1.5, weight: 20, priority: 2 },
      { name: 'CRÍTICA B', length: 1.5, width: 1.5, height: 1.5, weight: 20, priority: 2 },
      { name: 'CRÍTICA C', length: 1.2, width: 1.2, height: 1.2, weight: 15, priority: 2 },
      
      // Cajas normales (prioridad 1)
      { name: 'N1', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N2', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N3', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N4', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N5', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N6', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N7', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N8', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N9', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N10', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N11', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N12', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N13', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N14', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N15', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N16', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N17', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N18', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N19', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
      { name: 'N20', length: 1, width: 1, height: 1, weight: 10, priority: 1 },
    ]
  },
}

function PresetSelector() {
  const { loadPreset, products, clearResults, setSelectedContainer, selectedPreset } = useStore()

  const handlePresetChange = (presetKey) => {
    if (!presetKey || presetKey === '') {
      return
    }

    const preset = PRESETS[presetKey]
    if (!preset) {
      return
    }

    // Confirmar si hay productos existentes
    if (products.length > 0) {
      if (!confirm(`¿Deseas reemplazar los ${products.length} productos actuales con el conjunto "${preset.name}"?`)) {
        return
      }
    }

    // Limpiar resultados anteriores
    clearResults()
    
    // Cambiar contenedor si el preset lo especifica
    if (preset.container) {
      setSelectedContainer(preset.container)
    }
    
    // Cargar el preset con la clave para mantenerlo seleccionado
    loadPreset(preset.products, presetKey)
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        📦 Conjuntos Predefinidos
      </label>
      <select
        onChange={(e) => handlePresetChange(e.target.value)}
        value={selectedPreset || ""}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Selecciona un conjunto predefinido...</option>
        {Object.entries(PRESETS).map(([key, preset]) => (
          <option key={key} value={key}>
            {preset.name} - {preset.description} ({preset.products.length} productos)
            {preset.container ? ` [${preset.container}]` : ''}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Selecciona un conjunto para cargar productos automáticamente
      </p>
    </div>
  )
}

export default PresetSelector

