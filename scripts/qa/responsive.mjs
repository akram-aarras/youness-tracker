import assert from 'node:assert/strict';
import path from 'node:path';
import { launch, seed, baseURL, artifacts, widths, reflow, accessibility, report } from './support.mjs';

const browser = await launch();
const results = [], a11y = [], errors = [];
async function inspect(page, name) {
  for (const width of widths) {
    await reflow(page, name, width);
    assert(await page.locator('.metric-grid > *').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth + 1)), `${name}: metric card overflow at ${width}px`);
    results.push({ name, width });
    if ([320, 375, 768, 1440].includes(width)) await page.screenshot({ path: path.join(artifacts, `${name}-${width}.png`), fullPage: !await page.locator('dialog[open]').count() });
    if ([320, 1440].includes(width)) a11y.push(await accessibility(page, `${name}-${width}`));
  }
}
async function dialog(page, name, open) {
  await page.setViewportSize({ width: 375, height: 900 });
  await open();
  await page.locator('dialog[open]').last().waitFor();
  await inspect(page, name);
  await page.keyboard.press('Escape');
  await page.locator('dialog[open]').waitFor({ state: 'detached' });
}
try {
  for (const language of ['fr', 'en', 'ar']) for (const theme of ['light', 'dark']) {
    const mode = `${language}-${theme}`;
    const { context, page } = await seed(browser, { language, theme });
    page.on('pageerror', error => errors.push({ mode, message: error.message }));
    assert.equal(await page.locator('html').getAttribute('dir'), language === 'ar' ? 'rtl' : 'ltr');
    assert.equal(await page.locator('html').evaluate(element => element.classList.contains('dark')), theme === 'dark');
    await inspect(page, `dashboard-${mode}`);
    await dialog(page, `registration-${mode}`, () => page.locator('.page-heading button').nth(1).click());
    await dialog(page, `payment-${mode}`, () => page.locator('.page-heading button').nth(0).click());
    await dialog(page, `new-ticket-${mode}`, () => page.locator('.page-heading button').nth(2).click());
    for (const [index, view] of [[1, 'directory'], [2, 'tickets'], [3, 'team']]) {
      await page.locator('.nav-item:visible').nth(index).click();
      await page.locator(`.${view}-view`).waitFor();
      await inspect(page, `${view}-${mode}`);
      if (view === 'directory') {
        await dialog(page, `subscriber-detail-${mode}`, () => page.getByRole('button', { name: 'Salma El Amrani', exact: true }).click());
        await dialog(page, `subscriber-edit-${mode}`, () => page.locator('.client-table button').filter({ has: page.locator('svg.lucide-pencil') }).first().click());
      }
      if (view === 'tickets') {
        await page.getByRole('button', { name: language === 'ar' ? 'قائمة' : language === 'en' ? 'List' : 'Liste', exact: true }).click();
        await inspect(page, `ticket-list-${mode}`);
      }
      if (view === 'team') await dialog(page, `add-member-${mode}`, () => page.locator('.page-heading button').click());
    }
    await dialog(page, `preferences-${mode}`, () => page.locator('.toolbar-actions > .icon-button').click());
    await page.goto(`${baseURL}/technician`);
    await page.locator('.field-workspace').waitFor();
    await inspect(page, `field-${mode}`);
    await context.close();
    const loginContext = await browser.newContext();
    await loginContext.addInitScript(({ language, theme }) => {
      localStorage.setItem('atlasnet_language', language);
      localStorage.setItem('theme', theme);
    }, { language, theme });
    const login = await loginContext.newPage();
    login.on('pageerror', error => errors.push({ mode, message: error.message }));
    await login.goto(`${baseURL}/login`);
    await login.locator('#login-identifier').waitFor();
    await inspect(login, `login-${mode}`);
    await loginContext.close();
    console.log(`Checked ${mode}: workspaces, ticket list, dialogs, and login at all eight widths.`);
  }
  report('responsive', { results, a11y, errors });
  assert.equal(errors.length, 0, JSON.stringify(errors));
  const violations = a11y.filter(result => result.violations.length);
  assert.equal(violations.length, 0, JSON.stringify(violations));
  console.log(`PASS: ${results.length} responsive states and ${a11y.length} accessibility scans.`);
} catch (error) {
  report('responsive', { results, a11y, errors, failure: error.message });
  throw error;
} finally {
  await browser.close();
}
