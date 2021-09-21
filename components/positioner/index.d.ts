import Component from '@glint/environment-ember-loose/glimmer-component';
import { Placement } from '@popperjs/core';
import { PositionerContentSignature } from './content';
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
         * How far along the `anchor` element to offset the positioner.
         * Defaults to 0 to offset the positioner 0px along the `anchor`.
         * https://popper.js.org/docs/v2/modifiers/offset/#skidding
         */
        offsetSkidding?: number;
        /**
         * How far away from the `anchor` element to offset the positioner.
         * Defaults to 7 to offset the positioner 7px away from the `anchor`.
         * https://popper.js.org/docs/v2/modifiers/offset/#distance
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
    toggle(event?: Event): void;
    open(event?: Event): void;
    open(options: OpenOptions): void;
    close(event?: Event): void;
    close(options: CloseOptions): void;
    update(): void;
    registerAnchor: (target: HTMLElement) => void;
}
export default class Positioner extends Component<PositionerSignature> implements PositionerAPI {
    /** Instance created by createPositioner */
    private instance;
    /**
     * The element to which you want to anchor the positioner's content.
     */
    anchor: HTMLElement | null;
    /**
     * The positioner's content.
     */
    private content;
    /**
     * The current state of the positioner. Options are 'opening', 'opened',
     * 'closing', and 'closed'.
     * Defaults to `closed`.
     */
    private state;
    /**
     * Position-based transform styles for animations
     */
    private transformStyles;
    /**
     * Whether to animate the positioner.
     * False if the positioner instance is already open.
     */
    private shouldAnimate;
    /**
     * Registers the <Positioner::Content> component when it's inserted in the DOM.
     */
    protected didRenderContent: (content: HTMLElement) => void;
    /**
     * The alternate parent containing element for the positioner.
     */
    protected get altContainer(): HTMLElement;
    /**
     * Whether to use the `altContainer` element as the container.
     * Defaults to true.
     */
    protected get inline(): boolean;
    /**
     * Use with the `did-insert` modifier to register the `anchor` to which you
     * want to attach the positioner element.
     */
    registerAnchor(el: HTMLElement): void;
    /**
     * Whether or not to allow a delay when testing.
     * Used to test transitional states of `isOpening` and `isClosing`.
     */
    private get allowDelay();
    /**
     * The amount of time in ms to transition between the Positioner's `Opening` and
     * `Opened` states.
     * Set to 0 in tests, unless `allowDelay` is true.
     */
    private get openDuration();
    /**
     * The amount of time in ms to transition between the Positioner's `Closing` and
     * `Closed` states.
     * Set to 0 in tests, unless `allowDelay` is true.
     */
    private get closeDuration();
    /**
     * Whether the positioner is in the `Opening` state.
     */
    get isOpening(): boolean;
    /**
     * Whether the positioner is in the `Opened` state.
     */
    get isOpened(): boolean;
    /**
     * Whether the positioner is in the `Closing` state.
     */
    get isClosing(): boolean;
    /**
     * Whether the positioner is in the `Closed` state.
     */
    get isClosed(): boolean;
    /**
     * Whether the positioner is in the `Opening` or `Opened` state.
     * Used to manage state for assistive technologies that have no reason to wait
     * for animation transitions in the UI.
     */
    get isShown(): boolean;
    /**
     * Whether the positioner is in the `Closing` or `Closed` state.
     * Used to manage state for assistive technologies that have no reason to wait
     * for animation transitions in the UI.
     */
    get isHidden(): boolean;
    /**
     * Calls the `open` and `close` actions to switch between the two states.
     */
    toggle(): void;
    /**
     * Sets the options to pass to the `doOpen` task and calls it with those
     * options.
     * Can be passed to the "on" modifier directly, in which case we will recieve
     * the `Event`, or can be called with an options object using the `(fn)`
     * helper, or from JS code.
     */
    open(maybeOptions?: OpenOptions | Event): void;
    /**
     * Sets the options to pass to the `doClose` task and calls it with those
     * options.
     * Can be called with the "on" modifier in the template and passed an Event.
     */
    close(maybeOptions?: CloseOptions | Event): void;
    /**
     * Recompute the positioner's position. This is especially useful if the content
     * of the positioner changes after initial render.
     */
    update(): void;
    /**
     * Creates a positioner instance with this component's yielded content block,
     * positions it, and runs the opening animation.
     * Sets the positioner `state` to `Opening` during animation and executes the
     * optional `didRender` callback while in this state.
     * Sets the positioner `state` to `Opened` when the task is finished and
     * immediately executes the optional `didOpen` callback.
     */
    private doOpen;
    /**
     * Runs the positioner's closing animation and sets the `state` to `Closing`
     * during the animation. Sets the `state` to `Closed` once the animation
     * finishes and executes the optional `didClose` callback.
     */
    private doClose;
    /**
     * Throws an error if `didRenderContent` is called when the positioner element
     * does not exist.
     */
    private defaultDidRenderContent;
}
declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Positioner: typeof Positioner;
    }
}
