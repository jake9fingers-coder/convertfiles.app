import { useRef, useState, useCallback, type ReactNode } from 'react'
import { Upload, Film, FileAudio } from 'lucide-react'

interface DropzoneProps {
    onFiles: (files: File[]) => void
    disabled?: boolean
    accepts?: string
    title?: string
    formats?: string[]
    icon?: ReactNode
    maxSizeMB?: number
}

export default function Dropzone({
    onFiles,
    disabled = false,
    accepts = "video/*,audio/*",
    title = "Drop files here",
    formats = ['MP4', 'MOV', 'AVI', 'WebM', 'MKV', 'MP3', 'M4A'],
    icon = <Film className="w-8 h-8 text-brand-500" />,
    maxSizeMB
}: DropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    const [dragError, setDragError] = useState('')

    const handleFiles = useCallback((fileList: FileList | File[]) => {
        const validFiles: File[] = []
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
                setDragError(`File too large (Max ${maxSizeMB}MB)`)
                setTimeout(() => setDragError(''), 3000)
                return
            }
            validFiles.push(file)
        }
        if (validFiles.length === 0) {
            setDragError('Please drop valid files.')
            setTimeout(() => setDragError(''), 3000)
            return
        }
        setDragError('')
        onFiles(validFiles)
    }, [onFiles, maxSizeMB])

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
    }
    const onDragLeave = () => setDragging(false)
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        if (disabled) return
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
    }
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
        e.target.value = ''
    }

    return (
        <div
            onClick={() => !disabled && inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={` group
        relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${dragging
                    ? 'border-brand-500 bg-soft-100 scale-[1.05] shadow-xl shadow-brand-500/20 dropzone-active'
                    : dragError
                        ? 'border-red-400 bg-red-50 hover:scale-[1.02] transform'
                        : 'border-dark-300 bg-white hover:border-brand-400 hover:bg-brand-50 hover:shadow-xl hover:-translate-y-1 transform'
                }
      `}
            role="button"
            aria-label="Drop a file here, or click to browse"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accepts}
                onChange={onInputChange}
                className="hidden"
                aria-hidden
            />

            <div className="flex flex-col items-center gap-4">
                <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
          ${dragging ? 'bg-soft-200 scale-125 animate-bounce' : 'bg-dark-100 border border-dark-200 group-hover:bg-soft-100 group-hover:scale-110 group-hover:border-brand-300'}
        `}>
                    {dragging
                        ? icon
                        : dragError
                            ? <span className="text-2xl">⚠️</span>
                            : <Upload className="w-8 h-8 text-dark-500" />
                    }
                </div>

                {dragError ? (
                    <p className="text-red-500 font-medium">{dragError}</p>
                ) : dragging ? (
                    <div>
                        <p className="text-lg font-semibold text-brand-600">Drop it!</p>
                        <p className="text-sm text-brand-500/70 mt-1">Release to load your file</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg font-semibold text-dark-900">
                            {title}
                        </p>
                        <p className="text-sm text-dark-500 mt-1">
                            or <span className="text-brand-600 font-medium underline underline-offset-4">click to browse</span>
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-sm mx-auto">
                            {formats.map(fmt => (
                                <span key={fmt} className="text-xs text-dark-600 bg-dark-100 border border-dark-200 rounded px-2 py-0.5 font-mono">
                                    {fmt}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-dark-400 mt-4 flex items-center justify-center gap-1">
                            <FileAudio className="w-3 h-3" />
                            {maxSizeMB ? `Max file size: ${maxSizeMB}MB` : 'Any file size'} · Processed locally · Never uploaded
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
