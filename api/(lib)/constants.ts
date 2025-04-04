export function removeSpacing(value: string, by = '_') {
  return value.replace(/\s/g, by).trim().toLocaleLowerCase()
}
