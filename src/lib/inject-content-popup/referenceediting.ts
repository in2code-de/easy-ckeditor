import { Plugin } from '@ckeditor/ckeditor5-core'
import ReferencesCommand from './referencecommand'

declare module '@ckeditor/ckeditor5-core' {
  interface CommandsMap {
    addReference: ReferencesCommand
  }
}

export default class ReferencesEditing extends Plugin {
  init(): void {
    this._defineSchema()
    this._defineConverters()

    this.editor.commands.add('addReference', new ReferencesCommand(this.editor))
  }

  _defineSchema(): void {
    const schema = this.editor.model.schema
    schema.extend('$text', { allowAttributes: ['referenceId'] })
  }

  _defineConverters(): void {
    const conversion = this.editor.conversion

    conversion.for('downcast').attributeToElement({
      model: 'referenceId',
      view: (modelAttributeValue, conversionApi) => {
        const { writer } = conversionApi
        return writer.createAttributeElement('span', {
          'data-referencepoint': 'true',
          'data-referenceid': modelAttributeValue,
        })
      },
    })

    conversion.for('upcast').elementToAttribute({
      view: {
        name: 'span',
        attributes: {
          'data-referencepoint': 'true',
          'data-referenceid': true,
        },
      },
      model: {
        key: 'referenceId',
        value: (viewElement: HTMLElement) => viewElement.getAttribute('data-referenceid') as string,
      },
    })
  }
}
