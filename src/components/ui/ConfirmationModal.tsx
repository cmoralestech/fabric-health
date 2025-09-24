'use client'

import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'success'
  isLoading?: boolean
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-600" />
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-amber-50 border-amber-200'
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger'
      case 'success':
        return 'primary'
      default:
        return 'primary'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Icon and Message */}
          <div className={`flex items-start gap-4 p-4 rounded-lg border ${getIconBgColor()}`}>
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
