import { icons } from '@ckeditor/ckeditor5-core'
import {
  ButtonView,
  createLabeledInputText,
  FocusCycler,
  LabeledFieldView,
  submitHandler,
  View,
} from '@ckeditor/ckeditor5-ui'
import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils'
import type {
  InputTextView,
  ViewCollection,
} from '@ckeditor/ckeditor5-ui'

export default class FormView extends View {
  private readonly focusTracker: FocusTracker
  private readonly keystrokes: KeystrokeHandler
  public readonly abbrInputView: LabeledFieldView<InputTextView>
  public readonly titleInputView: LabeledFieldView<InputTextView>
  private readonly saveButtonView: ButtonView
  private readonly cancelButtonView: ButtonView
  private readonly childViews: ViewCollection<LabeledFieldView<InputTextView> | ButtonView>
  private readonly _focusCycler: FocusCycler

  constructor(locale) {
    super(locale)

    this.focusTracker = new FocusTracker()
    this.keystrokes = new KeystrokeHandler()

    this.abbrInputView = this._createInput('Add abbreviation')
    this.titleInputView = this._createInput('Add title')

    this.saveButtonView = this._createButton('Save', icons.check, 'ck-button-save')

    // Submit type of the button will trigger the submit event on entire form when clicked
    // (see submitHandler() in render() below).
    this.saveButtonView.type = 'submit'

    this.cancelButtonView = this._createButton('Cancel', icons.cancel, 'ck-button-cancel')

    // Delegate ButtonView#execute to FormView#cancel.
    this.cancelButtonView.delegate('execute').to(this, 'cancel')

    this.childViews = this.createCollection([
      this.abbrInputView,
      this.titleInputView,
      this.saveButtonView,
      this.cancelButtonView,
    ])

    this._focusCycler = new FocusCycler({
      focusables: this.childViews,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate form fields backwards using the Shift + Tab keystroke.
        focusPrevious: 'shift + tab',

        // Navigate form fields forwards using the Tab key.
        focusNext: 'tab',
      },
    })

    this.setTemplate({
      tag: 'form',
      attributes: {
        class: ['ck', 'ck-abbr-form'],
        tabindex: '-1',
      },
      children: this.childViews,
    })
  }

  render(): void {
    super.render()

    submitHandler({
      view: this,
    })

    // TODO: can this be fixed?
    this.childViews._items.forEach((view) => {
      // Register the view in the focus tracker.
      this.focusTracker.add(view.element)
    })

    // Start listening for the keystrokes coming from #element.
    if (!this.element) {
      throw new Error('The element has to be rendered before the keystrokes can be listened to.')
    }

    this.keystrokes.listenTo(this.element)
  }

  destroy(): void {
    super.destroy()

    this.focusTracker.destroy()
    this.keystrokes.destroy()
  }

  focus(): void {
    // If the abbreviation text field is enabled, focus it straight away to allow the user to type.
    if (this.abbrInputView.isEnabled) {
      this.abbrInputView.focus()
    }
    // Focus the abbreviation title field if the former is disabled.
    else {
      this.titleInputView.focus()
    }
  }

  _createInput(label): LabeledFieldView<InputTextView> {
    const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText)

    labeledInput.label = label

    return labeledInput
  }

  _createButton(label: string, icon: string, className: string): ButtonView {
    const button = new ButtonView()

    button.set({
      label,
      icon,
      tooltip: true,
      class: className,
    })

    return button
  }
}