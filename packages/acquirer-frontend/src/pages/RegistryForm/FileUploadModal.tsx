import { FileUploadModal as SharedFileUploadModal } from '@/components/ui'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void
  openFileInput: () => void
  setFile: (file: File) => void
}

const FileUploadModal = (props: FileUploadModalProps) => {
  return (
    <SharedFileUploadModal
      {...props}
      description='Upload your PDF File to share your license documents.'
      dragDropText='Drag & Drop your PDF file here'
      acceptedFileType='application/pdf'
    />
  )
}

export default FileUploadModal
