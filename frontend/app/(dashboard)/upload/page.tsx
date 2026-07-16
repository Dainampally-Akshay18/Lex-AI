// app/(dashboard)/upload/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { documentsAPI } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';
import {
  FileText,
  Shield,
  DollarSign,
  MessageSquare,
  Languages,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock,
  File,
  Sparkles,
  Zap,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const features = [
    {
      icon: FileText,
      title: 'Contract Summary',
      description: 'AI-powered contract summarization with key clause extraction',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Risk Analysis',
      description: 'Comprehensive risk assessment with severity scoring',
      color: 'orange',
    },
    {
      icon: DollarSign,
      title: 'Financial Term Extraction',
      description: 'Automated extraction of financial terms and obligations',
      color: 'emerald',
    },
    {
      icon: MessageSquare,
      title: 'AI Legal Assistant',
      description: 'Intelligent Q&A powered by your document context',
      color: 'purple',
    },
    {
      icon: Languages,
      title: 'Multi-language Translation',
      description: 'Seamless translation across multiple legal languages',
      color: 'cyan',
    },
  ];

  const timeline = [
    { icon: File, label: 'Upload Document', status: 'pending' },
    { icon: Sparkles, label: 'Extract Text', status: 'pending' },
    { icon: Zap, label: 'AI Analysis', status: 'pending' },
    { icon: Shield, label: 'Store Analysis', status: 'pending' },
    { icon: CheckCircle, label: 'Ready for Review', status: 'pending' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File | undefined) => {
    setError('');
    setSuccess('');

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF and DOCX files are allowed.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 25MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await documentsAPI.upload(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccess(`Document uploaded successfully! Analysis is being generated.`);
      setFile(null);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setSuccess('');
    setUploadProgress(0);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Document</h1>
            <p className="mt-1 text-gray-500">
              Upload legal documents for AI-powered analysis and insights
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left Column - Upload Area (60%) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Upload Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  {!file ? (
                    // Drop Zone
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                      />
                      
                      <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                          <Upload className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Drop your document here
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          or click to browse files
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            PDF
                          </span>
                          <span className="w-px h-4 bg-gray-200" />
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            DOCX
                          </span>
                          <span className="w-px h-4 bg-gray-200" />
                          <span>Max 25 MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // File Preview
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {file.type === 'application/pdf' ? 'PDF' : 'DOCX'}
                          </p>
                          {isUploading && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500 text-center">
                                Uploading... {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                        {!isUploading && (
                          <button
                            onClick={handleRemoveFile}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? (
                            'Uploading...'
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload Document
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleRemoveFile}
                          disabled={isUploading}
                          className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status Messages */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Upload Failed</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Upload Successful</p>
                        <p className="text-sm text-emerald-700">{success}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50/50 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                      <File className="w-4 h-4" />
                      Formats
                    </div>
                    <p className="text-sm font-semibold text-gray-900">PDF, DOCX</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                      <Upload className="w-4 h-4" />
                      Max Size
                    </div>
                    <p className="text-sm font-semibold text-gray-900">25 MB</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                      <Clock className="w-4 h-4" />
                      Processing
                    </div>
                    <p className="text-sm font-semibold text-gray-900">30-90 sec</p>
                  </div>
                </div>
              </div>

              {/* Processing Timeline */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Processing Timeline</h3>
                <div className="relative">
                  {timeline.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 mb-4 last:mb-0">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 && !file ? 'bg-gray-100 text-gray-400' :
                          index === 0 && file ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-medium ${
                          index === 0 && file ? 'text-gray-900' :
                          index === 0 && !file ? 'text-gray-400' :
                          'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                      {index === 0 && file && (
                        <Check className="w-4 h-4 text-emerald-500 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - AI Features (40%) */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Features Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">AI Analysis Features</h3>
                </div>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                        getColorClasses(feature.color)
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/70 ${
                          getColorClasses(feature.color)
                        }`}>
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {feature.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Privacy Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Enterprise Security</p>
                    <p className="text-xs text-gray-500">Encrypted processing & secure storage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}