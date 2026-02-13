import { test, expect, Page, devices} from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });
const BASE_URL = 'http://localhost:3000';

test.describe('Login and Logout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for the Username input to appear (using label)
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();
    await expect(page.getByText('MERNSTACK BY RENZ')).toBeVisible();
  });

  // 1. Valid Login
  test('CRUD_In - 001.01 | User can successfully log in with valid credentials', async ({ page }) => {
    await page.getByPlaceholder('Enter your Email').fill('Mejiro@gmail.com');
    await page.locator('input[type="Password"]').fill('assass');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('http://localhost:3000/user');
    await page.waitForTimeout(2000);
  });

  // 2. Invalid Credentials
  test('ABISO_In - 001.02 | Shows error message for invalid credentials', async ({ page }) => {
    await page.getByLabel('Username').fill('wrong@gmail.com');
    await page.locator('input[type="password"]').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('User not found.')).toBeVisible();
    await page.waitForTimeout(2000);
  });

  // 3. Empty Fields
  test('ABISO_In - 001.03 | Shows validation when username/password fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('All fields are required!')).toBeVisible();
  });

  // 4. Unregistered Account
  test('ABISO_In - 001.04 | Shows error for unregistered account', async ({ page }) => {
    await page.getByLabel('Username').fill('ghostuser');
    await page.locator('input[type="password"]').fill('api-test-pass');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });

  // 5. Login in Multiple Accounts
    test('ABISO_In - 001.05 | Shows Multiple Accounts', async ({ page }) => {
    await page.getByLabel('Username').fill('root');
    await page.locator('input[type="password"]').fill('api-test-pass');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByLabel('Username').fill('renz.truck.44');
    await page.locator('input[type="password"]').fill('Testpass01');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('https://ui.hmm-nprd.ga31-intranet.com');
    await page.waitForTimeout(2000);
  });
  
  // 6. Access Restriction for unauthorized Users
    test('ABISO_In - 001.06 | Unauthorized Users', async ({ page }) => {
    await page.goto('https://ui.hmm-nprd.ga31-intranet.com/#/');
    await expect(page).toHaveURL('https://ui.hmm-nprd.ga31-intranet.com/#/');
    await page.waitForTimeout(2000);
  });

    test('ABISO_In - 001.07 | Shows error for unregistered account', async ({ page, browser }) => {
    await page.goto(BASE_URL);
    await page.getByLabel('Username').fill('ghostuser');
    await page.locator('input[type="password"]').fill('api-test-pass');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();

    // MOBILE TEST (Pixel 7)
    const mobileContext = await browser.newContext({
      ...devices['Pixel 7'],
    });

    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(BASE_URL);
    await mobilePage.getByLabel('Username').fill('ghostuser');
    await mobilePage.locator('input[type="password"]').fill('api-test-pass');
    await mobilePage.getByRole('button', { name: 'Login' }).click();
    await expect(mobilePage.getByText('Invalid username or password')).toBeVisible();

});

  // 8. Error Handling and Validation
  test('ABISO_In - 001.08 | Error Handling and Validation', async ({ page }) => {
    await page.getByLabel('Username').fill('root1');
    await page.locator('input[type="password"]').fill('api-test-pass');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByLabel('Username').fill('root');
    await page.locator('input[type="password"]').fill('api-test-pass1');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByLabel('Username').fill('');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('input[type="password"]').fill('');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Username and Password are required.')).toBeVisible();
  });
});
