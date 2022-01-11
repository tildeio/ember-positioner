import Component from '@glint/environment-ember-loose/glimmer-component';
import { PositionerAPI, PositionerSignature } from '../positioner';
export interface TitleSignature {
    Element: HTMLDivElement;
    Args: {
        /** The text content for the title tooltip. */
        text: string;
        /**
         * By default, the Title is assumed to be enabled. If you wish to
         * conditionally disable the Title, you can pass a boolean to `@enabled`.
         * When disabled, the Title will not appear.
         */
        enabled?: boolean;
        placement?: PositionerSignature['Args']['placement'];
        overflowBoundary?: PositionerSignature['Args']['overflowBoundary'];
        openDuration?: number;
        closeDuration?: number;
        openDelay?: number;
        inline?: boolean;
    };
    Yields: {
        default: [];
    };
}
/**
 * This component is intended as a customizable and more accessible alternative
 * to the `title` attribute.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title#accessibility_concerns
 *
 * This component yields two blocks:
 * - The `anchor` block should contain the content for which you want to add
 *   the title information. The tooltip will "point" at this content. Hovering
 *   or focusing on this content will open the tooltip. (NOTE: Should the
 *   `anchor` content contain focusable elements, we will use the bubbled events
 *   from those elements rather than making the `anchor` block focusable.)
 * - The `content` block should contain the content for the Title.
 *
 * @example
 * ```hbs
 * <Title @text="More info!"">
 *   Hover me for more info.
 * </Title>
 * ```
 *
 * You can optionally disable the Title component by passing
 * `@enabled={{false}}`. In this case, we would render the `anchor` block, but
 * the tooltip interactivity will be disabled.
 */
export default class Title extends Component<TitleSignature> {
    private readonly guid;
    private anchor?;
    private focusEventIsClick;
    protected get titleId(): string;
    protected get enabled(): boolean;
    protected get anchorIsFocusable(): boolean;
    protected registerAnchor(p: PositionerAPI, anchor: HTMLElement): void;
    protected onKeydown(p: PositionerAPI, e: KeyboardEvent): void;
    /**
     * Mousedown handler for the title anchor.
     * Tells `onTriggerFocusin` to ignore clicks.
     */
    handleMousedown(): void;
    protected onTriggerFocusin(p: PositionerAPI): void;
    protected onFocusin(p: PositionerAPI, e: FocusEvent): void;
    protected didMouseenterTrigger: import("ember-concurrency").TaskForAsyncTaskFunction<(p: PositionerAPI) => Promise<void>>;
    protected closeTitle(p: PositionerAPI): void;
}
declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Title: typeof Title;
    }
}
