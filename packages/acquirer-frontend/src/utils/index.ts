import capitalize from 'lodash.capitalize'

export const convertKebabCaseToReadable = (snakeCaseString: string) => {
  return snakeCaseString
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}
