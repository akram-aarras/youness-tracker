import assert from 'node:assert/strict';
import path from 'node:path';
import { launch, seed, artifacts, widths, reflow, accessibility, report } from './support.mjs';

const browser = await launch();
const results = [], a11y = [], errors = [];
async function inspect(page, name) {
  for (const width of widths) {
    await reflow(page, name, width);
    results.push({ name, width });
    if (width === 320) await page.screenshot({ path: path.join(artifacts, `${name}-320.png`) });
    if ([320, 1440].includes(width)) a11y.push(await accessibility(page, `${name}-${width}`));
  }
}
try {
  for (const language of ['fr', 'en', 'ar']) for (const theme of ['light', 'dark']) {
    const mode = `${language}-${theme}`;
    const { context, page } = await seed(browser, { language, theme });
    page.on('pageerror', error => errors.push({ mode, message: error.message }));
    await page.locator('.page-heading button').nth(1).click();
    await page.locator('dialog[open]').waitFor();
    await page.locator('#RegisterClientModal-field-0').fill('QA Subscriber');
    await page.locator('#RegisterClientModal-field-1').fill('0663456789');
    for (const [index, tab] of [[1, 'hardware'], [2, 'billing']]) {
      await page.locator('dialog button[aria-pressed]').nth(index).click();
      await inspect(page, `registration-${tab}-${mode}`);
    }
    await page.keyboard.press('Escape');
    await page.locator('dialog[open]').waitFor({ state: 'detached' });
    await page.locator('.nav-item:visible').nth(1).click();
    await page.locator('.directory-view').waitFor();
    await page.locator('.client-table button').filter({ has: page.locator('svg.lucide-pencil') }).first().click();
    await page.locator('dialog[open]').waitFor();
    for (const [index, tab] of [[1, 'billing'], [2, 'hardware']]) {
      await page.locator('dialog button[aria-pressed]').nth(index).click();
      await inspect(page, `edit-${tab}-${mode}`);
    }
    await page.keyboard.press('Escape');
    await context.close();
    console.log(`Checked form tabs for ${mode} at all eight widths.`);
  }
  report('forms', { results, a11y, errors });
  assert.equal(errors.length, 0, JSON.stringify(errors));
  const violations = a11y.filter(result => result.violations.length);
  assert.equal(violations.length, 0, JSON.stringify(violations));
  console.log(`PASS: ${results.length} form states and ${a11y.length} accessibility scans.`);
} catch (error) {
  report('forms', { results, a11y, errors, failure: error.message });
  throw error;
} finally {
  await browser.close();
}
