import { Plugin } from '@ckeditor/ckeditor5-core'
import {
  ButtonView,
  clickOutsideHandler,
  ContextualBalloon,
  createLabeledInputText,
  LabeledFieldView,
  View,
} from '@ckeditor/ckeditor5-ui'
import type { Editor } from '@ckeditor/ckeditor5-core'
import type {
  ViewCollection,
} from '@ckeditor/ckeditor5-ui'
import type { Locale } from '@ckeditor/ckeditor5-utils'

interface Options {
  id: string
  tag: string
  buttonConfig: {
    label: string
    svgIcon?: string
  }
  defaultAttributes: { name: string, value: string }[]
  userInputAttribute: { label: string, name: string }
}

// eslint-disable-next-line ts/explicit-function-return-type
export function getGenericPluginInstance(options: Options) {
  return class GenericPlugin extends Plugin {
    private _balloon: ContextualBalloon // Declare it as ContextualBalloon
    private formView!: GenericFormView

    // eslint-disable-next-line ts/explicit-function-return-type
    static get requires() {
      return [ContextualBalloon]
    }

    constructor(editor: Editor) {
      super(editor)
      // Use get() method to retrieve the instance of ContextualBalloon
      this._balloon = this.editor.plugins.get(ContextualBalloon) as ContextualBalloon
    }

    init(): void {
      this._initializePlugin(options)
    }

    _initializePlugin(options: Options): void {
      const { id, buttonConfig, userInputAttribute } = options

      // Register the button with a balloon popup
      this.editor.ui.componentFactory.add(id, (locale) => {
        const button = new ButtonView(locale)
        button.set({
          label: buttonConfig.label,
          tooltip: buttonConfig.label,
          icon: buttonConfig.svgIcon,
          withText: !buttonConfig.svgIcon,
        })

        button.on('execute', () => this._showFormView())

        return button
      })

      // Initialize the custom GenericFormView
      this.formView = new GenericFormView(this.editor.locale, userInputAttribute.label)

      // Close the balloon when clicking outside
      clickOutsideHandler({
        emitter: this.formView, // formView now works as an Emitter
        activator: () => this._balloon.visibleView === this.formView,
        contextElements: [this._balloon.view.element as Element],
        callback: () => this._hideFormView(),
      })
    }

    _showFormView(): void {
      if (this._balloon.hasView(this.formView))
        return

      this._balloon.add({
        view: this.formView,
        position: this._getBalloonPositionData(),
      })

      this.formView.saveButtonView.on('execute', () => {
        const userInputElement = this.formView.inputView.fieldView.element as HTMLInputElement
        if (!userInputElement) {
          throw new Error('The input element is not available.')
        }

        const userInput = userInputElement.value
        if (userInput) {
          this.editor.execute(`${options.id}Command`, { value: userInput })
          this._hideFormView()
        }
      })

      this.formView.cancelButtonView.on('execute', () => this._hideFormView())
    }

    _hideFormView(): void {
      this._balloon.remove(this.formView)
    }

    _getBalloonPositionData(): { target: globalThis.Range } {
      const view = this.editor.editing.view
      const viewDocument = view.document
      const target = view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange()!)
      return { target }
    }
  }
}

// Define the custom GenericFormView class
class GenericFormView extends View {
  public inputView: LabeledFieldView
  public saveButtonView: ButtonView
  public cancelButtonView: ButtonView
  public children: ViewCollection

  constructor(locale: Locale, label: string) {
    super(locale)

    // Initialize the view collection
    this.children = this.createCollection()

    // Create the input field view
    this.inputView = this._createInput(label)

    // Create the save and cancel buttons
    this.saveButtonView = this._createButton('Save', 'check')
    this.cancelButtonView = this._createButton('Cancel', 'cancel')

    // Add all the views to the view's collection
    this.children.add(this.inputView)
    this.children.add(this.saveButtonView)
    this.children.add(this.cancelButtonView)

    // Define the template for the form
    this.setTemplate({
      tag: 'form',
      attributes: {
        class: ['ck', 'ck-generic-form'],
        tabindex: '-1',
      },
      children: this.children,
    })
  }

  private _createInput(label: string): LabeledFieldView {
    const input = new LabeledFieldView(this.locale, createLabeledInputText)
    input.label = label
    return input
  }

  private _createButton(label: string, icon: string): ButtonView {
    const button = new ButtonView()
    button.set({
      label,
      icon,
      withText: true,
    })
    return button
  }
}
