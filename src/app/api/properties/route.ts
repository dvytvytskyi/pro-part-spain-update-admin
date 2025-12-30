import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiKey } from '@/lib/auth';
import { newBuildingIds } from '@/data/newBuildingIds';
import { applyGeocoding } from '@/lib/geocoding';

const PROJECTS_FILE = path.join(process.cwd(), 'src/data/projects.json');

// In-memory cache for the projects JSON
let cachedProjects: any[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour caching

// Response Cache to avoid re-filtering the entire 9000+ items dataset for identical queries
const requestCache = new Map<string, { response: any, timestamp: number }>();
const REQUEST_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Check cache first
    const cacheKey = searchParams.toString();
    const cachedResponse = requestCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp < REQUEST_CACHE_DURATION)) {
        return NextResponse.json(cachedResponse.response);
    }

    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Support for multiple values (e.g., town=Marbella&town=Estepona or town[]=Marbella)
    const getMultiParam = (key: string) => {
        const values = searchParams.getAll(key);
        const bracketValues = searchParams.getAll(`${key}[]`);
        return [...new Set([...values, ...bracketValues])].filter(Boolean);
    };

    const subtypes = getMultiParam('subtype'); // Apartment, House, etc.
    const priceMin = parseFloat(searchParams.get('priceMin') || '0');
    const priceMax = parseFloat(searchParams.get('priceMax') || '999999999');
    const sizeMin = parseFloat(searchParams.get('sizeMin') || '0');
    const sizeMax = parseFloat(searchParams.get('sizeMax') || '999999999');

    const beds = getMultiParam('beds');
    const bedsExact = searchParams.get('beds_exact') === 'true';

    const baths = searchParams.get('baths');
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];
    const sort = searchParams.get('sort');
    const towns = getMultiParam('town');

    // API Key Validation for external requests
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
        const validation = validateApiKey(request);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
    }

    try {
        const now = Date.now();
        // Global JSON cache (1 hour)
        if (!cachedProjects || (now - lastCacheTime > CACHE_DURATION)) {
            if (!fs.existsSync(PROJECTS_FILE)) {
                return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
            }
            const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf8');
            const rawProjects = JSON.parse(fileContent);
            cachedProjects = applyGeocoding(rawProjects);
            lastCacheTime = now;
            // Clear request cache when base data changes
            requestCache.clear();
        }

        let filteredProjects = cachedProjects ? [...cachedProjects] : [];

        // 1. Tab Filtering (Market Type)
        // 1. Tab Filtering (Market Type)
        // Accept "New Building" as alias for "Off-Plan"
        if (type === "Off-Plan" || type === "New Building") {
            filteredProjects = filteredProjects.filter((project: any) =>
                project.market === 'off-plan' ||
                project.property_type?.toLowerCase() === "new-building" ||
                project.property_type?.toLowerCase() === "off-plan" ||
                project.status?.toLowerCase() === "off-plan" ||
                (project.reference_id && newBuildingIds.includes(project.reference_id))
            );
        } else if (type === "Secondary" || type === "Resale") {
            filteredProjects = filteredProjects.filter((project: any) =>
                (project.market === 'resale' ||
                    project.property_type?.toLowerCase() === "secondary" ||
                    project.status?.toLowerCase() === "secondary") &&
                !(project.reference_id && newBuildingIds.includes(project.reference_id))
            );
        } else if (type === "Rent") {
            filteredProjects = filteredProjects.filter((project: any) =>
                project.market === 'rent' ||
                project.property_type?.toLowerCase() === "rent" ||
                project.status?.toLowerCase() === "rent"
            );
        }

        // 1.1 Featured Handling
        const featured = searchParams.get('featured') === 'true';
        if (featured && !sort) {
            // For featured items, if no sort specified, show most expensive (premium) first
            filteredProjects.sort((a, b) => b.price - a.price);
        }

        // 2. Global Search
        if (search) {
            const query = search.toLowerCase();
            filteredProjects = filteredProjects.filter((project: any) =>
                (project.development_name || '').toLowerCase().includes(query) ||
                (project.reference_id || '').toLowerCase().includes(query) ||
                (project.town || '').toLowerCase().includes(query)
            );
        }

        // 3. Property Subtypes (Multi-select)
        if (subtypes.length > 0) {
            const lowerSubtypes = subtypes.map(s => s.toLowerCase());
            filteredProjects = filteredProjects.filter((p: any) =>
                lowerSubtypes.includes(p.type?.toLowerCase())
            );
        }

        // 4. Locations (Multi-select)
        if (towns.length > 0) {
            const lowerTowns = towns.map(t => t.toLowerCase());
            filteredProjects = filteredProjects.filter((p: any) =>
                lowerTowns.includes(p.town?.toLowerCase()) ||
                lowerTowns.includes(p.province?.toLowerCase())
            );
        }

        // 5. Price & Size
        if (priceMin > 0 || priceMax < 999999999) {
            filteredProjects = filteredProjects.filter((p: any) =>
                (p.price || 0) >= priceMin && (p.price || 0) <= priceMax
            );
        }

        if (sizeMin > 0 || sizeMax < 999999999) {
            filteredProjects = filteredProjects.filter((p: any) =>
                (p.built_area || 0) >= sizeMin && (p.built_area || 0) <= sizeMax
            );
        }

        // 6. Bedrooms (Multi-select + Exact toggle)
        if (beds.length > 0) {
            const bedValues = beds.map(b => parseInt(b));
            if (bedsExact) {
                // Return items that match EXACTLY any of the provided counts
                filteredProjects = filteredProjects.filter((p: any) =>
                    bedValues.includes(p.beds || 0)
                );
            } else {
                // Return items that have AT LEAST the minimum of the provided counts
                const minBeds = Math.min(...bedValues);
                filteredProjects = filteredProjects.filter((p: any) => (p.beds || 0) >= minBeds);
            }
        }

        // 7. Bathrooms (Min)
        if (baths) {
            const bathsVal = parseInt(baths);
            filteredProjects = filteredProjects.filter((p: any) => (p.baths || 0) >= bathsVal);
        }

        // 8. Amenities
        if (amenities.length > 0) {
            filteredProjects = filteredProjects.filter((p: any) =>
                amenities.every(amenity =>
                    p.amenities?.some((a: string) => a.toLowerCase() === amenity.toLowerCase())
                )
            );
        }

        // 9. Filter by specific IDs (optimized fetching)
        const idsParam = searchParams.get('ids');
        if (idsParam) {
            const requestedIds = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (requestedIds.length > 0) {
                const idSet = new Set(requestedIds);
                filteredProjects = filteredProjects.filter((p: any) => idSet.has(p.id));
            }
        }

        // 9. Sorting
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    filteredProjects.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    filteredProjects.sort((a, b) => b.price - a.price);
                    break;
                case 'size_asc':
                    filteredProjects.sort((a, b) => a.built_area - b.built_area);
                    break;
                case 'size_desc':
                    filteredProjects.sort((a, b) => b.built_area - a.built_area);
                    break;
                case 'date_desc':
                    filteredProjects.sort((a, b) => (b.completion_date || 0) - (a.completion_date || 0));
                    break;
                case 'random':
                    filteredProjects.sort((a, b) => (a.randomScore || 0) - (b.randomScore || 0));
                    break;
            }
        }

        const totalItems = filteredProjects.length;
        const totalPages = Math.ceil(totalItems / limit);

        // Apply Pagination
        const startIndex = (page - 1) * limit;
        const paginatedProjects = filteredProjects.slice(startIndex, startIndex + limit);

        const finalResponse = {
            data: paginatedProjects,
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit
        };

        // Save to cache
        requestCache.set(cacheKey, {
            response: finalResponse,
            timestamp: Date.now()
        });

        // Limit cache size to avoid memory leaks
        if (requestCache.size > 1000) {
            const oldestKey = requestCache.keys().next().value;
            if (oldestKey) requestCache.delete(oldestKey);
        }

        return NextResponse.json(finalResponse);
    } catch (error) {
        console.error('Error processing projects:', error);
        return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
    }
}
