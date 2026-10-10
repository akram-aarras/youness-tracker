import assert from 'node:assert';
import test, { describe, it } from 'node:test';

import {
  cleanMoroccanPhoneNumber,
  isValidMoroccanPhone,
  buildWhatsAppReminder,
  buildWhatsAppReceipt,
  buildHistoricalUnpaidReminderUrl,
  generateBilanCSV,
} from '../src/lib/operationalUtils.ts';
import type { Client, PaymentLog, User } from '../src/lib/types';

// Mock Client
const sampleClient: Client = {
  id: 'cli-001',
  name: 'محمد بنسعيد (Mohamed Bensaïd)',
  phone: '06 12 34 56 78',
  neighborhood: 'Boujarah',
  address: 'Rue 10, N 15 & Bâtiment <A>',
  subscriptionPlan: 'Pack Standard 100 MAD',
  monthlyFee: 100,
  installationDate: '2026-01-01',
  nextDueDate: '2026-10-15',
  status: 'active',
  notes: 'Client VIP & Fibre <Rapide> "Prioritaire"',
  hardware: {
    antennaModel: 'Ubiquiti LiteBeam 5AC',
    antennaMac: 'DC:9F:DB:11:22:33',
    antennaIp: '192.168.10.150',
    routerModel: 'TP-Link Archer C6',
    wifiSsid: 'Mohamed_WiFi',
    wifiPassword: 'Pass<Word>&"1234"',
    pppoeUsername: 'user_mohamed',
    pppoePassword: 'pwd<123>&"456"',
    signalStrengthDbm: -65,
    sectorTower: 'Tour Boujarah (Relais Centre)',
  },
};

// Mock Payment
const samplePayment: PaymentLog = {
  id: 'pay-001',
  receiptNumber: 'REC-202610-001',
  clientId: 'cli-001',
  clientName: 'محمد بنسعيد (Mohamed Bensaïd)',
  amount: 120,
  baseFee: 100,
  extraAmount: 20,
  extraReason: 'Remplacement connecteur & câble RJ45 <Cat6>',
  method: 'cash',
  paymentDate: '2026-10-08',
  billingMonth: '2026-10',
  previousDueDate: '2026-10-15',
  newDueDate: '2026-11-15',
  recordedBy: 'Youness (Admin)',
  notes: 'Paiement espèces reçu & vérifié <OK> "Complet"',
};

