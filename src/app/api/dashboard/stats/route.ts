import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROJECTS_FILE = path.join(process.cwd(), 'src/data/projects.json');

let cachedStats: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET() {
    try {
        const now = Date.now();
        if (cachedStats && (now - lastCacheTime < CACHE_DURATION)) {
            return NextResponse.json(cachedStats);
        }

        if (!fs.existsSync(PROJECTS_FILE)) {
            return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf8');
        const list = JSON.parse(fileContent);

        // Calculate stats
        const totalProperties = list.length;
        const offPlanProperties = list.filter((p: any) => p.property_type === "new-building").length;
        const developers = new Set(list.map((p: any) => p.developer).filter(Boolean)).size;

        const prices = list.map((p: any) => p.price).filter((p: any) => p > 0);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;

        const citiesCount = new Set(list.map((p: any) => p.town).filter(Boolean));
        const provinces = new Set(list.map((p: any) => p.province).filter(Boolean));
        const countriesSet = new Set(list.map((p: any) => p.country).filter(Boolean));
        if (countriesSet.size === 0 && list.length > 0) countriesSet.add("Spain");

        const typeCounts: Record<string, number> = {
            "New Building": 0,
            "Secondary": 0,
            "Rent": 0
        };
        list.forEach((p: any) => {
            if (p.property_type === "new-building") typeCounts["New Building"]++;
            else if (p.property_type === "secondary") typeCounts["Secondary"]++;
            else if (p.property_type === "rent") typeCounts["Rent"]++;
        });

        const cityCounts: Record<string, number> = {};
        list.forEach((p: any) => {
            if (p.town) {
                cityCounts[p.town] = (cityCounts[p.town] || 0) + 1;
            }
        });
        const sortedCities = Object.entries(cityCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        const bedCounts: Record<string, number> = {};
        list.forEach((p: any) => {
            const beds = p.beds || 0;
            const label = `${beds} Beds`;
            bedCounts[label] = (bedCounts[label] || 0) + 1;
        });
        const sortedBeds = Object.entries(bedCounts).sort((a, b) => {
            const getNum = (str: string) => parseInt(str.split(' ')[0]);
            return getNum(a[0]) - getNum(b[0]);
        }).slice(0, 10);

        const unitTypeCounts: Record<string, number> = {};
        list.forEach((p: any) => {
            if (p.type) {
                unitTypeCounts[p.type] = (unitTypeCounts[p.type] || 0) + 1;
            }
        });
        const topUnitTypes = Object.entries(unitTypeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        cachedStats = {
            totalProperties,
            offPlanProperties,
            developers,
            facilities: 144, // Static count from amenitiesList.length or we could import it if possible
            minPrice,
            maxPrice,
            countries: countriesSet.size,
            cities: citiesCount.size,
            areas: provinces.size,
            typeDistribution: {
                labels: Object.keys(typeCounts),
                series: Object.values(typeCounts)
            },
            cityDistribution: {
                categories: sortedCities.map(([name]) => name),
                data: sortedCities.map(([, count]) => count)
            },
            bedDistribution: {
                categories: sortedBeds.map(([name]) => name),
                data: sortedBeds.map(([, count]) => count)
            },
            unitTypeDistribution: {
                labels: topUnitTypes.map(([name]) => name),
                series: topUnitTypes.map(([, count]) => count)
            }
        };
        lastCacheTime = now;

        return NextResponse.json(cachedStats);
    } catch (error) {
        console.error('Error calculating dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
    }
}
