export default function formatName(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => {
      if (!word) return '';
      const [firstChar, ...rest] = word;
      return firstChar.toLocaleUpperCase() + rest.join('').toLocaleLowerCase();
    })
    .join(' ');
}