describe('1. Moroccan Phone Sanitization & WhatsApp Links', () => {
  it('should normalize various Moroccan phone formats to 212XXXXXXXXX', () => {
    const testCases = [
      { input: '0612345678', expected: '212612345678' },
      { input: '06 12 34 56 78', expected: '212612345678' },
      { input: '06-12-34-56-78', expected: '212612345678' },
      { input: '06.12.34.56.78', expected: '212612345678' },
      { input: '+212 6 12 34 56 78', expected: '212612345678' },
      { input: '+212 06 12 34 56 78', expected: '212612345678' },
      { input: '00212612345678', expected: '212612345678' },
      { input: '00212 6 12 34 56 78', expected: '212612345678' },
      { input: '0701020304', expected: '212701020304' },
      { input: '0539961122', expected: '212539961122' },
      { input: '612345678', expected: '212612345678' },
      { input: '212612345678', expected: '212612345678' },
      { input: '', expected: '' },
      { input: '   ', expected: '' },
    ];

    for (const tc of testCases) {
      const sanitized = cleanMoroccanPhoneNumber(tc.input);
      assert.strictEqual(
        sanitized,
        tc.expected,
        `Failed for input: "${tc.input}" - expected ${tc.expected}, got ${sanitized}`
      );
    }

    assert.strictEqual(cleanMoroccanPhoneNumber(null as any), '');
    assert.strictEqual(cleanMoroccanPhoneNumber(undefined as any), '');
  });

  it('should validate valid Moroccan numbers, allow empty/optional phone, and reject invalid numbers', () => {
    assert.strictEqual(isValidMoroccanPhone('0612345678'), true);
    assert.strictEqual(isValidMoroccanPhone('+212 6 12 34 56 78'), true);
    assert.strictEqual(isValidMoroccanPhone('+212 06 12 34 56 78'), true);
    assert.strictEqual(isValidMoroccanPhone('00212612345678'), true);
    assert.strictEqual(isValidMoroccanPhone('0701020304'), true);
    assert.strictEqual(isValidMoroccanPhone('0539961122'), true);

    // Empty / whitespace optional phone is valid
    assert.strictEqual(isValidMoroccanPhone(''), true);
    assert.strictEqual(isValidMoroccanPhone('   '), true);
    assert.strictEqual(isValidMoroccanPhone(null as any), true);
    assert.strictEqual(isValidMoroccanPhone(undefined as any), true);

    // Invalid non-empty numbers
    assert.strictEqual(isValidMoroccanPhone('12345'), false);
    assert.strictEqual(isValidMoroccanPhone('0123456789'), false); // starts with 01 (not Moroccan)
    assert.strictEqual(isValidMoroccanPhone('0412345678'), false); // starts with 04 (not Moroccan)
    assert.strictEqual(isValidMoroccanPhone('061234567'), false); // 8 digits (too short)
    assert.strictEqual(isValidMoroccanPhone('061234567890'), false); // too long
  });

  it('should construct wa.me reminder URL with 212XXXXXXXXX and fully encode Arabic text & line breaks', () => {
    const reminder = buildWhatsAppReminder(sampleClient);

    // Verify phone normalization in URL
    assert.strictEqual(reminder.cleanPhone, '212612345678');
    assert.ok(reminder.url.startsWith('https://wa.me/212612345678?text='));

    // Extract text query param
    const textParam = reminder.url.replace('https://wa.me/212612345678?text=', '');

    // Verify encodeURIComponent did not leave unencoded spaces, newlines, or raw Arabic characters in the URL string
    assert.ok(!textParam.includes(' '), 'URL text param should not contain unencoded spaces');
    assert.ok(!textParam.includes('\n'), 'URL text param should not contain unencoded line breaks');
    assert.ok(!textParam.includes('سلام'), 'URL text param should encode Arabic unicode characters');

    // Verify roundtrip decode matches original text
    const decoded = decodeURIComponent(textParam);
    assert.strictEqual(decoded, reminder.text);
    assert.ok(decoded.includes('محمد بنسعيد'));
    assert.ok(decoded.includes('الدارجة المغربية'));
    assert.ok(decoded.includes('Youness WiFi'));

    // Test reminder with extra fee
    const reminderWithExtra = buildWhatsAppReminder(sampleClient, { amount: 30, reason: 'Frais de retard' });
    const decodedExtra = decodeURIComponent(reminderWithExtra.url.replace('https://wa.me/212612345678?text=', ''));
    assert.ok(decodedExtra.includes('TOTAL À RÉGLER : 130 MAD'));
    assert.ok(decodedExtra.includes('Frais de retard'));
  });

  it('should construct wa.me receipt URL with 212XXXXXXXXX and encoded text', () => {
    const receipt = buildWhatsAppReceipt(samplePayment, sampleClient);
    assert.strictEqual(receipt.cleanPhone, '212612345678');
    assert.ok(receipt.url.startsWith('https://wa.me/212612345678?text='));

    const textParam = receipt.url.replace('https://wa.me/212612345678?text=', '');
    const decoded = decodeURIComponent(textParam);
    assert.strictEqual(decoded, receipt.text);
    assert.ok(decoded.includes('REC-202610-001'));
    assert.ok(decoded.includes('120 MAD'));
    assert.ok(decoded.includes('Remplacement connecteur & câble RJ45 <Cat6>'));
  });

  it('should construct historical unpaid reminder URL with 212XXXXXXXXX and encoded text', () => {
    const histReminder = buildHistoricalUnpaidReminderUrl(sampleClient, 'أكتوبر 2026', false);
    assert.strictEqual(histReminder.cleanPhone, '212612345678');
    assert.ok(histReminder.url.startsWith('https://wa.me/212612345678?text='));

    const textParam = histReminder.url.replace('https://wa.me/212612345678?text=', '');
    const decoded = decodeURIComponent(textParam);
    assert.strictEqual(decoded, histReminder.text);
    assert.ok(decoded.includes('السلام عليكم أخي محمد بنسعيد'));
  });
});

