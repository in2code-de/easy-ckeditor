/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Plugin } from '@ckeditor/ckeditor5-core'
import { ButtonView, clickOutsideHandler, ContextualBalloon } from '@ckeditor/ckeditor5-ui'
import FormView from './abbreviationview'
import getRangeText from './utils'

export default class AbbreviationUI extends Plugin {
  private _balloon: InstanceType<ContextualBalloon>
  private formView: FormView

  // eslint-disable-next-line ts/explicit-function-return-type
  static get requires() {
    return [ContextualBalloon]
  }

  init(): void {
    const editor = this.editor

    // Create the balloon and the form view.
    this._balloon = this.editor.plugins.get(ContextualBalloon)
    this.formView = this._createFormView()

    editor.ui.componentFactory.add('abbreviation', () => {
      const button = new ButtonView()

      button.label = 'Abbreviation'
      button.icon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06v-11a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 3a8.963 8.963 0 0 0-4.25 1.065V16.82ZM9.25 4.065A8.963 8.963 0 0 0 5 3c-.85 0-1.673.118-2.454.339A.75.75 0 0 0 2 4.06v11a.75.75 0 0 0 .954.721A7.506 7.506 0 0 1 5 15.5c1.579 0 3.042.487 4.25 1.32V4.065Z" />
        </svg>
      `

      button.tooltip = true
      button.withText = false

      // Show the UI on button click.
      this.listenTo(button, 'execute', () => {
        this._showUI()
      })

      return button
    })
  }

  _createFormView(): FormView {
    const editor = this.editor
    const formView = new FormView(editor.locale)

    // Execute the command after clicking the "Save" button.
    this.listenTo(formView, 'submit', () => {
      // Grab values from the abbreviation and title input fields.

      const abbr = formView.abbrInputView.fieldView.element?.value
      const title = formView.titleInputView.fieldView.element?.value

      if (!abbr || !title) {
        throw new Error('Both abbreviation and title fields must be filled.')
      }

      // @ts-expect-error - this works but is not typed correctly.
      editor.execute('addAbbreviation', { abbr, title })

      // Hide the form view after submit.
      this._hideUI()
    })

    // Hide the form view after clicking the "Cancel" button.
    this.listenTo(formView, 'cancel', () => {
      this._hideUI()
    })

    // Hide the form view when clicking outside the balloon.
    clickOutsideHandler({
      emitter: formView,
      activator: () => this._balloon.visibleView === formView,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI(),
    })

    return formView
  }

  _showUI(): void {
    const selection = this.editor.model.document.selection

    // Check the value of the command.
    const commandValue = this.editor.commands.get('addAbbreviation')?.value

    this._balloon.add({
      view: this.formView,
      position: this._getBalloonPositionData(),
    })

    const firstRange = selection.getFirstRange()
    if (!firstRange) {
      throw new Error('There is no selection in the editor.')
    }

    // Disable the input when the selection is not collapsed.
    this.formView.abbrInputView.isEnabled = firstRange.isCollapsed

    // Fill the form using the state (value) of the command.
    if (commandValue) {
      this.formView.abbrInputView.fieldView.value = commandValue.abbr
      this.formView.titleInputView.fieldView.value = commandValue.title
    }
    // If the command has no value, put the currently selected text (not collapsed)
    // in the first field and empty the second in that case.
    else {
      const selectedText = getRangeText(firstRange)

      this.formView.abbrInputView.fieldView.value = selectedText
      this.formView.titleInputView.fieldView.value = ''
    }

    this.formView.focus()
  }

  _hideUI(): void {
    // Clear the input field values and reset the form.
    this.formView.abbrInputView.fieldView.value = ''
    this.formView.titleInputView.fieldView.value = ''
    if (!(this.formView.element instanceof HTMLFormElement)) {
      throw new TypeError('Form view element is not instanceof HTMLFormElement.')
    }

    this.formView.element.reset()

    this._balloon.remove(this.formView)

    // Focus the editing view after inserting the abbreviation so the user can start typing the content
    // right away and keep the editor focused.
    this.editor.editing.view.focus()
  }

  // eslint-disable-next-line ts/explicit-function-return-type
  _getBalloonPositionData() {
    const view = this.editor.editing.view
    const viewDocument = view.document

    const range = viewDocument.selection.getFirstRange()
    if (!range) {
      throw new Error('There is no selection in the editor.')
    }

    return {
      target: () => view.domConverter.viewRangeToDom(range),
    }
  }
}
