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

export default class PositionerContent extends Component<PositionerContentSignature> {
  @action
  protected insertStyles(): void {
    let styleTag = document.getElementById('ember-positioner-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ember-positioner-styles';
      styleTag.setAttribute('type', 'text/css');
      styleTag.innerHTML = `
        .positioner {
          z-index: 9999;
          position: absolute;
          pointer-events: none;
        }

        .positioner.light > .positioner-container {
          background: #fff;
          color: #000;
          filter: drop-shadow(0 0 10px black);
          -webkit-filter: drop-shadow(0 0 10px black);
          transform: translateZ(0);
        }

        .positioner[data-popper-placement='top-start'] > .positioner-container, .positioner[data-popper-placement='bottom-start'] > .positioner-container, .positioner[data-popper-placement='right-start'] > .positioner-container, .positioner[data-popper-placement='right-right'] > .positioner-container {
          transform-origin: left;
        }

        .positioner[data-popper-placement='top-end'] > .positioner-container, .positioner[data-popper-placement='bottom-end'] > .positioner-container, .positioner[data-popper-placement='left-start'] > .positioner-container, .positioner[data-popper-placement='left-end'] > .positioner-container {
          transform-origin: right;
        }

        .positioner[data-popper-placement='top-start'] > .positioner-container, .positioner[data-popper-placement='bottom-start'] > .positioner-container {
          left: -6px;
        }

        .positioner[data-popper-placement='top-end'] > .positioner-container, .positioner[data-popper-placement='bottom-end'] > .positioner-container {
          right: -6px;
        }

        .positioner[data-popper-placement='left-start'] > .positioner-container, .positioner[data-popper-placement='right-start'] > .positioner-container {
          top: -6px;
        }

        .positioner[data-popper-placement='left-end'] > .positioner-container, .positioner[data-popper-placement='right-end'] > .positioner-container {
          bottom: -6px;
        }

        .positioner[data-popper-placement^='top'] > .positioner-container > .positioner-arrow {
          bottom: -3px;
        }

        .positioner[data-popper-placement^='right'] > .positioner-container > .positioner-arrow {
          left: -3px;
        }

        .positioner[data-popper-placement^='bottom'] > .positioner-container > .positioner-arrow {
          top: -3px;
        }

        .positioner[data-popper-placement^='left'] > .positioner-container > .positioner-arrow {
          right: -3px;
        }

        .positioner-container {
          position: relative;
          border-radius: 4px;
        }

        .positioner-content {
          position: relative;
        }

        .positioner-arrow,
        .positioner-arrow::before {
          position: absolute;
          width: 10px;
          height: 10px;
          background: inherit;
        }

        .positioner-arrow {
          visibility: hidden;
        }

        .positioner-arrow::before {
          content: '';
          visibility: visible;
          transform: rotate(45deg);
          top: 0;
          left: 0;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Positioner::Content': typeof PositionerContent;
  }
}
