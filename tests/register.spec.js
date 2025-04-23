const { test, expect } = require('@playwright/test');

// Helper to generate random user data
function generateUser(overrides = {}) {
  const random = Math.floor(Math.random() * 100000);
  return {
    title: 'นาย',
    firstname: 'กกก',
    lastname: 'ขขข',
    dob: '2025-04-09',
    phone: '9999999999',
    ssn: '1111111111111',
    location: 'ฟุตบาท',
    role: 'ผู้ขาย',
    username: `TheGoodSeller${random}`,
    email: `TheGoodSeller${random}@gmail.com`,
    password: '123456',
    confirmPassword: '123456',
    agree: true,
    ...overrides
  };
}

async function fillForm(page, user) {
  if (user.title) await page.selectOption('select[name="title"]', { label: user.title });
  if (user.firstname) await page.fill('input[name="firstname"]', user.firstname);
  if (user.lastname) await page.fill('input[name="lastname"]', user.lastname);
  if (user.dob) await page.fill('input[name="dob"]', user.dob);
  if (user.phone) await page.fill('input[name="phone"]', user.phone);
  if (user.ssn) await page.fill('input[name="SSN"]', user.ssn);
  if (user.location) await page.fill('textarea[name="location"]', user.location);
  if (user.username) await page.fill('input[name="username"]', user.username);
  if (user.email) await page.fill('input[name="email"]', user.email);
  if (user.password) await page.fill('input[name="password"]', user.password);
  if (user.confirmPassword) await page.fill('input[name="confirmPassword"]', user.confirmPassword);
  if (user.agree) await page.check('input[type="checkbox"]');
  await page.click('text=สมัครใช้งาน');
}

test.describe('Register Form Validation Tests', () => {
  const baseUrl = 'http://35.192.16.199/register';

  test('TC2-1: All valid', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser();
    await fillForm(page, user);
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC2-2: คำนำหน้า (Prefix) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ title: undefined });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-3: ชื่อ (First name) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ firstname: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-4: สกุล (Last name) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ lastname: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-5: วันเกิด (DOB) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ dob: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-6: เบอร์โทรศัพท์ (Phone) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ phone: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-7: เลขบัตรประชาชน (ID card) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ ssn: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-8: ที่อยู่ (Address) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ location: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-9: ชื่อบัญชีผู้ใช้ (Username) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ username: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-10: อีเมล (Email) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ email: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-11: รหัสผ่าน (Password) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ password: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-12: ยืนยันรหัสผ่าน (Confirm Password) is empty', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ confirmPassword: '' });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('TC2-13: ข้อตกลง (Agreement) not checked', async ({ page }) => {
    await page.goto(baseUrl);
    const user = generateUser({ agree: false });
    await fillForm(page, user);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
