import Component from '@glint/environment-ember-loose/glimmer-component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import Ember from 'ember';
import { Modifier, createPopper, Placement, Instance } from '@popperjs/core';
import { PositionerContentSignature } from './content';

// Animation properties

const TOP = 'scale(.975) translateY(2px)';
const RIGHT = 'scale(.975) translateX(-2px)';
const BOTTOM = 'scale(.975) translateY(-2px)';
const LEFT = 'scale(.975) translateX(2px)';
const CUBIC_BEZIER = 'cubic-bezier(0, -0.14, 0, 1.05)';

export interface PositionerSignature {
  Element: PositionerContentSignature['Element'];
  Args: {
    /**
     * The amount of time in ms to run any opening animations.
     */
    openDuration?: number;
    /**
     * The amount of time in ms to run any closing animations.
     */
    closeDuration?: number;
    /**
     * Whether or not to display an arrow between the positioner content and
     * target. Defaults to true.
     */
    hideArrow?: boolean;
    /**
     * Where to place the positioner in relation to the target. Defaults to 'top'.
     * See https://popper.js.org/ for all options.
     */
    placement?: Placement;
    /**
     * How far away from the `anchor` element to position the positioner.
     * Defaults to "7" to position the positioner 7px away from the `anchor`.
     * https://popper.js.org/docs/v2/modifiers/offset/
     */
    offsetDistance?: number;
    /**
     * Defines a custom boundary element the positioner should respect when
     * rendering. Defaults to popper.js "clippingParents", which are the
     * scrolling containers that may cause the element to be partially or
     * fully cut off.
     * https://popper.js.org/docs/v2/utils/detect-overflow/#boundary
     */
    overflowBoundary?: HTMLElement;
    /**
     * Whether to insert the positioner in the DOM as part of the normal tree,
     * or to insert it at the end of `ember-application` element.
     */
    inline?: boolean;
    /**
     * Whether to allow a delay in testing mode. Used to test transitional
     * `isOpening` and `isClosing` states.
     */
    _allowTestDelay?: boolean;
  };
  Yields: {
    trigger: [PositionerAPI];
    content: [PositionerAPI];
  };
}

export interface OpenOptions {
  didRender?: () => void;
  didOpen?: () => void;
}

export interface CloseOptions {
  didClose?: () => void;
}

export interface PositionerAPI {
  anchor: HTMLElement | null;
  isOpening: boolean;
  isOpened: boolean;
  isClosing: boolean;
  isClosed: boolean;
  isShown: boolean;
  isHidden: boolean;
  // Actions you can pass to the on modifier
  toggle(event?: Event): void;
  open(event?: Event): void;
  open(options: OpenOptions): void;
  close(event?: Event): void;
  close(options: CloseOptions): void;
  update(): void;
  // Callback you can pass to the did-insert modifier
  registerAnchor: (target: HTMLElement) => void;
}

enum PositionerState {
  Opening = 'opening',
  Opened = 'opened',
  Closing = 'closing',
  Closed = 'closed',
}

