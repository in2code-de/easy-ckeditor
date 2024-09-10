import { Plugin } from '@ckeditor/ckeditor5-core'
import { ButtonView, clickOutsideHandler, ContextualBalloon } from '@ckeditor/ckeditor5-ui'
import FormView from './referenceview'

export default class ReferencesUI extends Plugin {
  // @ts-expect-error - ignore
  private _balloon: InstanceType<ContextualBalloon>
  private formView!: FormView

  static get requires(): [typeof Plugin] {
    return [ContextualBalloon]
  }

  init(): void {
    const editor = this.editor
    this._balloon = this.editor.plugins.get(ContextualBalloon)
    this.formView = this._createFormView()

    editor.ui.componentFactory.add('reference', (locale) => {
      const button = new ButtonView(locale)

      button.label = 'Reference'
      button.icon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clip-rule="evenodd" />
        </svg>
      `

      button.tooltip = true

      button.on('execute', () => {
        this._showUI()
      })

      return button
    })
  }

  _createFormView(): FormView {
    const editor = this.editor
    const formView = new FormView(editor.locale)

    formView.on('submit', () => {
      const el = formView.referenceIdInputView.fieldView.element
      if (!el) {
        throw new Error('Reference ID input field does not exist.')
      }

      const value = {
        referenceId: el.value,
      }
      editor.execute('addReference', value)
      this._hideUI()
    })

    formView.on('cancel', () => {
      this._hideUI()
    })

    clickOutsideHandler({
      emitter: formView,
      activator: () => this._balloon.visibleView === formView,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI(),
    })

    return formView
  }

  _showUI(): void {
    const command = this.editor.commands.get('addReference')
    if (!command) {
      throw new Error('The "addReference" command has not been registered.')
    }

    const commandValue = command.value as {
      referenceId?: string
    }

    this._balloon.add({
      view: this.formView,
      position: this._getBalloonPositionData(),
    })

    if (commandValue && 'referenceId' in commandValue) {
      this.formView.referenceIdInputView.fieldView.value = commandValue.referenceId as string
    }
    else {
      this.formView.referenceIdInputView.fieldView.value = ''
    }

    this.formView.focus()
  }

  _hideUI(): void {
    this.formView.referenceIdInputView.fieldView.value = ''

    if (this.formView.element) {
      const el = this.formView.element as HTMLFormElement
      el.reset()
    }

    this._balloon.remove(this.formView)
    this.editor.editing.view.focus()
  }

  // eslint-disable-next-line ts/explicit-function-return-type
  _getBalloonPositionData() {
    const view = this.editor.editing.view
    const viewDocument = view.document

    return {
      target: () => {
        const range = viewDocument.selection.getFirstRange()
        if (!range) {
          throw new Error('There is no selection in the editor.')
        }

        return view.domConverter.viewRangeToDom(range)
      },
    }
  }
}
