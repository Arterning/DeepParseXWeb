'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { querySysDocList, deleteSysDoc, type SysDocRes, type SysDocParams } from '@/lib/api/doc';
import { FileText, Calendar, Trash2, Loader2, Search } from 'lucide-react';

export default function FilesPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<SysDocRes[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 12;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadDocs();
  }, [router, currentPage]);

  const loadDocs = async () => {
    try {
      setIsLoading(true);
      const params: SysDocParams = {
        page: currentPage,
        size: pageSize,
      };
      if (searchQuery) {
        params.name = searchQuery;
      }
      const result = await querySysDocList(params);
      setDocs(result.items);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load docs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadDocs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      await deleteSysDoc({ pk: [id] });
      loadDocs();
    } catch (err) {
      console.error('Failed to delete doc:', err);
      alert('删除失败');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">文件管理</h1>
          <Button
            onClick={() => router.push('/dashboard/upload')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            上传文件
          </Button>
        </div>

        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="搜索文件名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="h-11"
          />
          <Button onClick={handleSearch} className="h-11">
            <Search className="w-4 h-4 mr-2" />
            搜索
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : docs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
              暂无文件
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {docs.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow relative group">
                  <CardContent
                    className="p-4 cursor-pointer"
                    onClick={() => router.push(`/dashboard/files/${doc.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate" title={doc.title || doc.name}>
                          {doc.title || doc.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(doc.created_time)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {doc.desc || doc.content?.substring(0, 60) + '...'}
                    </p>

                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{doc.type || '未知'}</span>
                      <span>{formatSize(doc.size)}</span>
                    </div>
                  </CardContent>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id);
                    }}
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    第 {currentPage} / {totalPages} 页
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
