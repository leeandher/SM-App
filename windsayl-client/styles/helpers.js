import get from 'lodash/get'

/**
 * Quickly apply theme item through styled-components
 * @param {*} paletteKey - A traversal path to the paletteStyle (see https://lodash.com/docs/4.17.11#get)
 * @returns {} - A style property value from the palette file
 */
export const themer = paletteKey => {
  return function({ theme }) {
    return get(theme, paletteKey)
  }
}
