import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiKey } from '@/lib/auth';
import { applyGeocoding } from '@/lib/geocoding';

const PROJECTS_FILE = path.join(process.cwd(), 'src/data/projects.json');

// Memory Cache for heavy data
let cachedProjects: any[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60;

// Map Response Cache
const mapCache = new Map<string, { response: any, timestamp: number }>();
const MAP_CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

// Helper to get array from params (supports comma lists and array syntax)
const getMultiParam = (searchParams: URLSearchParams, key: string) => {
    const values = searchParams.getAll(key);
    const bracketValues = searchParams.getAll(`${key}[]`);
    // Split commas if any
    const all = [...values, ...bracketValues].flatMap(v => v.split(','));
    return [...new Set(all)].filter(Boolean);
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cacheKey = searchParams.toString();

    // Check Map Cache
    const cached = mapCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < MAP_CACHE_DURATION)) {
        return NextResponse.json(cached.response);
    }

    // API Key Validation
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
        const validation = validateApiKey(request);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
    }

    try {
        const now = Date.now();
        if (!cachedProjects || (now - lastCacheTime > CACHE_DURATION)) {
            if (!fs.existsSync(PROJECTS_FILE)) {
                return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
            }
            const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf8');
            const rawProjects = JSON.parse(fileContent);
            cachedProjects = applyGeocoding(rawProjects);
            lastCacheTime = now;
            mapCache.clear();
        }

        let projects = [...(cachedProjects || [])];

        // --- FILTERING LOGIC (Matching /api/properties) ---

        // 1. IDs (Direct Fetch)
        const idsParam = searchParams.get('ids');
        if (idsParam) {
            const requestedIds = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (requestedIds.length > 0) {
                const idSet = new Set(requestedIds);
                projects = projects.filter((p: any) => idSet.has(p.id));
            }
        } else {
            // Apply other filters only if IDs are not provided (or we combine them? usually ID fetch is exclusive or strict constraint)
            // Let's allow combining filters with IDs if user really wants to filter WITHIN a set of IDs, but usually usually it's one or other.
            // Following the pattern of main API, we filter sequentially.

            // 2. Market Type (type or market param)
            const type = searchParams.get('type') || searchParams.get('market');
            if (type) {
                const typeLower = type.toLowerCase();
                projects = projects.filter(p =>
                    p.property_type?.toLowerCase() === typeLower ||
                    p.market?.toLowerCase() === typeLower ||
                    (typeLower === 'new building' && p.market === 'off-plan')
                );
            }

            // 3. Subtypes (Multi-select)
            const subtypes = getMultiParam(searchParams, 'subtype');
            if (subtypes.length > 0) {
                const lowerSubtypes = subtypes.map(s => s.toLowerCase());
                projects = projects.filter((p: any) =>
                    lowerSubtypes.includes(p.type?.toLowerCase())
                );
            }

            // 4. Towns (Multi-select)
            const towns = getMultiParam(searchParams, 'town');
            if (towns.length > 0) {
                const lowerTowns = towns.map(t => t.toLowerCase());
                projects = projects.filter((p: any) =>
                    lowerTowns.includes(p.town?.toLowerCase()) ||
                    lowerTowns.includes(p.province?.toLowerCase())
                );
            }

            // 5. Price & Size
            const priceMin = parseFloat(searchParams.get('priceMin') || '0');
            const priceMax = parseFloat(searchParams.get('priceMax') || '999999999');
            const sizeMin = parseFloat(searchParams.get('sizeMin') || '0');
            const sizeMax = parseFloat(searchParams.get('sizeMax') || '999999999');

            if (priceMin > 0 || priceMax < 999999999) {
                projects = projects.filter((p: any) =>
                    (p.price || 0) >= priceMin && (p.price || 0) <= priceMax
                );
            }

            if (sizeMin > 0 || sizeMax < 999999999) {
                projects = projects.filter((p: any) =>
                    (p.built_area || 0) >= sizeMin && (p.built_area || 0) <= sizeMax
                );
            }

            // 6. Bedrooms (Multi-select: user might use 'bedrooms' or 'beds')
            const beds = getMultiParam(searchParams, 'beds').concat(getMultiParam(searchParams, 'bedrooms'));
            const bedsExact = searchParams.get('beds_exact') === 'true';

            if (beds.length > 0) {
                const bedValues = beds.map(b => parseInt(b));
                if (bedsExact) {
                    projects = projects.filter((p: any) => bedValues.includes(p.beds || 0));
                } else {
                    const minBeds = Math.min(...bedValues);
                    projects = projects.filter((p: any) => (p.beds || 0) >= minBeds);
                }
            }

            // 7. Bathrooms
            const baths = searchParams.get('baths') || searchParams.get('bathrooms');
            if (baths) {
                const bathsVal = parseInt(baths);
                projects = projects.filter((p: any) => (p.baths || 0) >= bathsVal);
            }

            // 8. Amenities
            const amenities = getMultiParam(searchParams, 'amenities');
            if (amenities.length > 0) {
                projects = projects.filter((p: any) =>
                    amenities.every(amenity =>
                        p.amenities?.some((a: string) => a.toLowerCase() === amenity.toLowerCase())
                    )
                );
            }

            // 9. Search (development name, ref)
            const search = searchParams.get('search');
            if (search) {
                const query = search.toLowerCase();
                projects = projects.filter((project: any) =>
                    (project.development_name || '').toLowerCase().includes(query) ||
                    (project.reference_id || '').toLowerCase().includes(query)
                );
            }
        }

        // Project only needed fields for the map (Ultra-lightweight)
        const mapData = projects
            .filter(p => p.latitude && p.longitude && p.latitude !== 0)
            .map(p => ({
                id: p.id,
                lat: p.latitude,
                lng: p.longitude,
                price: p.price,
                market: p.market || (p.property_type === 'New Building' ? 'off-plan' : (p.property_type === 'Rent' ? 'rent' : 'resale')),
                title: p.development_name,
                image: p.images?.[0]?.image_url || null,
                // Add minimal data for popup filtering confirmation/debug if needed, but keeping it light
                beds: p.beds,
                size: p.built_area,
                type: p.type
            }));

        const response = {
            data: mapData,
            total: mapData.length
        };

        // Cache result
        mapCache.set(cacheKey, { response, timestamp: Date.now() });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error serving map data:', error);
        return NextResponse.json({ error: 'Failed to serve map data' }, { status: 500 });
    }
}
