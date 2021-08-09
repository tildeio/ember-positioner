import Component from '@glint/environment-ember-loose/glimmer-component';

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
  jeff = false;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Positioner: typeof Positioner;
  }
}
