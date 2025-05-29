
import DocumentSvg from '@/assets/svg/document.svg';
import SubjectSvg from '@/assets/svg/subject.svg';
import PictureSvg from '@/assets/svg/picture.svg';
import MailSvg from '@/assets/svg/email.svg';
import ExcelSvg from '@/assets/svg/excel.svg';
import TextSvg from '@/assets/svg/text.svg';

// 根据文件的类型返回SVG
export function getSvgByType(type: string) {
    switch (type) {
        case 'PDF':
            return DocumentSvg;
        case '文本':
            return TextSvg;
        case 'Word':
            return SubjectSvg;
        case '邮件':
            return MailSvg;
        case '图片':
            return PictureSvg;
        case '表格':
            return ExcelSvg;
        default:
            return DocumentSvg;
    }
}

// 根据文件的原始标题返回SVG
export function getSvgByFileName(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf':
            return DocumentSvg;
        case 'txt':
            return TextSvg;
        case 'doc':
        case 'docx':
            return SubjectSvg;
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
        default:
            return DocumentSvg;
    }
}