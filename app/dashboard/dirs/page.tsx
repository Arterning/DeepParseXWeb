'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Loader2,
  Trash2,
  Eye,
  Pencil,
  Upload,
  X,
  FolderPlus,
  Sheet,
  FileType,
} from 'lucide-react';
import {
  getDocDirTree,
  createDocDir,
  updateDocDir,
  deleteDocDir,
  getDocsInDir,
  updateDocDirAssociation,
  updateDocMeta,
  deleteDoc,
  createDocFile,
  type DocDir,
  type DocFile,
} from '@/lib/api/doc_dir';

interface ContextMenuState {
  x: number;
  y: number;
  doc: DocFile;
}

interface EditDocState {
  id: number;
  title: string;
  name: string;
  desc: string;
}

// 新建文件类型
type CreateFileType = 'word' | 'excel';

const FILE_TYPE_LABELS: Record<CreateFileType, string> = {
  word: 'Word 文档',
  excel: '表格',
};

const PAGE_SIZE = 20;

export default function DirsPage() {
  const router = useRouter();

  // Directory tree
  const [dirs, setDirs] = useState<DocDir[]>([]);
  const [isLoadingDirs, setIsLoadingDirs] = useState(true);
  const [selectedDir, setSelectedDir] = useState<DocDir | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Drag for directory move
  const [draggedDir, setDraggedDir] = useState<DocDir | null>(null);
  const [dragOverDirId, setDragOverDirId] = useState<number | null>(null);

  // Files
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [docsTotal, setDocsTotal] = useState(0);
  const [docsPage, setDocsPage] = useState(1);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // File drag upload
  const [isDragOverFiles, setIsDragOverFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounterRef = useRef(0);

  // UI state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [createDirModal, setCreateDirModal] = useState<{ parentId: number | null } | null>(null);
  const [newDirName, setNewDirName] = useState('');
  const [renameDirTarget, setRenameDirTarget] = useState<DocDir | null>(null);
  const [renameDirName, setRenameDirName] = useState('');
  const [editDocTarget, setEditDocTarget] = useState<EditDocState | null>(null);
  const [createFileModal, setCreateFileModal] = useState<CreateFileType | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadDirs();
  }, [router]);

  // Close dropdown / context menu when clicking outside
  // Use mousedown so it fires BEFORE React's onClick on the toggle button,
  // allowing contains() check to prevent premature closing.
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCreateDropdownOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadDirs = async () => {
    try {
      setIsLoadingDirs(true);
      const tree = await getDocDirTree();
      setDirs(tree);
    } catch (err) {
      console.error('Failed to load dirs:', err);
    } finally {
      setIsLoadingDirs(false);
    }
  };

  const loadDocs = async (dir: DocDir | null, page: number) => {
    if (!dir) {
      setDocs([]);
      setDocsTotal(0);
      return;
    }
    try {
      setIsLoadingDocs(true);
      const result = await getDocsInDir({ doc_dir_id: dir.id, page, size: PAGE_SIZE });
      setDocs(result.items);
      setDocsTotal(result.total);
    } catch (err) {
      console.error('Failed to load docs:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // ── Directory interactions ────────────────────────────────────────────────

  const handleSelectDir = (dir: DocDir) => {
    setSelectedDir(dir);
    setDocsPage(1);
    loadDocs(dir, 1);
    if (dir.children && dir.children.length > 0) {
      setExpandedIds((prev) => new Set([...prev, dir.id]));
    }
  };

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    setDocsPage(page);
    loadDocs(selectedDir, page);
  };

  // Create directory
  const handleCreateDir = async () => {
    if (!newDirName.trim()) return;
    try {
      setIsSubmitting(true);
      await createDocDir({ name: newDirName.trim(), parent_id: createDirModal?.parentId ?? null, sort: 0 });
      setCreateDirModal(null);
      setNewDirName('');
      await loadDirs();
    } catch (err) {
      alert('创建失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Word / Excel file
  const handleCreateFile = async () => {
    if (!newFileName.trim() || !createFileModal) return;
    try {
      setIsSubmitting(true);
      const title = newFileName.trim();
      const result = await createDocFile({
        title,
        name: title,
        type: createFileModal,
        doc_dir_id: selectedDir?.id ?? null,
      });
      setCreateFileModal(null);
      setNewFileName('');
      await loadDocs(selectedDir, docsPage);
      // Navigate to the inline editor for the newly created file
      if (result?.id) router.push(`/dashboard/editor/${result.id}`);
    } catch (err) {
      alert('创建失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rename directory
  const handleRenameDir = async () => {
    if (!renameDirTarget || !renameDirName.trim()) return;
    try {
      setIsSubmitting(true);
      await updateDocDir(renameDirTarget.id, {
        name: renameDirName.trim(),
        parent_id: renameDirTarget.parent_id,
        sort: renameDirTarget.sort,
      });
      if (selectedDir?.id === renameDirTarget.id) {
        setSelectedDir((prev) => (prev ? { ...prev, name: renameDirName.trim() } : null));
      }
      setRenameDirTarget(null);
      setRenameDirName('');
      await loadDirs();
    } catch (err) {
      alert('重命名失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete directory
  const handleDeleteDir = async (dir: DocDir) => {
    if (!confirm(`确定要删除目录"${dir.name}"吗？`)) return;
    try {
      await deleteDocDir(dir.id);
      if (selectedDir?.id === dir.id) setSelectedDir(null);
      await loadDirs();
    } catch (err: any) {
      alert(err?.response?.data?.msg || '删除失败，请先清空目录');
    }
  };

  // Move directory (drag & drop)
  const handleMoveDir = async (dragged: DocDir, target: DocDir) => {
    if (dragged.id === target.id) return;
    try {
      await updateDocDir(dragged.id, { name: dragged.name, parent_id: target.id, sort: dragged.sort });
      await loadDirs();
    } catch (err: any) {
      alert(err?.response?.data?.msg || '移动失败');
    }
  };

  // Upload files into selected directory
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOverFiles(false);

    if (!selectedDir) {
      alert('请先选择一个目录');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsUploading(true);
    let successCount = 0;
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('size', file.size.toString());
        formData.append('last_modified', new Date(file.lastModified).toISOString());

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/sys/upload/`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );

        if (response.ok) {
          const result = await response.json();
          const docId = result?.data?.id;
          if (docId) {
            await updateDocDirAssociation(docId, selectedDir.id);
            successCount++;
          }
        }
      }
      if (successCount > 0) await loadDocs(selectedDir, docsPage);
    } catch (err) {
      alert('上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete doc
  const handleDeleteDoc = async (doc: DocFile) => {
    if (!confirm(`确定要删除"${doc.title || doc.name}"吗？`)) return;
    try {
      await deleteDoc([doc.id]);
      await loadDocs(selectedDir, docsPage);
    } catch (err) {
      alert('删除失败');
    }
    setContextMenu(null);
  };

  // Edit doc submit
  const handleEditDocSubmit = async () => {
    if (!editDocTarget) return;
    try {
      setIsSubmitting(true);
      await updateDocMeta(editDocTarget.id, {
        title: editDocTarget.title,
        name: editDocTarget.name,
        desc: editDocTarget.desc,
      });
      await loadDocs(selectedDir, docsPage);
      setEditDocTarget(null);
    } catch (err) {
      alert('保存失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Directory Tree Node ────────────────────────────────────────────────────
  const DirTreeNode = ({ dir, level }: { dir: DocDir; level: number }) => {
    const isExpanded = expandedIds.has(dir.id);
    const isSelected = selectedDir?.id === dir.id;
    const isDragOver = dragOverDirId === dir.id && draggedDir?.id !== dir.id;
    const isDragging = draggedDir?.id === dir.id;
    const hasChildren = !!(dir.children && dir.children.length > 0);

    return (
      <div>
        <div
          className={[
            'group flex items-center gap-1 py-1.5 rounded-md cursor-pointer select-none transition-colors',
            isSelected
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            isDragOver ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : '',
            isDragging ? 'opacity-30' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ paddingLeft: `${level * 16 + 8}px`, paddingRight: '8px' }}
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            setDraggedDir(dir);
            e.dataTransfer.setData('text/plain', dir.id.toString());
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            setDraggedDir(null);
            setDragOverDirId(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedDir && draggedDir.id !== dir.id) {
              setDragOverDirId(dir.id);
              e.dataTransfer.dropEffect = 'move';
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOverDirId((prev) => (prev === dir.id ? null : prev));
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedDir && draggedDir.id !== dir.id) handleMoveDir(draggedDir, dir);
            setDragOverDirId(null);
          }}
          onClick={() => handleSelectDir(dir)}
        >
          {/* Expand/collapse toggle */}
          <button
            className="w-4 h-4 flex items-center justify-center shrink-0"
            onClick={(e) => hasChildren && toggleExpand(dir.id, e)}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
            ) : null}
          </button>

          {isExpanded && hasChildren ? (
            <FolderOpen className="w-4 h-4 shrink-0 text-yellow-500" />
          ) : (
            <Folder className="w-4 h-4 shrink-0 text-yellow-400" />
          )}

          <span className="text-sm truncate flex-1 min-w-0">{dir.name}</span>

          {/* Hover action buttons */}
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1">
            <button
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
              title="新建子目录"
              onClick={(e) => {
                e.stopPropagation();
                setCreateDirModal({ parentId: dir.id });
                setNewDirName('');
              }}
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
              title="重命名"
              onClick={(e) => {
                e.stopPropagation();
                setRenameDirTarget(dir);
                setRenameDirName(dir.name);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
              title="删除"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDir(dir);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {dir.children!.map((child) => (
              <DirTreeNode key={child.id} dir={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalPages = Math.ceil(docsTotal / PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="-mx-4 -my-8 flex" style={{ height: 'calc(100vh - 73px)' }}>
        {/* ── Left panel: Directory tree ─────────────────────────────────── */}
        <div className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">目录</span>

            {/* Create dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                size="sm"
                className="h-7 px-2 gap-1 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setCreateDropdownOpen((v) => !v)}
              >
                <Plus className="w-3.5 h-3.5" />
                新建
                <ChevronDown className="w-3 h-3" />
              </Button>

              {createDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 py-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    onClick={() => {
                      setCreateDirModal({ parentId: selectedDir?.id ?? null });
                      setNewDirName('');
                      setCreateDropdownOpen(false);
                    }}
                  >
                    <FolderPlus className="w-4 h-4 text-yellow-500" />
                    新建目录
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    onClick={() => {
                      setCreateFileModal('word');
                      setNewFileName('');
                      setCreateDropdownOpen(false);
                    }}
                  >
                    <FileType className="w-4 h-4 text-blue-500" />
                    Word 文档
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    onClick={() => {
                      setCreateFileModal('excel');
                      setNewFileName('');
                      setCreateDropdownOpen(false);
                    }}
                  >
                    <Sheet className="w-4 h-4 text-green-500" />
                    表格
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {isLoadingDirs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : dirs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">暂无目录</div>
            ) : (
              dirs.map((dir) => <DirTreeNode key={dir.id} dir={dir} level={0} />)
            )}
          </div>
        </div>

        {/* ── Right panel: Files ─────────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden"
          onDragEnter={(e) => {
            if (e.dataTransfer.types.includes('Files') && !draggedDir) {
              dragCounterRef.current++;
              setIsDragOverFiles(true);
            }
          }}
          onDragOver={(e) => {
            if (!draggedDir && e.dataTransfer.types.includes('Files')) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }
          }}
          onDragLeave={() => {
            if (!draggedDir) {
              dragCounterRef.current--;
              if (dragCounterRef.current === 0) setIsDragOverFiles(false);
            }
          }}
          onDrop={(e) => {
            if (!draggedDir) handleFileDrop(e);
          }}
        >
          {/* Drop overlay */}
          {isDragOverFiles && (
            <div className="absolute inset-0 z-50 bg-blue-500/10 border-4 border-dashed border-blue-400 flex items-center justify-center pointer-events-none m-2 rounded-xl">
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-600 font-semibold text-lg">
                  {selectedDir ? `上传到"${selectedDir.name}"` : '请先选择一个目录'}
                </p>
              </div>
            </div>
          )}

          {/* Files header */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0">
            {selectedDir ? (
              <>
                <Folder className="w-5 h-5 text-yellow-500 shrink-0" />
                <h1 className="text-lg font-semibold truncate">{selectedDir.name}</h1>
                <span className="text-sm text-slate-500 shrink-0">{docsTotal} 个文件</span>
              </>
            ) : (
              <h1 className="text-lg font-semibold text-slate-400">请选择一个目录</h1>
            )}
            {isUploading && (
              <div className="flex items-center gap-2 ml-auto text-sm text-blue-600 shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
                上传中...
              </div>
            )}
          </div>

          {/* Files list */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedDir ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Folder className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-base">从左侧选择一个目录查看文件</p>
                <p className="text-sm mt-1">也可以将文件拖放到此处上传</p>
              </div>
            ) : isLoadingDocs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Upload className="w-12 h-12 mb-4 opacity-30" />
                <p>目录为空</p>
                <p className="text-sm mt-1">拖放文件到此处上传，或点击"新建"创建文件</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors group"
                      onClick={() => router.push(`/dashboard/files/${doc.id}`)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY, doc });
                      }}
                    >
                      <FileText className="w-8 h-8 text-blue-500 shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title || doc.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{doc.desc || doc.type || ''}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {doc.size != null && (
                          <span className="text-xs text-slate-400 hidden sm:block">
                            {(doc.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {doc.created_time ? new Date(doc.created_time).toLocaleDateString('zh-CN') : ''}
                        </span>

                        <div className="hidden group-hover:flex items-center gap-1">
                          <button
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            title="查看"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/files/${doc.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            title="编辑"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDocTarget({
                                id: doc.id,
                                title: doc.title || '',
                                name: doc.name || '',
                                desc: doc.desc || '',
                              });
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                            title="删除"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDoc(doc);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(docsPage - 1)}
                      disabled={docsPage === 1}
                    >
                      上一页
                    </Button>
                    <span className="flex items-center text-sm text-slate-600 dark:text-slate-400 px-3">
                      {docsPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(docsPage + 1)}
                      disabled={docsPage === totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Context Menu ────────────────────────────────────────────────────── */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-[100] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[128px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
            onClick={() => {
              router.push(`/dashboard/files/${contextMenu.doc.id}`);
              setContextMenu(null);
            }}
          >
            <Eye className="w-4 h-4" /> 查看
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
            onClick={() => {
              setEditDocTarget({
                id: contextMenu.doc.id,
                title: contextMenu.doc.title || '',
                name: contextMenu.doc.name || '',
                desc: contextMenu.doc.desc || '',
              });
              setContextMenu(null);
            }}
          >
            <Pencil className="w-4 h-4" /> 编辑
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 flex items-center gap-2"
            onClick={() => handleDeleteDoc(contextMenu.doc)}
          >
            <Trash2 className="w-4 h-4" /> 删除
          </button>
        </div>
      )}

      {/* ── Create Directory Modal ──────────────────────────────────────────── */}
      {createDirModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setCreateDirModal(null)}
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">新建目录</h3>
            <Input
              autoFocus
              placeholder="目录名称"
              value={newDirName}
              onChange={(e) => setNewDirName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDir()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setCreateDirModal(null)}>取消</Button>
              <Button
                onClick={handleCreateDir}
                disabled={!newDirName.trim() || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Word / Excel Modal ───────────────────────────────────────── */}
      {createFileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setCreateFileModal(null)}
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              {createFileModal === 'word' ? (
                <FileType className="w-6 h-6 text-blue-500" />
              ) : (
                <Sheet className="w-6 h-6 text-green-500" />
              )}
              <h3 className="font-semibold text-lg">新建 {FILE_TYPE_LABELS[createFileModal]}</h3>
            </div>
            {selectedDir ? (
              <p className="text-sm text-slate-500 mb-3">
                创建到目录：<span className="font-medium text-slate-700 dark:text-slate-300">{selectedDir.name}</span>
              </p>
            ) : (
              <p className="text-sm text-amber-600 mb-3">未选择目录，文件将创建到根目录</p>
            )}
            <Input
              autoFocus
              placeholder={`${FILE_TYPE_LABELS[createFileModal]}名称`}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setCreateFileModal(null)}>取消</Button>
              <Button
                onClick={handleCreateFile}
                disabled={!newFileName.trim() || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Directory Modal ──────────────────────────────────────────── */}
      {renameDirTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setRenameDirTarget(null)}
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">重命名目录</h3>
            <Input
              autoFocus
              value={renameDirName}
              onChange={(e) => setRenameDirName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameDir()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setRenameDirTarget(null)}>取消</Button>
              <Button
                onClick={handleRenameDir}
                disabled={!renameDirName.trim() || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit File Modal ─────────────────────────────────────────────────── */}
      {editDocTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setEditDocTarget(null)}
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">编辑文件</h3>
              <button
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setEditDocTarget(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">标题</label>
                <Input
                  value={editDocTarget.title}
                  onChange={(e) => setEditDocTarget({ ...editDocTarget, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">名称</label>
                <Input
                  value={editDocTarget.name}
                  onChange={(e) => setEditDocTarget({ ...editDocTarget, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">描述</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editDocTarget.desc}
                  onChange={(e) => setEditDocTarget({ ...editDocTarget, desc: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditDocTarget(null)}>取消</Button>
              <Button
                onClick={handleEditDocSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
