export default function OrderStatusChart() {   
  const percent = 50
    return (
    <div>
      <h1>Order Status Chart</h1>
      <div>
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
    
  )
}