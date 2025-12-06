'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FileCard } from '@/components/file-card';
import { querySysDocList, deleteSysDoc, type SysDocRes, type SysDocParams } from '@/lib/api/doc';
import { Loader2, Search } from 'lucide-react';

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
                <FileCard
                  key={doc.id}
                  doc={doc}
                  onClick={(id) => router.push(`/dashboard/files/${id}`)}
                  onDelete={handleDelete}
                />
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
