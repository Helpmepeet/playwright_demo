const { test, expect } = require('@playwright/test');

const testEmail = `autouser@example.com`;
const testPassword = 'Test1234';

async function loginOrRegister(page) {
  // Try login
  await page.goto('http://35.192.16.199/login');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('text=เข้าสู่ระบบ');

  // Wait to see if login worked 
  try {
    await page.waitForURL('**/user', { timeout: 10000 });
    return; // login success
  } catch (e) {
    console.log('Login failed. Trying to register...');
  }

  // Register if login failed
  await page.goto('http://35.192.16.199/register');

  await page.selectOption('select[name="title"]', { label: 'นาย' });
  await page.fill('input[name="firstname"]', 'ทดสอบ');
  await page.fill('input[name="lastname"]', 'ระบบ');
  await page.fill('input[name="dob"]', '2000-01-01');
  await page.fill('input[name="phone"]', '0999999999');
  await page.fill('input[name="SSN"]', '1234567890123');
  await page.fill('textarea[name="location"]', '123 เขตกรุงเทพ');

  await page.fill('input[name="username"]', 'autouser');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.fill('input[name="confirmPassword"]', testPassword);
  await page.check('input[type="checkbox"]');
  await page.click('text=สมัครใช้งาน');

  // Should redirect to login
  await page.waitForURL('**/login', { timeout: 9000 });

  // Try login again after register
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('text=เข้าสู่ระบบ');

  try {
    await page.waitForURL('**/sellerpayment', { timeout: 5000 });

    // Handle alert after confirm
    page.once('dialog', async (dialog) => {
        console.log('Alert says:', dialog.message());
        await dialog.accept();
    });

    await page.selectOption('select', { label: 'กสิกรไทย' });
    await page.fill('input[placeholder="เลขบัญชี"]', '1234567890');
    await page.click('text=ยืนยัน');

    // Continue to /user
    await page.waitForURL('**/user');
    } catch {
    await page.waitForURL('**/user');
}

}



test('TC: Add and start live successfully', async ({ page }) => {
    await loginOrRegister(page);

    await page.goto('http://35.192.16.199/setlive');
    await page.waitForURL('**/setlive');
    await page.click('text=+ เพิ่มไลฟ์ใหม่');
  
    // Fill form
    await page.locator('form input').first().fill('ไลฟ์ทดสอบ'); // ชื่อไลฟ์

    // Select product (สินค้า)
    await page.locator('form select').first().selectOption({ label: 'ไม่ระบุสินค้า' });

    // Start date (เริ่มต้น)
    await page.locator('input[type="datetime-local"]').nth(0).fill('2025-04-24T12:00');

    // End date (สิ้นสุด)
    await page.locator('input[type="datetime-local"]').nth(1).fill('2025-04-24T13:00');

    // Status (สถานะ)
    await page.locator('form select').nth(1).selectOption('public');

    // Link (ลิงค์)
    await page.locator('input[type="text"]').fill('#TestLink');

  
    // Expect alert before clicking
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Live Open');
      await dialog.accept();
    });
  
    // Click เริ่มไลฟ์
    await page.click('text=เริ่มไลฟ์');
});
  

test('TC: FAIL - Should not allow start live when required fields are missing', async ({ page }) => {
    await loginOrRegister(page);
    await page.click('text=จัดการไลฟ์');
    await page.waitForURL('**/setlive');
    await page.click('text=+ เพิ่มไลฟ์ใหม่');
  
    // Intentionally leave ชื่อไลฟ์ empty
    await page.selectOption('select', { label: 'ไม่ระบุสินค้า' });
    await page.fill('input[placeholder="mm/dd/yyyy"] >> nth=0', '2025-04-24');
    await page.fill('input[placeholder="mm/dd/yyyy"] >> nth=1', '2025-04-24');
    await page.selectOption('select[name="status"]', 'public');
    await page.fill('input[placeholder="#"]', '#MissingLiveName');
  
    // Expect NO alert (but one will appear — this is the known bug)
    let alertShown = false;
    page.once('dialog', async (dialog) => {
      alertShown = true;
      await dialog.accept(); // Still accept it to prevent freeze
    });
  
    await page.click('text=เริ่มไลฟ์');
    await page.waitForTimeout(2000); // Give time for alert if any
  
    // ❌ Force test to fail if alert appeared
    expect(alertShown).toBeFalsy();
  
    // Note: This test fails because current frontend lacks validation.
    // Alert should not appear when required fields are missing.
  });
  
  