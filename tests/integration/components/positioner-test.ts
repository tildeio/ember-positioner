import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | positioner', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Positioner>
        <:trigger as |p|>
          <button class="trigger" type="button"
            {{on 'click' p.toggle}}
            {{did-insert p.registerAnchor}}
          >
            Click me!
          </button>
        </:trigger>
        <:content>
          Hello world
        </:content>
      </Positioner>
    `);

    assert.dom('.trigger').exists();
    assert.dom().doesNotContainText('Hello world');

    await click('.trigger');
    assert.dom('.trigger').exists();
    assert.dom().containsText('Hello world');

    await click('.trigger');
    assert.dom('.trigger').exists();
    assert.dom().doesNotContainText('Hello world');
  });

  test('the content block has access to the positioner API', async function (assert) {
    await render(hbs`
      <Positioner>
        <:trigger as |p|>
          <button class="trigger" type="button"
            {{on 'click' p.toggle}}
            {{did-insert p.registerAnchor}}
          >
            Click me!
          </button>
        </:trigger>
        <:content as |p|>
          <button class="close" type="button" {{on 'click' p.close}}>Close</button>
        </:content>
      </Positioner>
    `);

    assert.dom('.close').doesNotExist();

    await click('.trigger');
    assert.dom('.close').exists();

    await click('.close');
    assert.dom('.close').doesNotExist();
  });

  test('the positioner API provides info about the state of the component', async function (assert) {
    let didRenderCount = 0;

    let fullyOpened = new Promise((resolve) => {
      this.set('openOptions', {
        didOpen: resolve,
        didRender() {
          didRenderCount++;
          assert.dom('.is-opening').containsText('true');
          assert.dom('.is-opened').containsText('false');
          assert.dom('.is-closing').containsText('false');
          assert.dom('.is-closed').containsText('false');
          assert.dom('.is-shown').containsText('true');
          assert.dom('.is-hidden').containsText('false');
        },
      });
    });

    let fullyClosed = new Promise((resolve) => {
      this.set('closeOptions', { didClose: resolve });
    });

    await render(hbs`
      <Positioner @_allowTestDelay={{true}} @openDuration={{1000}} @closeDuration={{1000}}>
        <:trigger as |p|>
          <div class="is-opening">
            isOpening: {{p.isOpening}}
          </div>
          <div class="is-opened">
            isOpened: {{p.isOpened}}
          </div>
          <div class="is-closing">
            isClosing: {{p.isClosing}}
          </div>
          <div class="is-closed">
            isClosed: {{p.isClosed}}
          </div>
          <div class="is-shown">
            isShown: {{p.isShown}}
          </div>
          <div class="is-hidden">
            isHidden: {{p.isHidden}}
          </div>
          <button class="open" type="button"
            {{on 'click' (fn p.open this.openOptions)}}
            {{did-insert p.registerAnchor}}
          >
            Open
          </button>
          <button class="close {{if p.isClosing "red"}}" type="button"
            {{on 'click' (fn p.close this.closeOptions)}}
          >
            Close
          </button>
        </:trigger>
        <:content>
          Content
        </:content>
      </Positioner>
    `);

    assert.strictEqual(
      didRenderCount,
      0,
      'it has not called the didRender callback'
    );
    assert.dom('.is-opening').containsText('false');
    assert.dom('.is-opened').containsText('false');
    assert.dom('.is-closing').containsText('false');
    assert.dom('.is-closed').containsText('true');
    assert.dom('.is-shown').containsText('false');
    assert.dom('.is-hidden').containsText('true');

    await click('.open');

    assert.strictEqual(didRenderCount, 1, 'it called the didRender callback');
    assert.dom('.is-opening').containsText('true');
    assert.dom('.is-opened').containsText('false');
    assert.dom('.is-closing').containsText('false');
    assert.dom('.is-closed').containsText('false');
    assert.dom('.is-shown').containsText('true');
    assert.dom('.is-hidden').containsText('false');

    await fullyOpened;

    assert.strictEqual(didRenderCount, 1);
    assert.dom('.is-opening').containsText('false');
    assert.dom('.is-opened').containsText('true');
    assert.dom('.is-closing').containsText('false');
    assert.dom('.is-closed').containsText('false');
    assert.dom('.is-shown').containsText('true');
    assert.dom('.is-hidden').containsText('false');

    await click('.close');

    assert.strictEqual(didRenderCount, 1);
    assert.dom('.is-opening').containsText('false');
    assert.dom('.is-opened').containsText('false');
    assert.dom('.is-closing').containsText('true');
    assert.dom('.is-closed').containsText('false');
    assert.dom('.is-shown').containsText('false');
    assert.dom('.is-hidden').containsText('true');

    await fullyClosed;

    assert.strictEqual(didRenderCount, 1);
    assert.dom('.is-opening').containsText('false');
    assert.dom('.is-opened').containsText('false');
    assert.dom('.is-closing').containsText('false');
    assert.dom('.is-closed').containsText('true');
    assert.dom('.is-shown').containsText('false');
    assert.dom('.is-hidden').containsText('true');
  });

  test('it uses the `.ember-application` element as the container when the `inline` argument is false', async function (assert) {
    await render(hbs`
      <Positioner @inline={{false}}>
        <:trigger as |p|>
          <button class="trigger" type="button"
            {{on 'click' p.toggle}}
            {{did-insert p.registerAnchor}}
          >
            Click me!
          </button>
        </:trigger>
        <:content>
          Nothing to see here
        </:content>
      </Positioner>
    `);

    await click('.trigger');

    assert.dom('.ember-application > .positioner').exists();
  });
});