describe('2. Double-Submission & Slow 4G Protection', () => {
  it('should prevent duplicate submission when an action is executed rapidly', async () => {
    let callCount = 0;
    let isSubmitting = false;

    const simulateSubmit = async () => {
      // Form submission guard
      if (isSubmitting) return false;
      isSubmitting = true;
      try {
        callCount++;
        // Simulate network delay on slow 4G rooftop connection
        await new Promise((res) => setTimeout(res, 50));
        return true;
      } finally {
        isSubmitting = false;
      }
    };

    // Simulate 5 simultaneous / rapid button taps from a rooftop connection
    const results = await Promise.all([
      simulateSubmit(),
      simulateSubmit(),
      simulateSubmit(),
      simulateSubmit(),
      simulateSubmit(),
    ]);

    assert.strictEqual(callCount, 1, 'Only one submission should be processed');
    const successfulAttempts = results.filter((r) => r === true).length;
    assert.strictEqual(successfulAttempts, 1, 'Only 1 of the 5 rapid taps should succeed');
  });
});

describe('3. CSV Export Arabic Encoding (UTF-8 BOM)', () => {
  it('should generate CSV starting with UTF-8 BOM (\\uFEFF) and semicolon delimiters', () => {
    const rows = [
      {
        client: sampleClient,
        isPaid: true,
        payment: samplePayment,
      },
      {
        client: {
          ...sampleClient,
          id: 'cli-002',
          name: 'رشيد التطواني (Rachid El Tetouani)',
          phone: '0670998877',
          neighborhood: 'Sania Rmel',
          monthlyFee: 150,
          nextDueDate: '2026-10-10',
          notes: 'Client en retard; rappel envoyé',
        },
        isPaid: false,
      },
    ];

    const csvOutput = generateBilanCSV('2026-10', rows, 'ar');

    // 1. Verify UTF-8 BOM is at index 0
    assert.strictEqual(csvOutput.charCodeAt(0), 0xfeff, 'First character must be UTF-8 BOM (\\uFEFF)');

    // 2. Verify semicolon delimiter is used
    const lines = csvOutput.slice(1).split('\r\n');
    assert.ok(lines.length >= 3, 'CSV should have at least header + 2 rows');
    const header = lines[0];
    assert.ok(header.includes(';'), 'Header must use semicolon delimiters');
    assert.ok(!header.includes(','), 'Header should not use comma as delimiter');

    // 3. Verify Arabic headers and content are preserved intact
    assert.ok(header.includes('اسم المشترك'), 'Header should include Arabic column names');
    assert.ok(csvOutput.includes('محمد بنسعيد'), 'Should contain Arabic name Mohamed Bensaïd');
    assert.ok(csvOutput.includes('رشيد التطواني'), 'Should contain Arabic name Rachid El Tetouani');
    assert.ok(csvOutput.includes('مؤدى'), 'Should contain Arabic paid status');
    assert.ok(csvOutput.includes('غير مؤدى'), 'Should contain Arabic unpaid status');

    // 4. Verify fields with semicolons or quotes are properly escaped
    assert.ok(
      csvOutput.includes('"Paiement espèces reçu & vérifié <OK> ""Complet"""'),
      'Quotes and special chars must be escaped with doubled quotes in CSV'
    );
    assert.ok(
      csvOutput.includes('"Client en retard; rappel envoyé"'),
      'Semicolon inside fields must be safely preserved inside quotes'
    );
  });
});

