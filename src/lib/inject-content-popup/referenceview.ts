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
import type { Locale } from '@ckeditor/ckeditor5-utils'

export default class FormView extends View {
  private focusTracker: FocusTracker
  private keystrokes: KeystrokeHandler
  public referenceIdInputView: LabeledFieldView<InputTextView>
  private saveButtonView: ButtonView
  private cancelButtonView: ButtonView
  public childViews: ViewCollection<LabeledFieldView<InputTextView> | ButtonView>
  private _focusCycler: FocusCycler

  constructor(locale: Locale) {
    super(locale)

    this.focusTracker = new FocusTracker()
    this.keystrokes = new KeystrokeHandler()

    this.referenceIdInputView = this._createInput('Add reference ID')
    this.referenceIdInputView.infoText = 'The Reference ID is the position of the reference in the list on the current page'

    this.saveButtonView = this._createButton('Save', icons.check, 'ck-button-save')
    this.saveButtonView.type = 'submit'

    this.cancelButtonView = this._createButton('Cancel', icons.cancel, 'ck-button-cancel')
    this.cancelButtonView.delegate('execute').to(this, 'cancel')

    this.childViews = this.createCollection([
      this.referenceIdInputView,
      this.saveButtonView,
      this.cancelButtonView,
    ])

    this._focusCycler = new FocusCycler({
      focusables: this.childViews,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        focusPrevious: 'shift + tab',
        focusNext: 'tab',
      },
    })

    this.setTemplate({
      tag: 'form',
      attributes: {
        class: ['ck', 'ck-references-form'],
        tabindex: '-1',
      },
      children: this.childViews,
    })
  }

  render(): void {
    super.render()

    submitHandler({ view: this })

    // @ts-expect-error - ignore
    this.childViews._items.forEach((view) => {
      this.focusTracker.add(view.element)
    })

    if (!this.element) {
      throw new Error('The element is not available.')
    }

    this.keystrokes.listenTo(this.element)
  }

  focus(): void {
    if ('isEnabled' in this.referenceIdInputView && this.referenceIdInputView.isEnabled) {
      this.referenceIdInputView.focus()
    }
  }

  _createInput(label: string): LabeledFieldView<InputTextView> {
    const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText)
    labeledInput.label = label
    return labeledInput
  }

  _createButton(label: string, icon: string, className: string): ButtonView {
    const button = new ButtonView()
    button.set({ label, icon, tooltip: true, class: className })
    return button
  }
}