export default class Positioner
  extends Component<PositionerSignature>
  implements PositionerAPI
{
  /** Instance created by createPositioner */
  private instance: Instance | null = null;

  /**
   * The element to which you want to anchor the positioner's content.
   */
  anchor: HTMLElement | null = null;

  /**
   * The positioner's content.
   */
  private content: HTMLElement | null = null;

  /**
   * The current state of the positioner. Options are 'opening', 'opened',
   * 'closing', and 'closed'.
   * Defaults to `closed`.
   */
  @tracked private state = PositionerState.Closed;

  /**
   * Position-based transform styles for animations
   */
  @tracked private transformStyles = 'none';

  /**
   * Whether to animate the positioner.
   * False if the positioner instance is already open.
   */
  @tracked private shouldAnimate = true;

  /**
   * Registers the <Positioner::Content> component when it's inserted in the DOM.
   */
  @tracked protected didRenderContent = this.defaultDidRenderContent;

  /**
   * The alternate parent containing element for the positioner.
   */
  protected get altContainer(): HTMLElement {
    let el = document.querySelector('.ember-application');
    assert('expected el to be an HTMLElement', el instanceof HTMLElement);

    return el;
  }

  /**
   * Whether to use the `altContainer` element as the container.
   * Defaults to true.
   */
  protected get inline(): boolean {
    return this.args.inline ?? true;
  }

  /**
   * Use with the `did-insert` modifier to register the `anchor` to which you
   * want to attach the positioner element.
   */
  @action registerAnchor(el: HTMLElement): void {
    assert('el is an HTMLElement', el instanceof HTMLElement);
    this.anchor = el;
  }

  /**
   * Whether or not to allow a delay when testing.
   * Used to test transitional states of `isOpening` and `isClosing`.
   */
  private get allowDelay(): boolean {
    return !Ember.testing || this.args._allowTestDelay === true;
  }

  /**
   * The amount of time in ms to transition between the Positioner's `Opening` and
   * `Opened` states.
   * Set to 0 in tests, unless `allowDelay` is true.
   */
  private get openDuration(): number {
    return this.allowDelay ? this.args.openDuration ?? 0 : 0;
  }

  /**
   * The amount of time in ms to transition between the Positioner's `Closing` and
   * `Closed` states.
   * Set to 0 in tests, unless `allowDelay` is true.
   */
  private get closeDuration(): number {
    return this.allowDelay ? this.args.closeDuration ?? 0 : 0;
  }

  /**
   * Whether the positioner is in the `Opening` state.
   */
  get isOpening(): boolean {
    return this.state === PositionerState.Opening;
  }

  /**
   * Whether the positioner is in the `Opened` state.
   */
  get isOpened(): boolean {
    return this.state === PositionerState.Opened;
  }

  /**
   * Whether the positioner is in the `Closing` state.
   */
  get isClosing(): boolean {
    return this.state === PositionerState.Closing;
  }

  /**
   * Whether the positioner is in the `Closed` state.
   */
  get isClosed(): boolean {
    return this.state === PositionerState.Closed;
  }

  /**
   * Whether the positioner is in the `Opening` or `Opened` state.
   * Used to manage state for assistive technologies that have no reason to wait
   * for animation transitions in the UI.
   */
  get isShown(): boolean {
    return this.isOpening || this.isOpened;
  }

  /**
   * Whether the positioner is in the `Closing` or `Closed` state.
   * Used to manage state for assistive technologies that have no reason to wait
   * for animation transitions in the UI.
   */
  get isHidden(): boolean {
    return !this.isShown;
  }

  /**
   * Calls the `open` and `close` actions to switch between the two states.
   */
  @action toggle(): void {
    if (this.isHidden) {
      void this.open();
    } else {
      void this.close();
    }
  }

  /**
   * Sets the options to pass to the `doOpen` task and calls it with those
   * options.
   * Can be passed to the "on" modifier directly, in which case we will recieve
   * the `Event`, or can be called with an options object using the `(fn)`
   * helper, or from JS code.
   */
  @action open(maybeOptions?: OpenOptions | Event): void {
    let options: OpenOptions = {};

    if (maybeOptions && !(maybeOptions instanceof Event)) {
      options = maybeOptions;
    }

    void this.doOpen.perform(options);
  }

  /**
   * Sets the options to pass to the `doClose` task and calls it with those
   * options.
   * Can be called with the "on" modifier in the template and passed an Event.
   */
  @action close(maybeOptions?: CloseOptions | Event): void {
    let options: CloseOptions = {};

    if (maybeOptions && !(maybeOptions instanceof Event)) {
      options = maybeOptions;
    }

    void this.doClose.perform(options);
  }

  /**
   * Recompute the positioner's position. This is especially useful if the content
   * of the positioner changes after initial render.
   */
  @action update(): void {
    void this.instance?.update();
  }

  /**
   * Creates a positioner instance with this component's yielded content block,
   * positions it, and runs the opening animation.
   * Sets the positioner `state` to `Opening` during animation and executes the
   * optional `didRender` callback while in this state.
   * Sets the positioner `state` to `Opened` when the task is finished and
   * immediately executes the optional `didOpen` callback.
   */
  @task({ drop: true })
  // eslint-disable-next-line complexity, max-statements
  private doOpen = taskFor(async (options: OpenOptions): Promise<void> => {
    void this.doClose.cancelAll();

    if (this.isClosed) {
      this.shouldAnimate = true;
      let contentPromise = new Promise<HTMLElement>((resolve) => {
        this.didRenderContent = resolve;
      });

      this.state = PositionerState.Opening;

      // wait for the content to render
      this.content = await contentPromise;

      this.didRenderContent = this.defaultDidRenderContent;
    } else {
      this.shouldAnimate = false;
      this.state = PositionerState.Opening;
    }

    options.didRender?.();

    assert('Missing content', this.content);
    assert('Missing anchor. Did you forget {{p.registerAnchor}}?', this.anchor);

    let modifiers: Array<Partial<Modifier<unknown, unknown>>> = [];
    let placement = this.args.placement ?? 'top';
    let offsetDistance = this.args.offsetDistance ?? 7;

    /**
     * Ensures correct animation properties when `placement` changes after render.
     * A modifier whose function runs when Positioner updates.
     * https://popper.js.org/docs/v2/modifiers/
     */
    let placementUpdater: Partial<Modifier<unknown, unknown>> = {
      name: 'placementUpdater',
      enabled: true,
      phase: 'write',
      fn: ({ state }) => {
        if (state.placement.startsWith('top')) {
          this.transformStyles = TOP;
        } else if (state.placement.startsWith('right')) {
          this.transformStyles = RIGHT;
        } else if (state.placement.startsWith('bottom')) {
          this.transformStyles = BOTTOM;
        } else if (state.placement.startsWith('left')) {
          this.transformStyles = LEFT;
        }
      },
    };

    if (!this.args.hideArrow) {
      modifiers = [
        ...modifiers,
        {
          name: 'arrow',
          options: {
            padding: 10,
          },
        },
        {
          name: 'offset',
          options: {
            offset: [0, offsetDistance],
          },
        },
      ];
    }

    if (this.args.overflowBoundary) {
      let boundary = this.args.overflowBoundary;
      assert('boundary is an HTMLElement', boundary instanceof HTMLElement);
      modifiers = [
        ...modifiers,
        {
          name: 'preventOverflow',
          options: {
            boundary: boundary,
          },
        },
      ];
    }

    modifiers = [...modifiers, placementUpdater];

    this.instance = createPopper(this.anchor, this.content, {
      placement,
      modifiers,
    });

    let positionerContainer = this.content.querySelector(
      '.positioner-container'
    );
    assert('positionerContainer exists', positionerContainer);

    if (this.openDuration > 0 && this.shouldAnimate) {
      let animation = positionerContainer.animate(
        [{ opacity: 0, transform: this.transformStyles }, { opacity: 1 }],
        {
          duration: this.openDuration,
          easing: CUBIC_BEZIER,
        }
      );
      try {
        await animation.finished;
      } finally {
        animation.cancel();
      }
    }

    this.state = PositionerState.Opened;

    options.didOpen?.();
  });

  /**
   * Runs the positioner's closing animation and sets the `state` to `Closing`
   * during the animation. Sets the `state` to `Closed` once the animation
   * finishes and executes the optional `didClose` callback.
   */
  @task({ drop: true })
  private doClose = taskFor(async (options: CloseOptions): Promise<void> => {
    void this.doOpen.cancelAll();

    if (this.content) {
      this.state = PositionerState.Closing;

      let positionerContainer = this.content.querySelector(
        '.positioner-container'
      );
      assert('positionerContainer exists', positionerContainer);

      if (this.closeDuration > 0) {
        let animation = positionerContainer.animate(
          [{ opacity: 1 }, { opacity: 0, transform: this.transformStyles }],
          {
            duration: this.closeDuration,
            easing: CUBIC_BEZIER,
          }
        );
        try {
          await animation.finished;
        } finally {
          animation.cancel();
        }
      }

      this.state = PositionerState.Closed;
      this.content = null;
    } else {
      this.state = PositionerState.Closed;
    }

    options.didClose?.();
  });

  /**
   * Throws an error if `didRenderContent` is called when the positioner element
   * does not exist.
   */
  private defaultDidRenderContent(content: HTMLElement): void {
    throw new Error(
      `Called didRenderContent when state is ${this.state} with ${content.tagName}`
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Positioner: typeof Positioner;
  }
}
