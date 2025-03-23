// 转换为小字母开头的驼峰命名
export default function convertToCamelCase(input: string): string {
  let camelCase = input.replace(/^[_-]+/, '');
  camelCase = camelCase.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
  camelCase = camelCase.charAt(0).toLowerCase() + camelCase.slice(1);
  return camelCase;
}

// 转换为小字母加中划线命名
export function convertToKebabCase(input: string): string {
  let snakeCase = input.replace(/^[_-]+/, '');
  snakeCase = snakeCase.replace(/([A-Z])/g, '-$1').toLowerCase();
  return snakeCase;
}

// 清除Markdown格式
export function cleanMarkdown(input: string) {

  if(!input) return '';
  // Remove Markdown symbols
  const mdSymbolRegex = /[*_~`[\]()>#+\-!|]/g;

  // Remove extra spaces (more than one space in a row)
  const extraSpacesRegex = /\s+/g;

  // Trim the string and apply regex replacements
  return input
    .replace(mdSymbolRegex, '') // Remove Markdown symbols
    .replace(extraSpacesRegex, ' ') // Normalize spaces
    .trim(); // Remove leading and trailing spaces
}