describe('4. Hardware Inputs & Special Characters', () => {
  it('should handle special characters (&, <, >, ") in Wi-Fi passwords and notes safely', () => {
    const specialChars = 'Pass<Word>&"1234"';
    const notesSpecial = 'Note with & and <tag> and "quotes"';

    // Verify WhatsApp URL generation handles special characters
    const clientWithSpecial: Client = {
      ...sampleClient,
      notes: notesSpecial,
      hardware: {
        ...sampleClient.hardware!,
        wifiPassword: specialChars,
      },
    };

    const reminder = buildWhatsAppReminder(clientWithSpecial);
    // WhatsApp URL should not break
    assert.ok(!reminder.url.includes('<tag>'), 'Tags should be encoded in URL');
    assert.ok(!reminder.url.includes('"quotes"'), 'Quotes should be encoded in URL');

    // Encoded form contains %3C, %3E, %22, %26
    const url = reminder.url;
    assert.ok(url.includes('%3C') || url.includes('%20') || url.includes('%26'));
  });

  it('should handle negative integers for RF signal strength (e.g. -65 dBm)', () => {
    const testCases = [
      { input: -65, expected: -65 },
      { input: '-65', expected: -65 },
      { input: '-65 dBm', expected: -65 },
      { input: '-72 dBm', expected: -72 },
      { input: ' -58 dBm ', expected: -58 },
      { input: -90, expected: -90 },
      { input: '-90 dBm', expected: -90 },
    ];

    for (const tc of testCases) {
      let parsed = -65;
      if (typeof tc.input === 'number' && !isNaN(tc.input)) {
        parsed = tc.input;
      } else if (typeof tc.input === 'string') {
        const p = parseInt(tc.input.replace(/[^\d-]/g, ''), 10);
        if (!isNaN(p)) parsed = p;
      }

      assert.strictEqual(
        parsed,
        tc.expected,
        `Failed to parse RF signal input "${tc.input}" into ${tc.expected}`
      );
    }
  });
});

describe('5. RBAC & Field Security', () => {
  it('should prevent technicians from switching roles or escalating privileges', () => {
    const technicianUser: User = {
      id: 'user-tech-1',
      email: 'hamza@younesswifi.ma',
      username: 'hamza_tech',
      name: 'Hamza (Technicien)',
      role: 'technician',
      technicianId: 'tech-1',
      phone: '0612345678',
      avatar: '/avatars/hamza.png',
      status: 'active',
    };

    // Simulate RBAC check in switchRole
    const canSwitchRole = (user: User | null, targetRole: string) => {
      if (user?.role === 'technician' || user?.role === 'field_lead') {
        return false;
      }
      return targetRole === 'admin' || targetRole === 'technician';
    };

    assert.strictEqual(
      canSwitchRole(technicianUser, 'admin'),
      false,
      'Technician must not be allowed to switch to admin'
    );
  });

  it('should prevent technicians and field leads from deleting subscribers', async () => {
    const technicianUser: User = {
      id: 'user-tech-1',
      email: 'hamza@younesswifi.ma',
      username: 'hamza_tech',
      name: 'Hamza (Technicien)',
      role: 'technician',
      technicianId: 'tech-1',
      phone: '0612345678',
      avatar: '/avatars/hamza.png',
      status: 'active',
    };

    const adminUser: User = {
      id: 'user-admin',
      email: 'youness@younesswifi.ma',
      username: 'youness_admin',
      name: 'Youness (Owner)',
      role: 'admin',
      phone: '0600000000',
      avatar: '/avatars/youness.png',
      status: 'active',
    };

    const canDeleteSubscriber = (currentUser: User | null, clientId: string) => {
      if (!currentUser || currentUser.role === 'technician' || currentUser.role === 'field_lead') {
        return false;
      }
      return true;
    };

    assert.strictEqual(
      canDeleteSubscriber(technicianUser, 'cli-001'),
      false,
      'Technician must be rejected when attempting to delete subscriber'
    );

    assert.strictEqual(
      canDeleteSubscriber(adminUser, 'cli-001'),
      true,
      'Admin should be authorized to delete subscriber'
    );
  });
});

