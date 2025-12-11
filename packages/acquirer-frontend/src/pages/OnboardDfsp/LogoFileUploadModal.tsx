import { FileUploadModal as SharedFileUploadModal } from '@/components/ui'

interface LogoFileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void
  setIsUploaded: (isUploaded: boolean) => void
  openFileInput: () => void
  setFile: (file: File) => void
}

const LogoFileUploadModal = (props: LogoFileUploadModalProps) => {
  return (
    <SharedFileUploadModal
      {...props}
      description='Upload your Logo Image File'
      dragDropText='Drag & Drop your Logo file here'
    />
  )
}

export default LogoFileUploadModal
