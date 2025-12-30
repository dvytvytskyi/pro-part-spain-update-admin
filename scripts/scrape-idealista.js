
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const API_KEY = '2f206df8-42f6-4854-9b99-2e58dc6cb84f'; // From user example
const PROVINCE_ID = '53'; // From user example (Malaga is likely 29 or 53? User used 53 in example, let's check)
// Actually standard Malaga code is 29. 53 might be arbitrary ID.
// User Example: /get-location-children/53 
// Let's assume 53 is the node for "Andalucia" or "Malaga"? 
// We will test 53 first.

const TEST_URL = `https://www.idealista.com/press-room/property-price-reports/rest/get-location-children/53/?apiKey=${API_KEY}`;
const DATA_FILE = path.join(__dirname, '../data/idealista_api_test.json');

async function scrape() {
    console.log('Connecting to existing browser on port 9222...');

    let browser;
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
    } catch (e) {
        console.error('Could not connect to browser. Make sure you launched Chrome with --remote-debugging-port=9222');
        process.exit(1);
    }

    // Get the active tab
    const pages = await browser.pages();
    let page = pages.length > 0 ? pages[0] : await browser.newPage();

    try {
        console.log(`Current URL: ${page.url()}`);

        // Ensure we are on idealista domain for cookies to work
        if (!page.url().includes('idealista.com')) {
            console.log('Navigating to idealista.com homepage to establish session context...');
            await page.goto('https://www.idealista.com/en/', { waitUntil: 'domcontentloaded' });
        }

        console.log(`Testing API access: ${TEST_URL}`);

        // Execute fetch inside the browser
        const data = await page.evaluate(async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    return { error: response.status, statusText: response.statusText };
                }
                return await response.json();
            } catch (err) {
                return { error: err.toString() };
            }
        }, TEST_URL);

        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data.error) {
            console.log('API request failed inside browser. You might need to solve a Captcha on the page.');
        } else {
            console.log('SUCCESS! API is accessible.');

            // If success, we can try to find the price data endpoint.
            // But for now, let's just save this structure.
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await browser.disconnect();
    }
}

scrape();
