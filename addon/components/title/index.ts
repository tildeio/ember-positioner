import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import Component from '@glint/environment-ember-loose/glimmer-component';
import Ember from 'ember';
import { assert } from '@ember/debug';

import { task, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

import { PositionerAPI, PositionerSignature } from '../positioner';

/**
 * Determines if the provided parent element contains any focusable elements.
 */
function containsFocusableElements(element: Element): boolean {
  return [
    ...element.querySelectorAll(
      'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    ),
  ].some((el) => !el.hasAttribute('disabled'));
}

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
  private readonly guid = guidFor(this);
  @tracked private anchor?: HTMLElement;

  protected get titleId(): string {
    return `${this.guid}-title`;
  }

  protected get enabled(): boolean {
    return this.args.enabled ?? true;
  }

  protected get anchorIsFocusable(): boolean {
    if (this.anchor) {
      return containsFocusableElements(this.anchor);
    } else {
      return false;
    }
  }

  @action protected registerAnchor(
    p: PositionerAPI,
    anchor: HTMLElement
  ): void {
    p.registerAnchor(anchor);
    this.anchor = anchor;
  }

  @action protected onKeydown(p: PositionerAPI, e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      p.close();
    }
  }

  @action protected onFocusin(p: PositionerAPI, e: FocusEvent): void {
    assert('target is an Element', e.target instanceof Element);
    assert('anchor exists', this.anchor);
    if (!this.anchor.contains(e.target)) {
      p.close();
    }
  }

  @task({ drop: true }) protected didMouseenterTrigger = taskFor(
    async (p: PositionerAPI): Promise<void> => {
      await timeout(Ember.testing ? 0 : this.args.openDelay ?? 400);
      p.open();
    }
  );

  @action protected closeTitle(p: PositionerAPI): void {
    void this.didMouseenterTrigger.cancelAll();
    p.close();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Title: typeof Title;
  }
}
