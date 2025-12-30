
// ==========================================
// IDEALISTA RECURSIVE SCRAPER v2
// Copy and paste this into the Chrome Console
// ==========================================

(async function () {
    const API_KEY = '2f206df8-42f6-4854-9b99-2e58dc6cb84f';
    const ROOT_ID = '53'; // Malaga Root

    // Paste the list of locations you got from the first run here, 
    // OR we can just fetch it again to be self-contained.
    // Let's fetch everything from scratch to be safe.

    const delay = ms => new Promise(r => setTimeout(r, ms));

    async function fetchJson(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`Failed ${res.status}: ${url}`);
                return null;
            }
            return await res.json();
        } catch (e) {
            console.warn(`Error fetching ${url}`, e);
            return null;
        }
    }

    // 1. Get List of Municipalities
    console.log("Phase 1: Fetching Municipality List...");
    const rootUrl = `https://www.idealista.com/press-room/property-price-reports/rest/get-location-children/${ROOT_ID}/?apiKey=${API_KEY}`;
    const municipalities = await fetchJson(rootUrl);

    if (!municipalities || !Array.isArray(municipalities)) {
        console.error("❌ Failed to get municipalities list.");
        return;
    }

    console.log(`✅ Found ${municipalities.length} municipalities. Starting detailed fetch...`);

    const allData = [];

    // 2. Iterate and Fetch Details
    // We need to find the endpoint that gives PRICE data.
    // The previous endpoint `get-location-children` gives hierarchy.
    // There is likely another endpoint for the actual report, OR `get-location-children` returns price if it's a leaf node?
    // Let's check a leaf node.
    // If the previous JSON didn't have price, maybe we need `get-location-summary` or similar?
    // Wait, looking at the user's URL example: .../press-room/property-price-reports/sale/andalucia/malaga-province/benahavis/benahavis/

    // Let's try to fetch CHILDREN of a municipality. 
    // If it has no children, maybe it gives data?
    // Or maybe there is a `get-data` endpoint.

    // Hypothesis: We traverse down until we find price data.
    // Let's try fetching children for the first municipality to see what it looks like.

    // We will do a robust crawl: 
    // For each municipality, fetch its children (Districts). 
    // If it has children, fetch their data.
    // Also, we need the PRICE HISTORY. 
    // "view older data" usually makes a call.

    // Let's try to guess the price endpoint. 
    // Often it is `.../rest/get-location-data/{id}` or similar.
    // But since we don't know, let's assume `get-location-children` returns data for the specific ID if we ask for it?
    // Actually, looking at the previous file, it looks like just a list of locations.

    // Let's try to fetch a "Report" endpoint. 
    // There is often: `https://www.idealista.com/press-room/property-price-reports/rest/price-evolution/{id}/?apiKey=...`

    async function fetchPriceHistory(id, name) {
        // Try to guess the history endpoint
        const historyUrl = `https://www.idealista.com/press-room/property-price-reports/rest/evolution?locationId=${id}&operation=sale&apiKey=${API_KEY}`;
        // Note: 'location_id' in JSON is like "0-EU-ES-29...". 'serial' is like "4445". 
        // The URL used 4445 (serial). Let's use serial (or `id` passed in).

        // Let's try constructing the URL with the numeric ID (serial) as per user's example.
        // wait, user example was `get-location-children/4445`. 
        // If 4445 is Malaga city, and it returns children (districts), maybe THOSE have prices?

        // Let's try to fetch detailed evolution for the location.
        // Common pattern: /rest/evolution/{id}

        // Let's TRY multiple endpoints for a single item to see which one works.
        const endpoints = [
            `https://www.idealista.com/press-room/property-price-reports/rest/evolution?locationId=${id}&type=sale&apiKey=${API_KEY}`,
            `https://www.idealista.com/press-room/property-price-reports/rest/v2/evolution?locationId=${id}&type=sale&apiKey=${API_KEY}`
        ];

        // Actually, let's just use `get-location-children` recursively first, 
        // because usually at the bottom level (`final_location: "1"`) it might include stats?
        // OR the report page uses a different API.

        // Let's stick to what we know works: `get-location-children`.
        // If I call it on a municipality (e.g. 1168 Benahavis), maybe it returns districts?
        // If Benahavis has no districts, what does it return?

        const childUrl = `https://www.idealista.com/press-room/property-price-reports/rest/get-location-children/${id}/?apiKey=${API_KEY}`;
        const data = await fetchJson(childUrl);

        return {
            id: id,
            name: name,
            childrenOrData: data
        };
    }

    // Process a subset first to test
    const subset = municipalities; // Process ALL
    let count = 0;

    for (const muni of subset) {
        count++;
        console.log(`[${count}/${subset.length}] Processing ${muni.name} (${muni.serial})...`);

        const result = await fetchPriceHistory(muni.serial, muni.name);
        allData.push(result);

        await delay(300 + Math.random() * 500); // Be polite

        // Save intermediate every 20 items
        if (count % 20 === 0) {
            console.log("...saving intermediate batch...");
        }
    }

    console.log("✅ Finished fetching hierarchy.");

    // Download Result
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `idealista_full_structure_malaga.json`;
    a.click();
})();
