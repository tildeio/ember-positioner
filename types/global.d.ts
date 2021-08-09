import '@glint/environment-ember-loose/registry';
import { TemplateFactory } from 'htmlbars-inline-precompile';
import Helper from '@glint/environment-ember-loose/ember-component/helper';

interface PageTitleHelperSignature {
  PositionalArgs: [title: string];
  Return: '';
}

declare class PageTitleHelper extends Helper<PageTitleHelperSignature> {}

// Types for compiled templates
declare module 'ember-positioner/templates/*' {
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'page-title': typeof PageTitleHelper;
    'did-insert': typeof import('@gavant/glint-template-types/types/ember-render-modifiers/did-insert').default;
    'did-update': typeof import('@gavant/glint-template-types/types/ember-render-modifiers/did-update').default;
    'will-destroy': typeof import('@gavant/glint-template-types/types/ember-render-modifiers/will-destroy').default;
  }
}
