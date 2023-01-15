export const sslToPlain = ({value}: {value: string | string[]}): any => {
  if (Array.isArray(value)) {
    return value.map(val => sslToPlain({value: val}));
  }
  if (value.startsWith('https://')) {
    return 'http' + value.substring(5);
  }
  return value;
}