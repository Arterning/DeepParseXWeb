'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sys/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('success');
        setUploadMessage('文件上传成功！');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setUploadStatus('error');
        setUploadMessage('上传失败，请重试');
      }
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">上传文件</CardTitle>
            <CardDescription>
              支持 PDF、Word、Excel、PPT、图片、视频、音频等多种格式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">选择文件</Label>
              <div className="flex gap-3">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FileText className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">
                    ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>

            {uploadStatus !== 'idle' && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  uploadStatus === 'success'
                    ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                }`}
              >
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span>{uploadMessage}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                将文件拖放到此处，或点击上方按钮选择文件
              </p>
              <p className="text-sm text-slate-500">
                支持的格式：PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, MP4, MP3 等
              </p>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  开始上传
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
