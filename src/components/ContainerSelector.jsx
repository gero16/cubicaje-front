import { useStore } from '../store/store'

function ContainerSelector() {
  const { containers, selectedContainer, setSelectedContainer } = useStore()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {containers.map((container) => (
          <label
            key={container.id}
            className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
              selectedContainer === container.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="container"
              value={container.id}
              checked={selectedContainer === container.id}
              onChange={(e) => setSelectedContainer(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{container.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {container.dimensions.length}m × {container.dimensions.width}m × {container.dimensions.height}m
                </p>
              </div>
              {selectedContainer === container.id && (
                <div className="text-blue-600 text-xl">✓</div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export default ContainerSelector

