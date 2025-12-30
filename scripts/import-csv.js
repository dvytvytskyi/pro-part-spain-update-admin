const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PROPERTIES_CSV = path.join(PROJECT_ROOT, 'dbo-properties-2-live.1766704662.csv');
const IMAGES_CSV = path.join(PROJECT_ROOT, 'dbo-images-11-live.1766704720.csv');
const AMENITIES_CSV = path.join(PROJECT_ROOT, 'dbo-category_values-5-live.1766704743.csv');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src/data/projects.json');

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Regex to handle quoted fields containing commas
    const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;

    // Simple parser (not perfect but should work for standard CSV)
    // Actually, split by newline might break if fields contain newlines.
    // Given the head output, description seems to be localized to one line? 
    // "Plot of 1000m2 ... " it ends with ",Secondary" on the same line.
    // So assume one record per line for now.

    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = [];
        let match;
        // Reset regex state
        // Using a simpler approach: define a state machine for parsing line
        let current = '';
        let inQuote = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(current.replace(/^"|"$/g, '')); // Remove outer quotes
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.replace(/^"|"$/g, ''));

        if (values.length !== headers.length) {
            // console.warn(`Skipping line id ${i}: expected ${headers.length} columns, got ${values.length}`);
            // Attempt to recover or just skip
            // For now, let's map loosely
        }

        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        result.push(obj);
    }
    return result;
}

function run() {
    console.log('Reading CSV files...');

    // Reading Properties
    const propertiesRaw = fs.readFileSync(PROPERTIES_CSV, 'utf-8');
    const properties = parseCSV(propertiesRaw);
    console.log(`Parsed ${properties.length} properties.`);

    // Reading Images
    const imagesRaw = fs.readFileSync(IMAGES_CSV, 'utf-8');
    const images = parseCSV(imagesRaw);
    console.log(`Parsed ${images.length} images.`);

    // Group images by property_id (using 'properties_id' column in images csv which likely links to 'id' in properties csv)
    // properties csv has 'id' and 'property_old_id'.
    // images csv has 'properties_id' and 'property_old_id'.
    // Let's use 'properties_id' -> 'id'.

    // Use property_old_id for mapping images as it's more stable than internal IDs
    const imagesByRefId = {};
    images.forEach(img => {
        const refId = img.property_old_id;
        if (!refId) return;
        if (!imagesByRefId[refId]) {
            imagesByRefId[refId] = [];
        }
        imagesByRefId[refId].push({ image_url: img.image_url });
    });

    // Reading Amenities
    const amenitiesRaw = fs.readFileSync(AMENITIES_CSV, 'utf-8');
    const amenities = parseCSV(amenitiesRaw);
    console.log(`Parsed ${amenities.length} amenities.`);

    // Group amenities by property_old_id
    const amenitiesByRefId = {};
    const allAmenities = new Set();

    amenities.forEach(am => {
        const refId = am.property_old_id;
        if (!refId) return;

        if (!amenitiesByRefId[refId]) {
            amenitiesByRefId[refId] = [];
        }

        const value = am.value.replace(/^"|"$/g, ''); // Ensure no quotes
        amenitiesByRefId[refId].push(value);
        allAmenities.add(value);
    });

    const uniqueAmenities = Array.from(allAmenities).sort();
    console.log(`Found ${uniqueAmenities.length} unique amenities.`);

    // Persistent Random Score Generator (Simple Hash)
    const getHashScore = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash); // Use absolute value for simpler sorting
    };

    // Transform properties to Project interface
    const projects = properties.map(p => {
        const refId = p.property_old_id || p.id;
        const isRent = Boolean(p.rent_type);
        const isSecondary = p.property_status?.toLowerCase() === 'secondary' || p.status?.toLowerCase() === 'secondary';
        const isOffPlan = !isRent && !isSecondary;

        const market = isRent ? 'rent' : (isSecondary ? 'resale' : 'off-plan');

        return {
            id: parseInt(p.id) || p.id,
            development_name: p.development_name || p.urbanisation_name || `Property ${p.id}`,
            reference_id: refId,
            town: p.town,
            province: p.province,
            type: p.type,
            status: isSecondary ? 'Secondary' : (p.status || 'Active'),
            price: parseFloat(p.price) || 0,
            price_to: parseFloat(p.price_to) || undefined,
            currency: p.currency || 'EUR',
            built_area: parseFloat(p.built_area) || 0,
            built_area_to: parseFloat(p.built_area_to) || undefined,
            beds: parseInt(p.beds) || 0,
            baths: parseInt(p.baths) || 0,
            completion_date: p.completion_date ? new Date(p.completion_date).getTime() : undefined,
            images: imagesByRefId[refId] || [],
            description: p.description,
            property_type: isRent ? 'Rent' : (isSecondary ? 'Secondary' : 'New Building'),
            market: market,
            randomScore: getHashScore(String(refId)), // Persistent random score
            ready_project: p.status === 'Ready',
            amenities: amenitiesByRefId[refId] || [],
            latitude: parseFloat(p.latitude) || 0,
            longitude: parseFloat(p.longitude) || 0
        };
    });

    // Filter out invalid entries if any
    const validProjects = projects.filter(p => p.id && p.type);

    console.log(`Generated ${validProjects.length} valid projects.`);

    // Generate JSON content
    const jsonContent = JSON.stringify(validProjects, null, 4);

    fs.writeFileSync(OUTPUT_FILE, jsonContent);
    console.log(`Successfully wrote data to ${OUTPUT_FILE}`);
}

run();
