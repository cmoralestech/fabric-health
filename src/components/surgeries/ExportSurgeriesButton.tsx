'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Download, FileText, Table, X, Calendar, Filter } from 'lucide-react'

interface Surgery {
  id: string
  scheduledAt: string
  type: string
  status: string
  priority: string
  estimatedDuration?: number
  actualDuration?: number
  operatingRoom?: string
  notes?: string
  patient: {
    id: string
    name: string
    age: number
  }
  surgeon: {
    name: string
    email: string
  }
  scheduledBy: {
    name: string
    email: string
  }
}

interface ExportSurgeriesButtonProps {
  surgeries: Surgery[]
  selectedSurgeries?: Set<string>
}

export default function ExportSurgeriesButton({ surgeries, selectedSurgeries }: ExportSurgeriesButtonProps) {
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [exportScope, setExportScope] = useState<'all' | 'selected' | 'filtered'>('all')

  const exportToCSV = (data: Surgery[]) => {
    const headers = [
      'Surgery ID',
      'Type',
      'Status',
      'Priority',
      'Scheduled Date',
      'Scheduled Time',
      'Operating Room',
      'Patient Name',
      'Patient Age',
      'Surgeon',
      'Estimated Duration (min)',
      'Actual Duration (min)',
      'Notes',
      'Scheduled By'
    ]

    const csvContent = [
      headers.join(','),
      ...data.map(surgery => [
        surgery.id,
        `"${surgery.type}"`,
        surgery.status,
        surgery.priority,
        new Date(surgery.scheduledAt).toLocaleDateString(),
        new Date(surgery.scheduledAt).toLocaleTimeString(),
        surgery.operatingRoom || '',
        `"${surgery.patient.name}"`,
        surgery.patient.age,
        `"${surgery.surgeon.name}"`,
        surgery.estimatedDuration || '',
        surgery.actualDuration || '',
        `"${surgery.notes?.replace(/"/g, '""') || ''}"`,
        `"${surgery.scheduledBy.name}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `surgery-schedule-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = (data: Surgery[]) => {
    // Create a simple HTML table for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surgery Schedule Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1f2937; margin-bottom: 5px; }
          .header p { color: #6b7280; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .priority-emergency { background-color: #fef2f2; color: #991b1b; }
          .priority-urgent { background-color: #fff7ed; color: #9a3412; }
          .priority-routine { background-color: #eff6ff; color: #1d4ed8; }
          .priority-elective { background-color: #f0fdf4; color: #166534; }
          .status-scheduled { background-color: #dbeafe; color: #1d4ed8; }
          .status-in-progress { background-color: #fed7aa; color: #9a3412; }
          .status-completed { background-color: #dcfce7; color: #166534; }
          .status-cancelled { background-color: #fecaca; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Surgery Schedule Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Total Surgeries: ${data.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Surgery Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date & Time</th>
              <th>OR</th>
              <th>Patient</th>
              <th>Surgeon</th>
              <th>Duration</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(surgery => `
              <tr>
                <td>${surgery.type}</td>
                <td class="status-${surgery.status.toLowerCase().replace('_', '-')}">${surgery.status}</td>
                <td class="priority-${surgery.priority.toLowerCase()}">${surgery.priority}</td>
                <td>${new Date(surgery.scheduledAt).toLocaleDateString()} ${new Date(surgery.scheduledAt).toLocaleTimeString()}</td>
                <td>${surgery.operatingRoom || 'TBD'}</td>
                <td>${surgery.patient.name} (${surgery.patient.age})</td>
                <td>Dr. ${surgery.surgeon.name}</td>
                <td>${surgery.estimatedDuration ? `~${Math.floor(surgery.estimatedDuration / 60)}h ${surgery.estimatedDuration % 60}m` : 'TBD'}</td>
                <td>${surgery.notes?.substring(0, 50) || ''}${surgery.notes && surgery.notes.length > 50 ? '...' : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const handleExport = () => {
    let dataToExport = surgeries

    if (exportScope === 'selected' && selectedSurgeries) {
      dataToExport = surgeries.filter(surgery => selectedSurgeries.has(surgery.id))
    }

    if (exportFormat === 'csv') {
      exportToCSV(dataToExport)
    } else {
      exportToPDF(dataToExport)
    }

    setShowExportModal(false)
  }

  const getExportCount = () => {
    if (exportScope === 'selected' && selectedSurgeries) {
      return selectedSurgeries.size
    }
    return surgeries.length
  }

  return (
    <>
      <Button
        onClick={() => setShowExportModal(true)}
        variant="outline"
        size="sm"
        className="text-gray-600 hover:bg-gray-50"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">Export Surgery Data</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Export Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What to Export</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="all"
                      checked={exportScope === 'all'}
                      onChange={(e) => setExportScope(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm">All surgeries ({surgeries.length})</span>
                  </label>
                  
                  {selectedSurgeries && selectedSurgeries.size > 0 && (
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="selected"
                        checked={exportScope === 'selected'}
                        onChange={(e) => setExportScope(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">Selected surgeries ({selectedSurgeries.size})</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      exportFormat === 'csv' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Table className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">CSV</div>
                    <div className="text-xs text-gray-500">Spreadsheet data</div>
                  </button>
                  
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      exportFormat === 'pdf' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">PDF</div>
                    <div className="text-xs text-gray-500">Printable report</div>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Export Summary</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Exporting {getExportCount()} surgeries as {exportFormat.toUpperCase()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowExportModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

