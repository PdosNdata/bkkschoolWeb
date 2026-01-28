import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function ExportPDFButton() {
  const exportPDF = async () => {
    const el = document.getElementById('dashboard-pdf')
    const canvas = await html2canvas(el, { scale: 2 })
    const img = canvas.toDataURL('image/png')

    const pdf = new jsPDF()
    const w = pdf.internal.pageSize.getWidth()
    const h = (canvas.height * w) / canvas.width

    pdf.text('รายงานงบประมาณรายปี', 14, 15)
    pdf.addImage(img, 'PNG', 10, 20, w - 20, h)
    pdf.save('budget-dashboard.pdf')
  }

  return (
    <button onClick={exportPDF} className="btn-primary">
      🧾 Export PDF
    </button>
  )
}