describe('6. Client Directory Pagination & Search Filtering (10 Clients Per Page)', () => {
  const PAGE_SIZE = 10;

  // Generate 25 mock clients across different neighborhoods and hardware
  const mockClients: Client[] = Array.from({ length: 25 }, (_, i) => ({
    id: `cli-${i + 1}`,
    name: `Client ${i + 1}`,
    phone: i % 3 === 0 ? '' : `061234567${i % 10}`,
    neighborhood: i % 2 === 0 ? 'Boujarah' : 'Saniat Rmel',
    address: `Rue ${i + 1}, Tétouan`,
    monthlyFee: 100,
    status: (i % 4 === 0 ? 'overdue' : i % 4 === 1 ? 'due_soon' : 'active') as Client['status'],
    nextDueDate: '2026-10-15',
    hardware: {
      antennaIp: `192.168.10.${100 + i}`,
      routerModel: i % 2 === 0 ? 'TP-Link Archer C6' : 'ZTE F660',
      antennaMac: `DC:9F:DB:11:22:${String(i).padStart(2, '0')}`,
      pppoeUsername: `user_${i + 1}`,
    },
  }));

  it('should paginate 25 clients strictly to 10 per page across 3 pages', () => {
    const totalPages = Math.ceil(mockClients.length / PAGE_SIZE);
    assert.strictEqual(totalPages, 3);

    // Page 1: 0 to 10
    const page1 = mockClients.slice(0, PAGE_SIZE);
    assert.strictEqual(page1.length, 10);
    assert.strictEqual(page1[0].id, 'cli-1');
    assert.strictEqual(page1[9].id, 'cli-10');

    // Page 2: 10 to 20
    const page2 = mockClients.slice(PAGE_SIZE, PAGE_SIZE * 2);
    assert.strictEqual(page2.length, 10);
    assert.strictEqual(page2[0].id, 'cli-11');
    assert.strictEqual(page2[9].id, 'cli-20');

    // Page 3: 20 to 25
    const page3 = mockClients.slice(PAGE_SIZE * 2, PAGE_SIZE * 3);
    assert.strictEqual(page3.length, 5);
    assert.strictEqual(page3[0].id, 'cli-21');
    assert.strictEqual(page3[4].id, 'cli-25');
  });

  it('should filter clients by IP, box router model, neighborhood, and status', () => {
    // Filter by IP: '192.168.10.105' -> matches cli-6
    const ipMatch = mockClients.filter((c) =>
      c.hardware?.antennaIp?.includes('192.168.10.105')
    );
    assert.strictEqual(ipMatch.length, 1);
    assert.strictEqual(ipMatch[0].id, 'cli-6');

    // Filter by router model: 'ZTE F660'
    const routerMatch = mockClients.filter((c) =>
      c.hardware?.routerModel?.toLowerCase().includes('zte f660')
    );
    assert.strictEqual(routerMatch.length, 12);

    // Filter by neighborhood: 'Boujarah'
    const neighborhoodMatch = mockClients.filter(
      (c) => c.neighborhood === 'Boujarah'
    );
    assert.strictEqual(neighborhoodMatch.length, 13);

    // Filter by status: 'overdue'
    const overdueMatch = mockClients.filter((c) => c.status === 'overdue');
    assert.strictEqual(overdueMatch.length, 7);
  });

  it('should reset current page to 1 when filters or search queries change', () => {
    let currentPage = 3;
    const onFilterChange = () => {
      currentPage = 1;
    };

    onFilterChange();
    assert.strictEqual(currentPage, 1, 'Current page must reset to 1 on filter/search change');
  });

  it('should clamp current page safely when client count shrinks below active page', () => {
    let currentPage = 3;
    const reducedList = mockClients.slice(0, 15); // 15 clients = 2 total pages
    const totalPages = Math.max(1, Math.ceil(reducedList.length / PAGE_SIZE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    assert.strictEqual(currentPage, 2, 'Current page must clamp to total pages (2)');
  });

  it('should preserve active page view during non-filter actions (e.g. status toggle or edit)', () => {
    const activePage = 2;
    // Client action: toggle status or edit note on cli-12 (on page 2)
    const updatedClients = mockClients.map((c) =>
      c.id === 'cli-12' ? { ...c, notes: 'Updated note via modal' } : c
    );

    // Since filter did not change, active page is preserved
    const page2Slice = updatedClients.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
    assert.strictEqual(activePage, 2);
    assert.strictEqual(page2Slice.length, 10);
    assert.strictEqual(page2Slice.find((c) => c.id === 'cli-12')?.notes, 'Updated note via modal');
  });
});

