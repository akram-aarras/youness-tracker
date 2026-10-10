import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';

export const baseURL = process.env.QA_BASE_URL || 'http://localhost:3001';
assert(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname), 'QA must target a local server');
export const artifacts = path.resolve('.qa-artifacts');
fs.mkdirSync(artifacts, { recursive: true });
export const widths = [320, 375, 430, 768, 1024, 1280, 1440, 1920];
const require = createRequire(import.meta.url);

export async function launch() {
  let executablePath = process.env.QA_CHROMIUM_PATH;
  const cache = process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright');
  if (!executablePath && cache && fs.existsSync(cache)) {
    executablePath = fs.readdirSync(cache).filter(name => /^chromium-\d+$/.test(name))
      .sort().reverse().map(name => path.join(cache, name, 'chrome-win64', 'chrome.exe')).find(fs.existsSync);
  }
  return chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
}

export function fixtures() {
  const now = new Date();
  const date = offset => new Date(now.getTime() + offset * 86400000).toISOString().slice(0, 10);
  const today = date(0), due = date(40), late = date(-15);
  const clients = [
    { id: 'qa-client-1', name: 'Salma El Amrani', phone: '0661234567', neighborhood: 'Wilaya', address: 'Avenue Mohammed V, Tétouan', status: 'active', monthlyFee: 100, subscriptionPlan: 'Pack Standard 100 MAD', nextDueDate: due, installationDate: date(-90), hardware: { antennaModel: 'Ubiquiti LiteBeam 5AC', pppoeUsername: 'salma_amrani', antennaIp: '192.168.10.150', antennaMac: 'AA:BB:CC:DD:EE:FF', signalStrengthDbm: -64 } },
    { id: 'qa-client-2', name: 'Mohamed Benali', phone: '0672345678', neighborhood: 'Boujarah', address: 'Rue Al Amal, étage 2', status: 'overdue', monthlyFee: 50, subscriptionPlan: 'Pack Éco 50 MAD', nextDueDate: late, installationDate: date(-120), hardware: { antennaModel: 'MikroTik SXTsq 5 ac', pppoeUsername: 'mohamed_benali', signalStrengthDbm: -73 } },
  ];
  const tickets = [
    { id: 'qa-ticket-1', ticketNumber: 'TKT-QA-001', clientId: clients[1].id, clientName: clients[1].name, clientPhone: clients[1].phone, clientNeighborhood: 'Boujarah', clientAddress: clients[1].address, category: 'weak_signal', priority: 'urgent', status: 'open', assignedToTechnicianId: 'tech-1', assignedTechnicianName: 'Yassine El Idrissi', description: 'Connexion intermittente. Vérifier l’alignement de l’antenne et le câblage.', createdAt: today },
    { id: 'qa-ticket-2', ticketNumber: 'TKT-QA-002', clientId: clients[0].id, clientName: clients[0].name, clientPhone: clients[0].phone, clientNeighborhood: 'Wilaya', category: 'router_config', priority: 'normal', status: 'in_progress', assignedToTechnicianId: 'tech-2', assignedTechnicianName: 'Omar Bencheikh', description: 'Configurer le nouveau routeur Wi-Fi.', createdAt: today },
  ];
  const payments = [{ id: 'qa-pay-1', receiptNumber: 'REC-QA-0001', clientId: clients[0].id, clientName: clients[0].name, amount: 100, baseFee: 100, extraAmount: 0, method: 'cash', paymentDate: today, billingMonth: today.slice(0, 7), previousDueDate: today, newDueDate: due, recordedBy: 'Youness' }];
  return { clients, tickets, payments };
}

export async function seed(browser, { empty = false, language = 'fr', theme = 'light', role = 'admin' } = {}) {
  const context = await browser.newContext({ viewport: { width: 375, height: 900 } });
  context.setDefaultTimeout(15000);
  await context.route(/supabase\.(co|in)/, route => route.abort());
  const page = await context.newPage();
  await page.goto(`${baseURL}/login`);
  await page.locator('#login-identifier').fill(role === 'admin' ? 'youness' : 'yassine');
  await page.locator('#login-password').fill(role === 'admin' ? 'Admin123!' : 'Tech123!');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.waitForURL(`${baseURL}/${role === 'admin' ? '' : 'technician'}`);
  await page.locator(role === 'admin' ? '.dashboard-view' : '.field-workspace').waitFor();
  await page.evaluate(({ data, language, theme }) => {
    for (const key of ['clients', 'tickets', 'payments']) localStorage.setItem(`youness_wisp_${key}`, JSON.stringify(data[key]));
    localStorage.setItem('atlasnet_language', language);
    localStorage.setItem('theme', theme);
  }, { data: empty ? { clients: [], tickets: [], payments: [] } : fixtures(), language, theme });
  await page.reload();
  await page.locator(role === 'admin' ? '.dashboard-view' : '.field-workspace').waitFor();
  return { context, page };
}

export async function accessibility(page, name) {
  if (!await page.evaluate(() => Boolean(window.axe))) await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }));
  return { name, violations: result.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, targets: nodes.map(node => node.target) })) };
}

export async function reflow(page, name, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.evaluate(() => document.fonts.ready);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: page overflow at ${width}px`);
  const dialog = page.locator('dialog[open]').last();
  if (await dialog.count()) {
    const bounds = await dialog.boundingBox();
    assert(bounds && bounds.width <= width + 1, `${name}: dialog overflow at ${width}px`);
    assert(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${name}: dialog content overflow at ${width}px`);
  }
}

export function report(name, data) {
  fs.writeFileSync(path.join(artifacts, `${name}.json`), JSON.stringify({ date: new Date().toISOString(), baseURL, ...data }, null, 2));
}
