import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { triggerEvent, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { find, click } from '@ember/test-helpers';
import triggerKeyEvent from '@ember/test-helpers/dom/trigger-key-event';

function getTitleId(triggerSelector = '[data-test-title-trigger]'): string {
  let trigger = find(triggerSelector);
  if (!trigger) {
    throw new Error('no trigger found');
  }
  let labelledby = trigger.getAttribute('aria-labelledby');
  if (!labelledby) {
    throw new Error('no aria-labelledby attribute set');
  }
  return `#${labelledby}`;
}

module('Integration | Component | title', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with mouse events', async function (assert) {
    await render(hbs`
      <Title @text="Hello">
        Hover me to show title!
      </Title>
    `);

    let triggerSelector = '[data-test-title-trigger]';
    let titleId = getTitleId(triggerSelector);

    assert.dom(triggerSelector).hasText('Hover me to show title!');
    assert.dom(titleId).doesNotExist('Title is not visible');

    await triggerEvent(triggerSelector, 'mouseenter');

    assert.dom(titleId).hasText('Hello', 'Title is now visible');
    assert.dom(titleId).hasAria('hidden', 'false');

    await triggerEvent(triggerSelector, 'mouseleave');

    assert.dom(titleId).doesNotExist('Title is not visible');
  });

  test('it renders with focus events', async function (assert) {
    await render(hbs`
      <Title @text="Hello">
        Focus me to show title!
      </Title>
      <a href="#" id="something-else">Focus me next.</a>
    `);

    let triggerSelector = '[data-test-title-trigger]';
    let titleId = getTitleId(triggerSelector);

    assert.dom(triggerSelector).hasText('Focus me to show title!');
    assert.dom(titleId).doesNotExist('Title is not visible');

    await triggerEvent(triggerSelector, 'focusin');

    assert.dom(titleId).hasText('Hello', 'Title is now visible');
    assert.dom(titleId).hasAria('hidden', 'false');

    await triggerEvent('#something-else', 'focusin');

    assert.dom(titleId).doesNotExist('Title is not visible');
  });

  test('it ignores clicks', async function (assert) {
    await render(hbs`
      <Title @text="Hello">
        Focus me to show title!
      </Title>
      <a href="#" id="something-else">Focus me next.</a>
    `);

    let triggerSelector = '[data-test-title-trigger]';
    let titleId = getTitleId(triggerSelector);

    assert.dom(triggerSelector).hasText('Focus me to show title!');
    assert.dom(titleId).doesNotExist('Title is not visible');


    await click(triggerSelector);
    assert.dom(titleId).doesNotExist('Title is still not visible');

    await click('#something-else');
    await triggerEvent(triggerSelector, 'focusin');
    assert.dom(titleId).hasText('Hello', 'Title is now visible');
  });

  test('it uses the bubbled focus event when the anchor block is focusable', async function (assert) {
    await render(hbs`
        <Title @text="Hello">
          <a href="#" id="focusable">Focus me to show title!</a>
        </Title>
        <a href="#" id="something-else">Focus me next.</a>
      `);

    let triggerSelector = '[data-test-title-trigger]';
    let titleId = getTitleId(triggerSelector);

    assert.dom(triggerSelector).hasText('Focus me to show title!');
    assert
      .dom(triggerSelector)
      .doesNotHaveAttribute(
        'tabindex',
        'HTML validity check: should not nest focusable element inside tabindex'
      );
    assert.dom(titleId).doesNotExist('Title is not visible');

    await triggerEvent('#focusable', 'focusin');

    assert.dom(titleId).hasText('Hello', 'Title is now visible');

    await triggerEvent('#something-else', 'focusin');

    assert.dom(titleId).doesNotExist('Title is not visible');
  });

  test('it is dismissible with escape key', async function (assert) {
    await render(hbs`
      <Title @text="Hello">
        Focus me to show title!
      </Title>
    `);

    let triggerSelector = '[data-test-title-trigger]';
    let titleId = getTitleId(triggerSelector);

    await triggerEvent(triggerSelector, 'focusin');

    assert.dom(titleId).hasText('Hello', '(setup) Title is now visible');

    await triggerKeyEvent(triggerSelector, 'keydown', 'Escape');

    assert.dom(titleId).doesNotExist('Title is not visible');
  });

  test('it can be disabled', async function (assert) {
    await render(hbs`
      <Title @text="Hello" @enabled={{false}}>
        Hover me to show title!
      </Title>
    `);

    assert.dom('[data-test-title-trigger]').doesNotExist();
  });
});
