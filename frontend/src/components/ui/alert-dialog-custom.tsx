import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  type?: 'warning' | 'error' | 'success' | 'info'
  confirmText?: string
  onConfirm?: () => void
}

const AlertDialogCustom: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  type = 'warning',
  confirmText = 'OK',
  onConfirm
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getColorScheme = () => {
    // Use maroon color scheme for all types
    return {
      bg: 'bg-white',
      border: 'border-[#800000]',
      button: 'bg-[#800000] hover:bg-[#a83232]',
      iconBg: 'bg-[#f3e5e5]'
    }
  }

  const colorScheme = getColorScheme()
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black bg-opacity-50" />
        <AlertDialogPrimitive.Content 
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 51,
            width: '100%',
            maxWidth: '32rem',
            backgroundColor: 'white',
            border: '1px solid #800000',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
        >          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
            <div 
              style={{
                backgroundColor: '#f3e5e5',
                padding: '0.75rem',
                borderRadius: '50%',
                marginBottom: '0.5rem'
              }}
            >
              {getIcon()}
            </div>
            
            <div style={{ width: '100%' }}>
              {title && (
                <AlertDialogPrimitive.Title 
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '1rem',
                    lineHeight: 1.4,
                    letterSpacing: '-0.025em',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {title}
                </AlertDialogPrimitive.Title>
              )}
              <AlertDialogPrimitive.Description 
                style={{
                  fontSize: '1rem',
                  color: '#4b5563',
                  lineHeight: 1.7,
                  letterSpacing: '0.005em',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: '400',
                  maxWidth: '100%',
                  margin: '0 auto'
                }}
              >
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
            <AlertDialogPrimitive.Action asChild>
              <Button
                onClick={handleConfirm}
                style={{
                  backgroundColor: '#800000',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(128, 0, 0, 0.2)'
                }}
              >
                {confirmText}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

export { AlertDialogCustom }
