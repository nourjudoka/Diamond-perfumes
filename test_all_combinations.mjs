import { chromium } from 'playwright';

const EGYPT_GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Port Said', 'Suez', 'Dakahlia', 'Al Sharqia',
  'Damietta', 'Kafr El Sheikh', 'Gharbia', 'Monufia', 'Beheira', 'Ismailia',
  'Qalyubia', 'Beni Sueif', 'Faiyum', 'Minya', 'Asyut', 'Sohag', 'Qena',
  'Aswan', 'Luxor', 'Red Sea', 'New Valley', 'Matrouh', 'North Sinai', 'South Sinai'
];

const PAYMENT_METHODS = ['InstaPay', 'Orange Cash', 'Cash on Delivery']; // Orange Cash is the label for Vodafone Cash

async function runTests() {
  console.log("Starting full site checkout permutation test...");
  const browser = await chromium.launch({ headless: true });
  
  let successCount = 0;
  let failCount = 0;

  for (const gov of EGYPT_GOVERNORATES) {
    for (const payment of PAYMENT_METHODS) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // 1. Go to shop page
        await page.goto('http://localhost:8080/shop');
        
        // 2. Add first available product to cart
        // Increase timeout since shop page might load products
        await page.waitForSelector('button[aria-label="Add to cart"]', { timeout: 10000 });
        const buttons = await page.$$('button[aria-label="Add to cart"]');
        if (buttons.length > 0) {
          await buttons[0].click();
        } else {
          throw new Error("No products found to add to cart");
        }

        // 3. Open cart drawer and proceed to checkout
        // Wait for cart drawer to open
        await page.waitForSelector('button:has-text("Proceed to Checkout")');
        await page.click('button:has-text("Proceed to Checkout")');

        // 4. In Checkout, cart step, click continue to shipping
        await page.waitForSelector('button:has-text("Continue to Shipping")');
        await page.click('button:has-text("Continue to Shipping")');

        // 5. Shipping Form
        await page.waitForSelector('input[value=""]'); // Wait for inputs to render
        await page.fill('input:below(:text("Full Name"))', 'Test User');
        await page.fill('input:below(:text("Email"))', 'test@example.com');
        await page.fill('input:below(:text("Phone"))', '01012345678');
        await page.fill('input:below(:text("Address"))', '123 Fake St');
        await page.fill('input:below(:text("City"))', 'Test City');
        
        await page.selectOption('select', gov);
        await page.click('button:has-text("Continue to Payment")');

        // 6. Payment Method selection
        await page.waitForSelector(`text=${payment}`);
        // Click the payment button block
        await page.click(`button:has-text("${payment}")`);
        await page.click('button:has-text("Review Order")');

        // 7. Place Order
        await page.waitForSelector('button:has-text("Place Order")');
        await page.click('button:has-text("Place Order")');

        // 8. Wait for Thank You success screen
        await page.waitForSelector('text=Thank You', { timeout: 15000 });
        
        console.log(`✅ [SUCCESS] Gov: ${gov.padEnd(15)} | Payment: ${payment}`);
        successCount++;
      } catch (err) {
        console.error(`❌ [FAILED]  Gov: ${gov.padEnd(15)} | Payment: ${payment} | Error: ${err.message}`);
        failCount++;
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
  console.log(`\n🎉 Test Completed! Success: ${successCount}, Failed: ${failCount}`);
  process.exit(0);
}

runTests().catch(console.error);
