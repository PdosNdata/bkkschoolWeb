export default function OrderTrendChart() {
  return (
    <div>
      <h1>Order Trend Chart</h1>
      <LineChart
        data={data}
        options={options}
      />
    </div>
  )
}