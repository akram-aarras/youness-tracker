import assert from 'node:assert/strict';
import { launch, seed, baseURL, widths, reflow, report } from './support.mjs';

const browser = await launch();
const checks = [], errors = [];
try {
  const { context, page } = await seed(browser, { empty: true });
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 375]) {
    await reflow(page, 'empty dashboard', width);
    for (const [card, key, view] of [[0, 'Enter', 'directory'], [3, 'Space', 'tickets']]) {
      const target = page.locator('.metric-grid > *').nth(card);
      await page.keyboard.press('Tab');
      await target.focus();
      assert.notEqual(await target.evaluate(element => getComputedStyle(element).outlineStyle), 'none');
      await page.keyboard.press(key);
      await page.locator(`.${view}-view`).waitFor();
      await page.locator('.nav-item:visible').nth(0).click();
      await page.locator('.dashboard-view').waitFor();
    }
    await page.keyboard.press('Control+k');
    await page.locator('#client-directory-search-input').waitFor();
    await page.waitForFunction(() => document.activeElement?.id === 'client-directory-search-input');
    assert(await page.locator('#client-directory-search-input').evaluate(element => element === document.activeElement));
    assert.equal(await page.locator('.client-table').count(), 0);
    await page.locator('.nav-item:visible').nth(0).click();
    const trigger = page.locator('.page-heading button').nth(1);
    await trigger.click();
    await page.locator('dialog[open]').waitFor();
    await page.keyboard.press('Control+k');
    assert.equal(await page.locator('.dashboard-view').count(), 1, 'Global shortcut switched screens behind a dialog');
    for (const key of ['Tab', 'Shift+Tab']) for (let i = 0; i < 25; i++) {
      await page.keyboard.press(key);
      assert(await page.evaluate(() => Boolean(document.activeElement.closest('dialog[open]'))), 'Focus escaped dialog');
    }
    await page.keyboard.press('Escape');
    await page.locator('dialog[open]').waitFor({ state: 'detached' });
    assert(await trigger.evaluate(element => element === document.activeElement), 'Dialog did not restore trigger focus');
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    checks.push(`Metric Enter/Space, Ctrl+K, modal isolation, focus trap/restoration at ${width}px`);
  }
  await page.keyboard.press('Meta+k');
  await page.waitForFunction(() => document.activeElement?.id === 'client-directory-search-input');
  assert(await page.locator('#client-directory-search-input').evaluate(element => element === document.activeElement));
  checks.push('Cmd+K');
  await page.goto(`${baseURL}/qa-page-not-found`);
  await page.getByRole('heading', { name: 'Page introuvable', exact: true }).waitFor();
  checks.push('Authenticated 404');
  await context.close();

  const setupContext = await browser.newContext();
  await setupContext.addInitScript(() => localStorage.setItem('youness_wisp_users', JSON.stringify([{ id: 'qa-tech', name: 'QA Technician', username: 'qa-tech', email: 'qa@example.test', role: 'technician', status: 'active' }])));
  const setup = await setupContext.newPage();
  await setup.goto(`${baseURL}/login`);
  await setup.locator('#setup-name').waitFor();
  for (const width of widths) await reflow(setup, 'owner setup', width);
  await setup.locator('#setup-password').fill('secret123');
  await setup.locator('#setup-confirm').fill('different');
  await setup.getByRole('button', { name: 'Créer mon espace', exact: true }).click();
  await setup.locator('#login-error').waitFor();
  await setup.getByRole('button', { name: 'EN', exact: true }).click();
  await setup.getByRole('heading', { name: 'Make yourself at home.', exact: true }).waitFor();
  checks.push('Setup eight widths, password mismatch, and English setup');
  await setupContext.close();

  const technician = await seed(browser, { role: 'technician' });
  await technician.page.goto(`${baseURL}/`);
  await technician.page.waitForURL(`${baseURL}/technician`);
  await technician.page.locator('.field-workspace').waitFor();
  assert.equal(await technician.page.getByText('TKT-QA-002', { exact: true }).count(), 0, 'Technician saw another technician’s ticket');
  await technician.page.goto(`${baseURL}/login`);
  await technician.page.waitForURL(`${baseURL}/technician`);
  checks.push('Technician login and role redirects; assigned-ticket isolation');
  await technician.context.close();

  const anonymous = await browser.newContext();
  const login = await anonymous.newPage();
  await login.goto(`${baseURL}/`);
  await login.waitForURL(`${baseURL}/login`);
  await login.goto(`${baseURL}/technician`);
  assert.equal(new URL(login.url()).pathname, '/login');
  checks.push('Unauthenticated route redirects');
  await anonymous.close();
  assert.equal(errors.length, 0, JSON.stringify(errors));
  report('keyboard-auth', { checks, errors });
  console.log(`PASS: ${checks.length} keyboard, empty-state, setup, and role checks.`);
} catch (error) {
  report('keyboard-auth', { checks, errors, failure: error.message });
  throw error;
} finally {
  await browser.close();
}
