"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Upload, X, FileText, Brain, Zap, CheckCircle2, CloudUpload } from 'lucide-react';

interface FileUploadOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: (files: File[]) => void;
}

export const FileUploadOverlay = React.memo<FileUploadOverlayProps>(({ 
  isOpen, 
  onClose, 
  onFilesUploaded 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhanced React DND drop handling
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item: { files: File[] }) => {
      const droppedFiles = item.files.filter(file => 
        file.type.includes('pdf') || 
        file.type.includes('document') || 
        file.type.includes('text') ||
        file.type.includes('image') ||
        file.type.includes('spreadsheet') ||
        file.type.includes('csv') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      );
      
      if (droppedFiles.length > 0) {
        setFiles(prev => [...prev, ...droppedFiles]);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (files.length > 0) {
      setIsProcessing(true);
      
      // Simulate processing delay
      setTimeout(() => {
        onFilesUploaded(files);
        onClose();
        setFiles([]);
        setIsProcessing(false);
      }, 1500);
    }
  }, [files, onFilesUploaded, onClose]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-title"
    >
      <motion.div
        ref={drop}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`w-full max-w-lg glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
          isActive ? 'ring-2 ring-primary ring-opacity-50 shadow-2xl scale-105' : ''
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Enhanced Drop Feedback Overlay */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <CloudUpload className="w-16 h-16 mx-auto mb-4 text-primary" />
                </motion.div>
                <h3 className="text-xl font-medium text-holographic mb-2">Drop Files Here</h3>
                <p className="text-sm text-muted-foreground">Release to upload for AI analysis</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(255, 255, 255, 0.1)',
                    '0 0 0 8px rgba(255, 255, 255, 0.05)',
                    '0 0 0 0 rgba(255, 255, 255, 0.1)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-5 h-5 text-primary" aria-hidden="true" />
              </motion.div>
              <div>
                <h2 id="upload-title" className="font-medium text-holographic">Document Analysis</h2>
                <p className="text-sm text-muted-foreground">AI-powered business intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFiles}
                    className="rounded-xl glass-button text-muted-foreground hover:text-foreground"
                    title="Clear all files"
                  >
                    Clear All
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="rounded-xl glass-button"
                  aria-label="Close upload dialog"
                >
                  <X className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Enhanced Upload Area */}
        <div className="p-6">
          <motion.div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 glass-button relative ${
              isActive
                ? 'border-primary bg-primary/15 scale-105 shadow-xl'
                : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
            }`}
            role="button"
            aria-label="File upload area"
            tabIndex={0}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Background Animation */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-30"
              animate={{
                background: isActive 
                  ? [
                      'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                    ]
                  : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)'
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" aria-hidden="true" />
            </motion.div>
            
            <h3 className="font-medium mb-2 text-holographic">
              {isActive ? 'Drop files here' : 'Upload Business Documents'}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Drag & drop files here or click to browse<br />
              <span className="text-xs">PDF, DOC, DOCX, TXT, Images, Spreadsheets supported</span>
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Brain className="w-3 h-3 mr-1" />
                AI Analysis
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                <Zap className="w-3 h-3 mr-1" />
                Instant Insights
              </Badge>
            </div>
            
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              aria-label="Choose files to upload"
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="rounded-xl glass-button"
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-holographic">
                    Selected Files ({files.length})
                  </h4>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                </div>
                
                <div className="max-h-32 overflow-y-auto scrollbar-modern space-y-2">
                  {files.map((file, index) => (
                    <motion.div 
                      key={`${file.name}-${index}-${file.lastModified}`}
                      className="glass-card p-3 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      layout
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="w-6 h-6 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleUpload} 
                    className="w-full rounded-xl glass-button bg-primary/15 hover:bg-primary/25 text-primary interactive-glow border-primary/20"
                    disabled={files.length === 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze {files.length} Document{files.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Features Preview */}
          {files.length === 0 && (
            <motion.div 
              className="mt-6 glass-card p-4 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-medium mb-3 text-holographic">AI Analysis Features</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Business process optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>ROI opportunity identification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Automated workflow suggestions</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

FileUploadOverlay.displayName = 'FileUploadOverlay';
