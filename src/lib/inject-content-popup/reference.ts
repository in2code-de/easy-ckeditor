import { Plugin } from '@ckeditor/ckeditor5-core'
import ReferencesEditing from './referenceediting'
import ReferencesUI from './referenceui'

export class References extends Plugin {
  // eslint-disable-next-line ts/explicit-function-return-type
  static get requires() {
    return [ReferencesEditing, ReferencesUI]
  }
}
