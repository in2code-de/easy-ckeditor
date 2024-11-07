import { ButtonView } from '@ckeditor/ckeditor5-ui'
import type { Editor } from '@ckeditor/ckeditor5-core'

interface Button {
  id: string
  label: string
  svgIcon?: string
  content: string
}

/**
 * Adds button to toolbar to inject some content at the current cursor position.
 * @param id Unique id of component
 * @param editor The CKEditor instance.
 * @param buttonConfig The button configuration which is added to the toolbar.
 * @param content The content to inject at the current cursor position.
 */
export function injectContentToCursorPosition(
  id: string,
  editor: Editor,
  buttonConfig: Button,
  content: string,
): void {
  editor.ui.componentFactory.add(id, () => {
    const button = new ButtonView()

    button.set({
      label: buttonConfig.label,
      tooltip: buttonConfig.label,
      icon: buttonConfig.svgIcon,
      // when icon is provided, don't show the label
      withText: !!buttonConfig.svgIcon,
    })

    button.on('execute', () => {
      // Check if button.element exists before trying to blur it
      if (button.element) {
        button.element.blur()
      }

      editor.model.change((writer) => {
        // Get the current selection position (where the content will be inserted)
        const selection = editor.model.document.selection.getFirstPosition()

        if (selection) {
          // Insert the content at the current selection
          editor.model.insertContent(writer.createText(content), selection)

          // Check if nodeAfter exists before moving the cursor after it
          const nodeAfter = selection.nodeAfter
          if (nodeAfter) {
            const positionAfter = writer.createPositionAfter(nodeAfter)

            // Set the selection (cursor) to the position after the inserted content
            writer.setSelection(positionAfter)
          }
        }
      })

      // Ensure the editor gets focused after the content is inserted
      editor.editing.view.focus()
    })

    return button
  })
}
