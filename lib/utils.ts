import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 构建文件预览URL
 * @param file 文件名或路径
 * @returns 完整的预览URL
 */
export function buildPreviewURL(file: string): string {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.origin : '');
  return `${baseURL}/api/v1/sys/docs/preview/${file}`;
}
