import templateOnlyComponent from '@ember/component/template-only';

export interface PositionerContentSignature {
  Element: HTMLDivElement;
  Args: {
    isHidden: boolean;
    hideArrow?: boolean;
  };
  Blocks: {
    default: [];
  };
}

const PositionerContent = templateOnlyComponent<PositionerContentSignature>();

export default PositionerContent;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Positioner::Content': typeof PositionerContent;
  }
}
