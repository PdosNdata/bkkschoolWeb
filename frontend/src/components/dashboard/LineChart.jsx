export default function LineChart({ data }) {
    return (
      <div className="p-4 border rounded">
        <h3 className="font-bold mb-2">งบประมาณรายปี</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }
  