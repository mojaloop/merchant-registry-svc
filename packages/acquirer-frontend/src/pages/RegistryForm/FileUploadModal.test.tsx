import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import FileUploadModal from './FileUploadModal'

const fn = vi.fn()

describe('FileUploadModal', () => {
  afterEach(() => {
    fn.mockClear()
  })

  it('should set isUploading to false when uploadProgress is 100', async () => {
    vi.useFakeTimers()

    render(
      <TestWrapper>
        <FileUploadModal
          isOpen
          onClose={fn}
          isUploading
          setIsUploading={fn}
          openFileInput={fn}
          setFile={fn}
        />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(fn.mock.calls[0]).toEqual([false])
  })

  it('should reset upload states when the modal is closed', async () => {
    render(
      <TestWrapper>
        <FileUploadModal
          isOpen
          onClose={fn}
          isUploading
          setIsUploading={fn}
          openFileInput={fn}
          setFile={fn}
        />
      </TestWrapper>
    )

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(fn.mock.calls[0]).toEqual([false])
  })

  it('should reset upload states when the "Submit" button is clicked', async () => {
    vi.useFakeTimers()

    render(
      <TestWrapper>
        <FileUploadModal
          isOpen
          onClose={fn}
          isUploading
          setIsUploading={fn}
          openFileInput={fn}
          setFile={fn}
        />
      </TestWrapper>
    )

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    expect(fn.mock.calls[0]).toEqual([false])
  })

  it('should reset upload states and update file when a new file is dropped in the dropzone', () => {
    render(
      <TestWrapper>
        <FileUploadModal
          isOpen
          onClose={fn}
          isUploading
          setIsUploading={fn}
          openFileInput={fn}
          setFile={fn}
        />
      </TestWrapper>
    )

    const file = { name: 'License Document', type: 'application/pdf' }

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file] },
    })

    expect(fn.mock.calls[0]).toEqual([false])
    expect(fn.mock.calls[1]).toEqual([file])
    expect(fn.mock.calls[2]).toEqual([true])
  })

  it('should only reset upload states and not update file when the file type is not pdf', () => {
    render(
      <TestWrapper>
        <FileUploadModal
          isOpen
          onClose={fn}
          isUploading
          setIsUploading={fn}
          openFileInput={fn}
          setFile={fn}
        />
      </TestWrapper>
    )

    const file = { name: 'License Document', type: 'image/png' }

    fireEvent.drop(screen.getByTestId('dropzone'), {
      dataTransfer: { files: [file] },
    })

    expect(fn.mock.calls[0]).toEqual([false])
    expect(fn.mock.calls[1]).toEqual(undefined)
  })

  it('should apply dragging-over class when the dropzone is entered', () => {
    render(
      <TestWrapper>
        <FileUploadModal
          isOpen
          onClose={fn}
          isUploading
          setIsUploading={fn}
          openFileInput={fn}
          setFile={fn}
        />
      </TestWrapper>
    )

    const dropzone = screen.getByTestId('dropzone')
    fireEvent.dragEnter(dropzone)

    expect(dropzone).toHaveClass('dragging-over')
  })
})
