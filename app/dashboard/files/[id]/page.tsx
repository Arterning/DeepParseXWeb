'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { querySysDocDetail, updateSysDoc, type SysDocRes } from '@/lib/api/doc';
import { buildPreviewURL } from '@/lib/utils';
import { ArrowLeft, FileText, Calendar, User, Mail, Paperclip, Loader2, Image as ImageIcon, FileType, Edit, Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function FileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [doc, setDoc] = useState<SysDocRes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadDocDetail();
  }, [router, params.id]);

  const loadDocDetail = async () => {
    try {
      setIsLoading(true);
      const result = await querySysDocDetail(Number(params.id));
      setDoc(result);
    } catch (err) {
      console.error('Failed to load doc detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleStartEdit = () => {
    setEditedContent(doc?.content || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleSaveEdit = async () => {
    if (!doc) return;

    try {
      setIsSaving(true);
      await updateSysDoc(doc.id, {
        ...doc,
        content: editedContent,
      });

      // 更新本地状态
      setDoc({
        ...doc,
        content: editedContent,
      });

      setIsEditing(false);
      toast.success('内容已保存');
    } catch (err) {
      console.error('Failed to save content:', err);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!doc) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/files')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回文件列表
          </Button>
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              未找到文件
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // 渲染邮件类型的文件详情
  const renderEmailDetail = () => {
    if (!doc.email_msg) return null;

    const { email_msg } = doc;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              邮件详情
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 邮件主题 */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                主题
              </label>
              <p className="mt-1 text-base">{email_msg.subject}</p>
              {email_msg.zh_subject && email_msg.zh_subject !== email_msg.subject && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  翻译：{email_msg.zh_subject}
                </p>
              )}
            </div>

            {/* 发件人 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  发件人
                </label>
                <p className="mt-1 text-sm">{email_msg.sender}</p>
              </div>

              {/* 收件人 */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  收件人
                </label>
                <p className="mt-1 text-sm">{email_msg.receiver}</p>
              </div>
            </div>

            {/* 抄送 */}
            {email_msg.cc && (
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  抄送
                </label>
                <p className="mt-1 text-sm">{email_msg.cc}</p>
              </div>
            )}

            {/* 发送时间 */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                发送时间
              </label>
              <p className="mt-1 text-sm">{formatDate(email_msg.time)}</p>
            </div>

            {/* 分类 */}
            {email_msg.category && (
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  分类
                </label>
                <p className="mt-1 text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {email_msg.category}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 邮件内容 */}
        <Card>
          <CardHeader>
            <CardTitle>邮件内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 中文翻译 */}
            {email_msg.zh_content && (
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  中文翻译
                </label>
                <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {email_msg.zh_content}
                  </p>
                </div>
              </div>
            )}

            {/* 原文 */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                原文
              </label>
              <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {email_msg.original}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 附件 */}
        {email_msg.attachments && email_msg.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                附件 ({email_msg.attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {email_msg.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm">{attachment.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // 渲染图片类型的文件详情
  const renderImageDetail = () => {
    if (!doc.file) return null;

    const previewUrl = buildPreviewURL(doc.file);

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左侧：图片预览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              图片预览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt={doc.title || doc.name}
                className="w-full h-auto object-contain max-h-[600px]"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>

        {/* 右侧：OCR提取的文本 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>OCR 提取文本</CardTitle>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-1" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      保存
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="请输入OCR文本内容"
              />
            ) : doc.content ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg max-h-[600px] overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {doc.content}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">暂无OCR文本内容</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染PDF类型的文件详情
  const renderPdfDetail = () => {
    if (!doc.file) return null;

    const previewUrl = buildPreviewURL(doc.file);

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左侧：PDF预览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileType className="w-5 h-5 text-blue-600" />
              PDF 预览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-[600px] border-0"
                title={doc.title || doc.name}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              如果PDF无法显示，请
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                点击此处在新窗口中打开
              </a>
            </p>
          </CardContent>
        </Card>

        {/* 右侧：OCR提取的文本 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>OCR 提取文本</CardTitle>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-1" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      保存
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="请输入OCR文本内容"
              />
            ) : doc.content ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg max-h-[600px] overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {doc.content}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">暂无OCR文本内容</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染通用文件详情
  const renderGenericDetail = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>文件详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {doc.desc && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                描述
              </label>
              <p className="mt-1 text-sm">{doc.desc}</p>
            </div>
          )}

          {doc.content && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                内容
              </label>
              <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {doc.content}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/files')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回文件列表
        </Button>

        {/* 文件基本信息 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-2">{doc.title || doc.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(doc.created_time)}
                  </span>
                  <span>{doc.type || '未知类型'}</span>
                  <span>{formatSize(doc.size)}</span>
                  {doc.created_user && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {doc.created_user}
                    </span>
                  )}
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {doc.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 根据文件类型展示不同内容 */}
        {doc.email_msg ? renderEmailDetail() :
         doc.type === '图片' ? renderImageDetail() :
         doc.type === 'PDF' ? renderPdfDetail() :
         renderGenericDetail()}
      </div>
    </AppLayout>
  );
}
