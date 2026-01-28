export default function StatCard({ title, value, note }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{note}</p>
    </div>
  )
}