'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCard } from '@/components/file-card';
import { queryRecentDocs, searchSysDocList, type SysDocRes, type SysDocQueryRes } from '@/lib/api/doc';
import { Search, FileText, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [recentDocs, setRecentDocs] = useState<SysDocRes[]>([]);
  const [searchResults, setSearchResults] = useState<SysDocQueryRes | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadRecentDocs();
  }, [router]);

  const loadRecentDocs = async () => {
    try {
      setIsLoading(true);
      const docs = await queryRecentDocs();
      setRecentDocs(docs);
    } catch (err) {
      console.error('Failed to load recent docs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await searchSysDocList({ query: searchQuery, page: 1, size: 20 });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl font-bold mb-2">文档搜索</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            使用智能检索快速找到您需要的文档
          </p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              type="text"
              placeholder="输入关键词搜索文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-base"
            />
            <Button
              type="submit"
              disabled={isSearching}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  搜索中...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">搜索结果</h2>
              <span className="text-slate-600 dark:text-slate-400">
                共找到 {searchResults.total} 个结果
              </span>
            </div>
            <div className="grid gap-4">
              {searchResults.items.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate overflow-hidden" title={doc.title || doc.name}>
                            {doc.title || doc.name}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {doc.desc || doc.content?.substring(0, 100) + '...'}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Documents */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">最近文档</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : recentDocs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-600 dark:text-slate-400">
                暂无文档，请先上传文件
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentDocs.map((doc) => (
                <FileCard
                  key={doc.id}
                  doc={doc}
                  onClick={(id) => router.push(`/dashboard/files/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
