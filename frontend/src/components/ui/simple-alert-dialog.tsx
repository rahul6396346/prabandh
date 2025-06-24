import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { Button } from "@/components/ui/button"

interface SimpleAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  confirmText?: string
  onConfirm?: () => void
}

const SimpleAlertDialog: React.FC<SimpleAlertDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'OK',
  onConfirm
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onOpenChange(false)
  }

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black bg-opacity-50" 
        />
        <AlertDialogPrimitive.Content 
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
        >
          <div className="space-y-4">
            {title && (
              <AlertDialogPrimitive.Title className="text-lg font-semibold text-gray-900">
                {title}
              </AlertDialogPrimitive.Title>
            )}
            <AlertDialogPrimitive.Description className="text-sm text-gray-600">
              {description}
            </AlertDialogPrimitive.Description>
            
            <div className="flex justify-end pt-4">
              <AlertDialogPrimitive.Action asChild>
                <Button
                  onClick={handleConfirm}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  {confirmText}
                </Button>
              </AlertDialogPrimitive.Action>
            </div>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

export { SimpleAlertDialog }
