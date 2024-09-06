import { ButtonView } from '@ckeditor/ckeditor5-ui'
import type { Editor } from '@ckeditor/ckeditor5-core'

/**
 * Adds button to toolbar to wrap selected text with a given html tag.
 * @param id Unique id of component
 * @param editor The CKEditor instance.
 * @param buttonLabel The label of the button which is added to the toolbar
 * @param htmlTag The html tag to wrap the selected text with.
 */
export function addTextWrapButton(id: string, editor: Editor, buttonLabel: string, htmlTag: string): void {
  // Extend the schema to include the 'strong' attribute.
  editor.model.schema.extend('$text', { allowAttributes: htmlTag })

  // Define the upcast converter for the provided htmlTag.
  editor.conversion.for('upcast').attributeToAttribute({
    view: {
      name: htmlTag,
      key: htmlTag,
    },
    model: htmlTag,
  })

  // Define the downcast converter for the provided htmlTag.
  editor.conversion.for('downcast').attributeToElement({
    model: htmlTag,
    view: (modelAttributeValue, { writer }) => {
      if (modelAttributeValue) {
        return writer.createAttributeElement(htmlTag)
      }
    },
  })

  editor.ui.componentFactory.add(id, () => {
    const button = new ButtonView()

    button.set({
      label: buttonLabel,
      withText: true,
    })

    button.on('execute', () => {
      const selection = editor.model.document.selection

      // Change the model using the model writer.
      editor.model.change((writer) => {
        const ranges = selection.getRanges()

        for (const range of ranges) {
          if (selection.hasAttribute(htmlTag)) {
            // Remove the htmlTag if the selection already has it.
            writer.removeAttribute(htmlTag, range)
          }
          else {
            // Apply the htmlTag attribute to the selected text.
            writer.setAttribute(htmlTag, true, range)
          }
        }
      })
    })

    return button
  })
}
