import dayjs from "dayjs";

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / (k ** i)).toFixed(2)} ${sizes[i]}`;
};

export const formatDate = (isoString:  | Date) => dayjs(isoString).format("YY-MM-DD HH:mm:ss");