import type { Range } from '@ckeditor/ckeditor5-engine'

// A helper function that retrieves and concatenates all text within the model range.
export default function getRangeText(range: Range): string {
  const rangeItems = range.getItems()

  return Array.from(rangeItems).reduce((rangeText, node) => {
    if (!(node.is('text') || node.is('textProxy'))) {
      return rangeText
    }

    return rangeText + node.data
  }, '')
}
