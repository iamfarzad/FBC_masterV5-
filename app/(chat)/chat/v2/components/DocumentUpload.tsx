"use client"

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Image,
  File,
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import { useFileUpload } from '@/hooks/chat/useFileUpload'
import { useMedia } from '@/hooks/chat/useMedia'

interface DocumentUploadProps {
  isOpen: boolean
  onClose: () => void
  onFileUploaded?: (fileUrl: string, fileName: string) => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress?: number
  error?: string
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  isOpen, 
  onClose, 
  onFileUploaded 
}) => {
  const { uploadFile, isUploading, progress } = useFileUpload()
  const { mediaFiles, addMediaFiles, removeMediaFile } = useMedia()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }, [])

  const handleFiles = useCallback(async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Upload each file
    for (const file of files) {
      const fileId = newFiles.find(f => f.name === file.name)?.id
      if (!fileId) continue

      try {
        // Update status to uploading
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'uploading', progress: 0 } : f)
        )

        // Upload file
        const result = await uploadFile(file)
        
        if (result) {
          // Update status to completed
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileId ? { 
              ...f, 
              status: 'completed', 
              url: result,
              progress: 100 
            } : f)
          )

          // Notify parent component
          onFileUploaded?.(result, file.name)
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        // Update status to error
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f)
        )
      }
    }
  }, [uploadFile, onFileUploaded])

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.startsWith('text/')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="w-4 h-4 border border-border rounded" />
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-semibold text-text">Upload Documents</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-surface-elevated"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-brand bg-brand/5' 
                    : 'border-border hover:border-brand/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-brand" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-text mb-2">
                      Drop files here or click to upload
                    </h3>
                    <p className="text-text-muted text-sm">
                      Support for PDF, DOC, TXT, images and more
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-surface-elevated hover:bg-brand/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-text">Uploaded Files</h4>
                  
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg border border-border"
                      >
                        <div className="flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text truncate">
                              {file.name}
                            </p>
                            {getStatusIcon(file.status)}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-text-muted">
                              {formatFileSize(file.size)}
                            </p>
                            
                            {file.status === 'uploading' && file.progress !== undefined && (
                              <div className="flex-1 max-w-32">
                                <Progress value={file.progress} className="h-1" />
                              </div>
                            )}
                            
                            {file.status === 'error' && (
                              <Badge variant="destructive" className="text-xs">
                                {file.error || 'Upload failed'}
                              </Badge>
                            )}
                            
                            {file.status === 'completed' && (
                              <Badge variant="default" className="text-xs">
                                Uploaded
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {file.status === 'completed' && file.url && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(file.url, '_blank')}
                                className="h-8 w-8 hover:bg-brand/10"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = file.url!
                                  link.download = file.name
                                  link.click()
                                }}
                                className="h-8 w-8 hover:bg-brand/10"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 hover:bg-red-500/10 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supported Formats */}
              <div className="bg-surface-elevated rounded-lg p-4">
                <h4 className="text-sm font-medium text-text mb-2">Supported Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['PDF', 'DOC', 'DOCX', 'TXT', 'MD', 'JPG', 'PNG', 'GIF', 'WEBP'].map(format => (
                    <Badge key={format} variant="outline" className="text-xs">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-surface-elevated">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={onClose} 
              className="bg-brand hover:bg-brand-hover"
              disabled={uploadedFiles.some(f => f.status === 'uploading')}
            >
              Done
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

