import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useStore } from '../store/store'

function ProductForm() {
  const { addProduct, products, removeProduct } = useStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [isOpen, setIsOpen] = useState(false)

  const onSubmit = (data) => {
    // Convertir dimensiones a números
    const product = {
      name: data.name,
      length: parseFloat(data.length),
      width: parseFloat(data.width),
      height: parseFloat(data.height),
      weight: parseFloat(data.weight),
      priority: parseInt(data.priority) || 1, // Prioridad: 1 = Normal, 2 = Crítica
      image: data.image || null,
    }

    addProduct(product)
    reset()
  }

  return (
    <div className="space-y-4">
      {/* Botón para abrir/cerrar el formulario */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
      >
        <span className="font-medium text-gray-700">
          {isOpen ? '▼' : '▶'} Agregar Producto
        </span>
        <span className="text-sm text-gray-500">
          {products.length > 0 && `(${products.length} agregados)`}
        </span>
      </button>

      {/* Formulario colapsable */}
      {isOpen && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del producto
              </label>
              <input
                {...register('name', { required: 'El nombre es requerido' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Caja de productos"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Largo (m)
                </label>
                <input
                  {...register('length', {
                    required: 'El largo es requerido',
                    min: { value: 0.01, message: 'Debe ser mayor a 0' },
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.length && (
                  <p className="text-red-500 text-sm mt-1">{errors.length.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ancho (m)
                </label>
                <input
                  {...register('width', {
                    required: 'El ancho es requerido',
                    min: { value: 0.01, message: 'Debe ser mayor a 0' },
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.width && (
                  <p className="text-red-500 text-sm mt-1">{errors.width.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alto (m)
                </label>
                <input
                  {...register('height', {
                    required: 'El alto es requerido',
                    min: { value: 0.01, message: 'Debe ser mayor a 0' },
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.height && (
                  <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                {...register('weight', {
                  required: 'El peso es requerido',
                  min: { value: 0.01, message: 'Debe ser mayor a 0' },
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                {...register('priority', { valueAsNumber: true })}
                defaultValue={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Nivel 1 - Normal</option>
                <option value={2}>Nivel 2 - Crítica (debe entrar sí o sí)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Las cajas de nivel 2 se priorizan y deben entrar antes que las de nivel 1
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de imagen (opcional)
              </label>
              <input
                {...register('image')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Agregar Producto
            </button>
          </form>
        </div>
      )}

      {/* Lista de productos agregados */}
      {products.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Productos agregados ({products.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {product.name}
                    {product.priority === 2 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-semibold">
                        CRÍTICA
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.length}m × {product.width}m × {product.height}m - {product.weight}kg
                    {product.priority && (
                      <span className="ml-2">(Prioridad {product.priority})</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="ml-4 text-red-600 hover:text-red-800 font-semibold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductForm

