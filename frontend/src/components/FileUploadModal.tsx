import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const allowedExts = ['.pdf', '.json', '.txt', '.text', '.md', '.markdown', '.csv', '.docx', '.doc', '.log'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExts.includes(ext)) {
      setErrorMsg(`Format '${ext}' not supported. Allowed formats: PDF, JSON, TXT, MD, CSV, DOCX.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg(null);
    setUploadProgress(10);

    try {
      const res = await apiClient.uploadDocument(selectedFile, (progress) => {
        setUploadProgress(Math.max(10, progress));
      });

      setUploadProgress(100);
      setSuccessMsg(
        `Success! Processed & vectorized into ${res.chunks_count || 'multiple'} chunks.`
      );
      setTimeout(() => {
        onUploadSuccess();
        onClose();
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed. Please check backend connection.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg glass-card rounded-2xl border-[#424754]/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#424754]/40 flex items-center justify-between bg-[#131b2e]">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-[#3b82f6]" />
            <h3 className="font-headline text-base font-bold text-[#dae2fd]">
              Upload Knowledge Document
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-[#c2c6d6] hover:text-white rounded-lg hover:bg-[#2d3449] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[#3b82f6] bg-[#3b82f6]/10 scale-[0.99]'
                : 'border-[#424754]/60 hover:border-[#3b82f6]/60 bg-[#131b2e]/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.json,.txt,.text,.md,.markdown,.csv,.docx,.doc,.log"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <UploadCloud className="w-12 h-12 text-[#3b82f6] mx-auto mb-3 opacity-80" />
            <p className="font-semibold text-sm text-[#dae2fd]">
              Drag and drop your PDF, JSON, TXT, MD, or DOCX report here
            </p>
            <p className="text-xs text-[#c2c6d6] mt-1">
              or click to browse local files (PDF, JSON, TXT, MD, CSV, DOCX up to 50MB)
            </p>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className="p-3.5 bg-[#171f33] border border-[#424754]/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#4cd7f6]" />
                <div>
                  <p className="font-semibold text-[#dae2fd]">{selectedFile.name}</p>
                  <p className="text-[10px] text-[#c2c6d6] font-mono-custom">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-[#c2c6d6] hover:text-[#ffb4ab] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-custom text-[#4cd7f6]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing & Vectorizing PDF...</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#2d3449] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#4cd7f6] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-xl text-xs text-[#ffb4ab] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#03b5d3]/20 border border-[#4cd7f6]/40 rounded-xl text-xs text-[#4cd7f6] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#131b2e] border-t border-[#424754]/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="btn btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleStartUpload}
            disabled={!selectedFile || isUploading}
            className="btn btn-primary text-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Indexing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Create Vector Store</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
