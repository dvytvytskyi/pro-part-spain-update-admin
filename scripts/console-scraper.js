
// ==========================================
// IDEALISTA CONSOLE SCRAPER
// Copy and paste this ENTIRE script into the Chrome Console (F12 -> Console)
// while you are on the Idealista Price Report page.
// ==========================================

(async function () {
    const API_KEY = '2f206df8-42f6-4854-9b99-2e58dc6cb84f';
    const ROOT_ID = '53'; // Based on your example

    console.log("🚀 Starting Scraper...");

    // Helper to fetch with delay to be polite
    const delay = ms => new Promise(r => setTimeout(r, ms));

    async function fetchNode(id) {
        const url = `https://www.idealista.com/press-room/property-price-reports/rest/get-location-children/${id}/?apiKey=${API_KEY}`;
        try {
            console.log(`Fetching ID: ${id}...`);
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`Error fetching ${id}: ${res.status}`);
                return null;
            }
            return await res.json();
        } catch (e) {
            console.error(`Exception fetching ${id}:`, e);
            return null;
        }
    }

    // 1. Fetch Root (e.g. Malaga/Andalucia)
    const rootData = await fetchNode(ROOT_ID);

    if (!rootData) {
        console.error("❌ Failed to fetch root data. Are you blocked?");
        return;
    }

    console.log("✅ Root data fetched via API!");
    console.log(rootData);

    // We want to verify if this contains the price info or just list of places.
    // If it's a list, we might need to explore deeper.
    // Based on typical Idealista API, this often returns the table data too for that node.

    // Let's create a download of this data immediately so we don't lose it.
    const blob = new Blob([JSON.stringify(rootData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `idealista_data_${ROOT_ID}.json`;
    a.click();
    console.log("⬇️ Downloaded root data JSON.");

    // If 'children' exist, let's try to fetch a few to see
    // (You can uncomment this part later if we confirm the structure)
    /*
    if (rootData && Array.isArray(rootData)) {
         // It might be an array of children? Or an object with .children?
         // We will request you (the user) to share the structure first.
    }
    */

    console.log("❓ Please check the downloaded file or the console object above.");
    console.log("❓ Does it contain 'price' fields or 'history'? If so, we are good!");
})();
