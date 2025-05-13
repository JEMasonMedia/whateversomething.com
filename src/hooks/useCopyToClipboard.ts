import { useCallback } from 'react'
import { toast } from 'react-toastify'

/**
 * useCopyToClipboard
 * Returns a function to copy text to clipboard and show a toast notification.
 * @returns (text: string, formatName?: string, onSuccess?: () => void, onError?: () => void) => Promise<void>
 */
export function useCopyToClipboard() {
  return useCallback(
    async (text: string, formatName: string = 'Text', onSuccess?: () => void, onError?: () => void) => {
      const uniqueToastId = `copy-${formatName}-${Date.now()}`
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          toast.success(`Copied ${formatName}!`, { toastId: uniqueToastId })
          if (onSuccess) onSuccess()
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          const successful = document.execCommand('copy')
          document.body.removeChild(textArea)
          if (successful) {
            toast.success(`Copied ${formatName} (fallback)!`, { toastId: uniqueToastId })
            if (onSuccess) onSuccess()
          } else {
            throw new Error('Fallback: document.execCommand("copy") failed')
          }
        }
      } catch (err) {
        console.log(err)
        toast.error(`Copy failed!`, { toastId: `error-${uniqueToastId}` })
        if (onError) onError()
      }
    },
    []
  )
}
