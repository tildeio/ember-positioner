import Component from '@glint/environment-ember-loose/glimmer-component';
import { action } from '@ember/object';
import { createPopper } from '@popperjs/core';
import { assert } from '@ember/debug';

export interface PositionerSignature {
  Element: null;
  Args: {
    dianne?: boolean;
  };
  Yields: {
    godfrey: [];
  };
}

export default class Positioner extends Component<PositionerSignature> {
  @action
  didInsert(element: HTMLElement): void {
    let anchor = document.querySelector('.anchor');
    assert('anchor is an HTMLElement', anchor instanceof HTMLElement);
    createPopper(anchor, element);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Positioner: typeof Positioner;
  }
}
