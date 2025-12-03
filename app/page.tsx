import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Database, Search, Zap, Shield, Cloud } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">DeepParseX</span>
          </div>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              登录
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            多模态文档解析与知识图谱构建平台
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            支持 PDF、Word、Excel、PPT、图片、视频、音频等多种文件格式的智能解析，
            自动提取关键信息，构建知识图谱系统
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                开始使用
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">多格式支持</h3>
            <p className="text-slate-600 dark:text-slate-400">
              支持文本、表格、图像、语音、视频等多种内容格式的智能解析
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">知识图谱</h3>
            <p className="text-slate-600 dark:text-slate-400">
              自动抽取实体-关系，构建结构化知识网络，支持图分析与可视化
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">智能检索</h3>
            <p className="text-slate-600 dark:text-slate-400">
              基于向量数据库的高性能语义搜索，结合 LLM 提供智能问答
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">高性能</h3>
            <p className="text-slate-600 dark:text-slate-400">
              优化的解析引擎，快速处理大规模文档，实时响应查询请求
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">数据安全</h3>
            <p className="text-slate-600 dark:text-slate-400">
              企业级安全保障，支持私有化部署，确保数据隐私和安全
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-4">
              <Cloud className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">灵活扩展</h3>
            <p className="text-slate-600 dark:text-slate-400">
              模块化设计，支持自定义解析器、嵌入模型和 LLM 集成
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2024 DeepParseX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
