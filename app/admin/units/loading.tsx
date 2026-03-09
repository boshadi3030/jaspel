export default function Loading() {
  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Unit Management</h1>
            <p className="text-gray-500">Manage organizational units</p>
          </div>
        </div>
        
        <div className="rounded-md border p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center text-gray-500 mt-4">Loading units...</p>
        </div>
      </div>
  )
}
