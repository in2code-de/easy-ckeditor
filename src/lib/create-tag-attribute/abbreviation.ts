import { Plugin } from '@ckeditor/ckeditor5-core'
import AbbreviationEditing from './abbreviationediting'
import AbbreviationUI from './abbreviationui'

export class Abbreviation extends Plugin {
  // eslint-disable-next-line ts/explicit-function-return-type
  static get requires() {
    return [AbbreviationEditing, AbbreviationUI]
  }
}
