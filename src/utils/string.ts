export const replace = (
  str: string,
  placeholders?: Record<string, string>,
  defaultValue = 'undefined',
  startTag = '${',
  endTag = '}',
): string => {
  let result: string = str;

  const startId = str.indexOf(startTag);
  const endId = str.indexOf(endTag);
  if (startId > -1 && endId > -1 && endId > startId) {
    result = str.slice(0, startId);
    const placeholder = str.slice(startId + startTag.length, endId);
    const value = placeholders?.[placeholder] || defaultValue;
    result = result + value + str.slice(endId + endTag.length);
  }

  if (startId !== str.lastIndexOf(startTag)) {
    result = replace(result, placeholders, defaultValue, startTag, endTag);
  }

  return result;
};
