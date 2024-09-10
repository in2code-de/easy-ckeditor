import { Command } from '@ckeditor/ckeditor5-core'
import { findAttributeRange } from '@ckeditor/ckeditor5-typing'
import { toMap } from '@ckeditor/ckeditor5-utils'

function isStringInteger(value: string): boolean {
  return /^\d+$/.test(value)
}

function computeReferenceId(id: string | number | unknown): number | false {
  if (typeof id === 'string') {
    if (!isStringInteger(id)) {
      return false
    }

    return Number.parseInt(id, 10) - 1
  }

  if (typeof id === 'number') {
    return id - 1
  }

  return false
}

export default class ReferencesCommand extends Command {
  refresh(): void {
    const model = this.editor.model
    const selection = model.document.selection
    const firstRange = selection.getFirstRange()
    if (!firstRange) {
      throw new Error('No selection range found.')
    }

    if ('isCollapsed' in firstRange && firstRange.isCollapsed) {
      if (selection.hasAttribute('referenceId')) {
        const attributeValue = selection.getAttribute('referenceId')

        // @ts-expect-error - ignore
        const referenceRange = findAttributeRange(firstRange, 'referenceId', attributeValue, model)

        const referenceId = computeReferenceId(attributeValue)
        if (referenceId === false)
          return

        this.value = {
          referenceId,
          range: referenceRange,
        }
      }
      else {
        this.value = null
      }
    }
    else {
      if (selection.hasAttribute('referenceId')) {
        const attributeValue = selection.getAttribute('referenceId')
        const selectionFirstPosition = selection.getFirstPosition()
        if (!selectionFirstPosition) {
          throw new Error('No selection range found.')
        }

        const referenceRange = findAttributeRange(selectionFirstPosition, 'referenceId', attributeValue, model)

        if (referenceRange.containsRange(firstRange, true)) {
          this.value = {
            referenceId: attributeValue,
            range: firstRange,
          }
        }
        else {
          this.value = null
        }
      }
      else {
        this.value = null
      }
    }

    this.isEnabled = model.schema.checkAttributeInSelection(selection, 'referenceId')
  }

  execute({ referenceId }: { referenceId: string }): void {
    const model = this.editor.model
    const selection = model.document.selection
    const computedReferenceId = computeReferenceId(referenceId)
    if (computedReferenceId === false)
      return

    model.change((writer) => {
      if (selection.isCollapsed) {
        if (this.value) {
          const { end: positionAfter } = model.insertContent(
            writer.createText('*', { referenceId: computedReferenceId }),
            // @ts-expect-error - ignore
            this.value.range,
          )
          writer.setSelection(positionAfter)
        }
        else if (referenceId !== '') {
          const firstPosition = selection.getFirstPosition()
          const attributes = toMap(selection.getAttributes())
          attributes.set('referenceId', computedReferenceId)
          const { end: positionAfter } = model.insertContent(writer.createText('*', attributes), firstPosition)
          writer.setSelection(positionAfter)
        }
        writer.removeSelectionAttribute('referenceId')
      }
      else {
        const ranges = model.schema.getValidRanges(selection.getRanges(), 'referenceId')

        for (const range of ranges) {
          writer.setAttribute('referenceId', computedReferenceId, range)
        }
      }
    })
  }
}
