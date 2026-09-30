import { test, expect } from '@playwright/test';
import { config } from 'dotenv';
config();
const password = process.env.SEED_PASSWORD!;
async function login(page: any, path: string, id: string, label: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(label, { exact: true }).fill(id);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in →', exact: true }).click();
  await expect
    .poll(async () =>
      (await page.context().cookies('http://localhost:4000')).some(
        (cookie) => cookie.name === 'suraksha_access',
      ),
    )
    .toBe(true);
}
test('shared case crosses mobile API contract, Admin browser, Police browser and user tracker API', async ({
  browser,
  request,
}) => {
  const userLogin = await request.post('http://127.0.0.1:4000/v1/auth/login', {
    data: { login: '200012345678', password },
  });
  expect(userLogin.ok()).toBeTruthy();
  const headers = { Authorization: 'Bearer ' + (await userLogin.json()).accessToken };
  const report = await request.post('http://127.0.0.1:4000/v1/reports', {
    headers,
    data: {
      category: 'CYBER_HARASSMENT',
      occurredAt: new Date().toISOString(),
      description: 'Browser cross-role demonstration',
      anonymous: true,
      evidenceIds: [],
      idempotencyKey: crypto.randomUUID(),
    },
  });
  expect(report.ok()).toBeTruthy();
  const { reference } = await report.json();
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, '/admin/sign-in', 'SL-ADM-0192', 'Staff ID');
  await expect(admin.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  await admin.goto('/admin/cases/' + reference, { waitUntil: 'domcontentloaded' });
  await expect(admin.getByRole('heading', { name: 'Case #' + reference })).toBeVisible();
  await admin
    .getByRole('combobox', { name: 'Assign to Police', exact: true })
    .selectOption({ label: 'Officer Silva Demo' });
  await admin.getByRole('button', { name: 'Assign to Police', exact: true }).click();
  await expect(admin.getByText('Assigned to Police', { exact: true })).toBeVisible();
  const policeContext = await browser.newContext();
  const police = await policeContext.newPage();
  await login(police, '/police/sign-in', 'WP-CDU-0044', 'Badge ID');
  await expect(police.getByRole('heading', { name: 'Active Alerts' })).toBeVisible();
  await police.goto('/police/cases/' + reference, { waitUntil: 'domcontentloaded' });
  await police.getByRole('link', { name: 'Update case status' }).click();
  await police.getByText('Under investigation', { exact: true }).click();
  await police
    .getByLabel('Investigation notes', { exact: true })
    .fill('Browser integration update');
  await police.getByRole('button', { name: 'Save update' }).click();
  await expect(police.getByRole('heading', { name: 'Case #' + reference })).toBeVisible();
  const tracked = await request.get('http://127.0.0.1:4000/v1/cases/' + reference, { headers });
  const record = await tracked.json();
  expect(record.reference).toBe(reference);
  expect(record.stage).toBe('UNDER_INVESTIGATION');
  expect(JSON.stringify(record)).not.toContain('Browser integration update');
  await adminContext.close();
  await policeContext.close();
});
test('staff workspace rejects a different role and shows accessible login', async ({ page }) => {
  await login(page, '/counselor/sign-in', 'CNS-0071', 'Practitioner ID');
  await expect(page.getByRole('heading', { name: 'Upcoming sessions', level: 1 })).toBeVisible();
  await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '403 — Workspace restricted' })).toBeVisible();
});

test('synthetic development records appear in all four staff workspaces', async ({ page }) => {
  const workspaces = [
    {
      path: '/admin/sign-in',
      login: 'SL-ADM-0192',
      label: 'Staff ID',
      heading: 'Overview',
      record: /SL-2291/,
    },
    {
      path: '/police/sign-in',
      login: 'WP-CDU-0044',
      label: 'Badge ID',
      heading: 'Active Alerts',
      record: /6\.9271/,
    },
    {
      path: '/counselor/sign-in',
      login: 'CNS-0071',
      label: 'Practitioner ID',
      heading: 'Upcoming sessions',
      record: /Stress support/,
    },
    {
      path: '/legal/sign-in',
      login: 'LGL-0012',
      label: 'Advisor ID',
      heading: 'Legal queries',
      record: /\[DEMO\] Workplace rights information/,
    },
  ];
  for (const [index, workspace] of workspaces.entries()) {
    if (index > 0) {
      await page.getByRole('button', { name: 'Sign out' }).click();
      await expect(page.getByRole('button', { name: 'Sign in →' })).toBeVisible();
    }
    await login(page, workspace.path, workspace.login, workspace.label);
    await expect(page.getByRole('heading', { name: workspace.heading })).toBeVisible();
    await expect(page.getByText(workspace.record)).toBeVisible();
  }
});
