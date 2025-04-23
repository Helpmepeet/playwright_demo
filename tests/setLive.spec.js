const { test, expect } = require('@playwright/test');

const username = 'autouser21'
const testEmail = username + `@example.com`;
const testPassword = 'Test1234';

async function loginOrRegister(page) {
    // Try login
    await page.goto('http://35.192.16.199/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('text=เข้าสู่ระบบ');
  
    // Wait to see if login worked 
    try {
        await page.waitForURL("**/user", { timeout: 10000 });
        return; // login success
    } catch (e) {
        if (e.message.includes("NS_BINDING_ABORTED")) {
        // Ignore this event
        return;
    }
      console.log('Login failed. Trying to register...');
  
      // Register as seller if login failed
      await page.goto('http://35.192.16.199/register');
      await page.selectOption('select[name="title"]', { label: 'นาย' });
      await page.fill('input[name="firstname"]', 'ทดสอบ');
      await page.fill('input[name="lastname"]', 'ระบบ');
      await page.fill('input[name="dob"]', '2000-01-01');
      await page.fill('input[name="phone"]', '0999999999');
      await page.fill('input[name="SSN"]', '1234567890123');
      await page.fill('textarea[name="location"]', '123 เขตกรุงเทพ');
      await page.click('button:has-text("ผู้ขาย")');
      await page.fill('input[name="username"]', username);
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.fill('input[name="confirmPassword"]', testPassword);
      await page.check('input[type="checkbox"]');
      await page.click('text=สมัครใช้งาน');
  
      // Wait for login redirect
      await page.waitForURL('**/login', { timeout: 10000 });
  
      // Login again
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('text=เข้าสู่ระบบ');
    }
  
    // After login, check if sellerpayment page is shown
    try {
      await page.waitForURL('**/sellerpayment', { timeout: 10000 });
  
      await page.selectOption('select', { label: 'ไทยพาณิชย์' });
      await page.fill('input[name="account"]', '1234567890');
  
      page.once('dialog', async (dialog) => {
        console.log('Alert says:', dialog.message());
        await dialog.accept();
      });
  
      await page.click('text=ยืนยัน');
      await page.waitForURL('**/user');
    } catch {
      // If not redirected to sellerpayment, wait for /user directly
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

  
    // First dialog: Live Open
    const liveOpenDialog = page.waitForEvent('dialog');
    await page.click('text=เริ่มไลฟ์');
    const openDialog = await liveOpenDialog;
    expect(openDialog.message()).toContain('Live Open');
    await openDialog.accept();

    // Second dialog: Live Deleted
    const liveDeletedDialog = page.waitForEvent('dialog');
    await page.click('text=ลบ');
    const deleteDialog = await liveDeletedDialog;
    expect(deleteDialog.message()).toContain('Live Deleted!');
    await deleteDialog.accept();

    


});
  

test('TC: FAIL - Should not allow start live when required fields are missing', async ({ page }) => {
    await loginOrRegister(page);
  
    await page.goto('http://35.192.16.199/setlive');
    await page.waitForURL('**/setlive');
    await page.click('text=+ เพิ่มไลฟ์ใหม่');
  
    // Leave ชื่อไลฟ์ empty (do not fill)
    
    // Select product (สินค้า)
    await page.locator('form select').first().selectOption({ label: 'ไม่ระบุสินค้า' });
  
    // Start date (เริ่มต้น)
    await page.locator('input[type="datetime-local"]').nth(0).fill('2025-04-24T12:00');
  
    // End date (สิ้นสุด)
    await page.locator('input[type="datetime-local"]').nth(1).fill('2025-04-24T13:00');
  
    // Status (สถานะ)
    await page.locator('form select').nth(1).selectOption('public');
  
    // Link (ลิงค์)
    await page.locator('input[type="text"]').fill('#MissingName');
  
    // Expect NO alert
    let alertShown = false;
    page.once('dialog', async (dialog) => {
      alertShown = true;
      await dialog.accept(); // still accept to avoid blocking
    });
  
    await page.click('text=เริ่มไลฟ์');
    await page.waitForTimeout(10000); // give time for any alert
  
    // ❌ Fail if alert was shown
    expect(alertShown).toBeFalsy();
  });
  
  