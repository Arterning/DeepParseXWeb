
import PdfSvg from '@/assets/svg/pdf.svg';
import DocxSvg from '@/assets/svg/docx.svg';
import PictureSvg from '@/assets/svg/picture.svg';
import MailSvg from '@/assets/svg/email.svg';
import ExcelSvg from '@/assets/svg/excel.svg';
import TextSvg from '@/assets/svg/text.svg';
import PptSvg from '@/assets/svg/ppt.svg';
import MediaSvg from '@/assets/svg/media.svg';

// 根据文件的类型返回SVG
export function getSvgByType(type: string) {
    switch (type) {
        case 'PDF':
            return PdfSvg;
        case '文本':
            return TextSvg;
        case '文档':
            return DocxSvg;
        case '邮件':
            return MailSvg;
        case '图片':
            return PictureSvg;
        case '表格':
            return ExcelSvg;
        case 'PPT':
            return PptSvg;
        case '媒体':
            return MediaSvg;
        default:
            return DocxSvg;
    }
}

// 根据文件的原始标题返回SVG
export function getSvgByFileName(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf':
            return PdfSvg;
        case 'txt':
            return TextSvg;
        case 'doc':
        case 'docx':
            return DocxSvg;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return PictureSvg;
        case 'xls':
        case 'xlsx':
            return ExcelSvg;
        case 'eml':
            return MailSvg;
        case 'ppt':
        case 'pptx':
            return PptSvg;
        case 'mp3':
        case 'mp4':
        case 'avi':
        case 'wmv':
        case 'flv':
        case 'mkv':
            return MediaSvg;
        default:
            return DocxSvg;
    }
}


// 文件大小格式化函数
export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / (k ** i)).toFixed(2)} ${sizes[i]}`;
};

export const buildSrcURL = (file: string) => {
    let url;
    if (import.meta.env.VITE_API_BASE_URL) {
        url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/sys/docs/preview/${file}`;
    } else {
        url = `${window.origin}/api/v1/sys/docs/preview/${file}`;
    }
    return url;
}

export function isHtmlContent(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const trimmed = input.trim();
    
    // 检查是否包含HTML文档的基本结构
    const hasDoctype = /<!doctype\s+html/i.test(trimmed);
    const hasHtmlTag = /<html[^>]*>/i.test(trimmed) && /<\/html>/i.test(trimmed);
    const hasHeadTag = /<head[^>]*>/i.test(trimmed) && /<\/head>/i.test(trimmed);
    const hasBodyTag = /<body[^>]*>/i.test(trimmed) && /<\/body>/i.test(trimmed);
    const hasDivTag = /<div[^>]*>/i.test(trimmed) && /<\/div>/i.test(trimmed);
    const hasTableTag = /<table[^>]*>/i.test(trimmed) && /<\/table>/i.test(trimmed);
    const hasPTag = /<p[^>]*>/i.test(trimmed) && /<\/p>/i.test(trimmed);
    
    // 至少需要html标签或者doctype + html结构
    return hasHtmlTag || (hasDoctype && (hasHeadTag || hasBodyTag )) || hasDivTag || hasTableTag || hasPTag;
  }