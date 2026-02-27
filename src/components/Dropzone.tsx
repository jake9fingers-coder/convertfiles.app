import { useRef, useState, useCallback } from 'react'
import { Upload, Film, FileAudio } from 'lucide-react'

interface DropzoneProps {
    onFiles: (files: File[]) => void
    disabled?: boolean
}


export default function Dropzone({ onFiles, disabled = false }: DropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    const [dragError, setDragError] = useState('')

    const handleFiles = useCallback((fileList: FileList | File[]) => {
        const validFiles: File[] = []
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            // Allow all files to pass through to FFmpeg. We only show error if absolutely zero files were selected.
            validFiles.push(file)
        }

        if (validFiles.length === 0) {
            setDragError('Please drop valid files.')
            setTimeout(() => setDragError(''), 3000)
            return
        }

        setDragError('')
        onFiles(validFiles)
    }, [onFiles])

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
    }

    const onDragLeave = () => setDragging(false)

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        if (disabled) return
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
        }
        e.target.value = ''
    }

    return (
        <div
            onClick={() => !disabled && inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${dragging
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.01] shadow-lg shadow-indigo-100 dropzone-active'
                    : dragError
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-gray-100 hover:shadow-md'
                }
      `}
            role="button"
            aria-label="Drop a video or audio file here, or click to browse"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                accept="video/*,audio/*"
                onChange={onInputChange}
                className="hidden"
                aria-hidden
            />

            <div className="flex flex-col items-center gap-4">
                <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
          ${dragging ? 'bg-indigo-100 scale-110' : 'bg-white border border-gray-200 shadow-sm'}
        `}>
                    {dragging
                        ? <Film className="w-8 h-8 text-indigo-500" />
                        : dragError
                            ? <span className="text-2xl">⚠️</span>
                            : <Upload className="w-8 h-8 text-gray-400" />
                    }
                </div>

                {dragError ? (
                    <p className="text-red-600 font-medium">{dragError}</p>
                ) : dragging ? (
                    <div>
                        <p className="text-lg font-semibold text-indigo-700">Drop it!</p>
                        <p className="text-sm text-indigo-500 mt-1">Release to load your file</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg font-semibold text-gray-900">
                            Drop files here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            or <span className="text-indigo-600 font-medium underline underline-offset-2">click to browse</span>
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-4">
                            {['MP4', 'MOV', 'AVI', 'WebM', 'MKV', 'MP3', 'M4A'].map(fmt => (
                                <span key={fmt} className="text-xs text-gray-400 bg-white border border-gray-100 rounded px-2 py-0.5 font-mono">
                                    {fmt}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <FileAudio className="w-3 h-3" />
                            Any file size · Processed locally · Never uploaded
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
