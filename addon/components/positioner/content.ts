import Component from '@glint/environment-ember-loose/glimmer-component';
import { action } from '@ember/object';

export interface PositionerContentSignature {
  Element: HTMLDivElement;
  Args: {
    isHidden: boolean;
    hideArrow?: boolean;
  };
  Yields: {
    default: [];
  };
}

export default class PositionerContent extends Component<PositionerContentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Positioner::Content': typeof PositionerContent;
  }
}
