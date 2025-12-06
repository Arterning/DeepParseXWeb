'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Trash2 } from 'lucide-react';
import { type SysDocRes } from '@/lib/api/doc';

interface FileCardProps {
  doc: SysDocRes;
  onClick: (id: number) => void;
  onDelete: (id: number) => void;
}

export function FileCard({ doc, onClick, onDelete }: FileCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow relative group">
      <CardContent
        className="p-4 cursor-pointer"
        onClick={() => onClick(doc.id)}
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
          onDelete(doc.id);
        }}
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}
