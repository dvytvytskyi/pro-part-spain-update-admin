import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOCATIONS_FILE = path.join(process.cwd(), 'src/data/locations.json');

export async function GET() {
    try {
        if (!fs.existsSync(LOCATIONS_FILE)) {
            return NextResponse.json({ countries: [], cities: [], areas: [] });
        }
        const fileContent = fs.readFileSync(LOCATIONS_FILE, 'utf8');
        return NextResponse.json(JSON.parse(fileContent));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, data } = body; // type: 'countries' | 'cities' | 'areas'

        if (!fs.existsSync(LOCATIONS_FILE)) {
            fs.writeFileSync(LOCATIONS_FILE, JSON.stringify({ countries: [], cities: [], areas: [] }, null, 4));
        }

        const fileContent = fs.readFileSync(LOCATIONS_FILE, 'utf8');
        const locations = JSON.parse(fileContent);

        if (Array.isArray(data)) {
            locations[type] = [...locations[type], ...data];
        } else {
            locations[type].push(data);
        }

        fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(locations, null, 4));
        return NextResponse.json(locations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));
        const type = searchParams.get('type') as 'countries' | 'cities' | 'areas';

        if (!fs.existsSync(LOCATIONS_FILE)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(LOCATIONS_FILE, 'utf8');
        const locations = JSON.parse(fileContent);

        locations[type] = locations[type].filter((item: any) => item.id !== id);

        fs.writeFileSync(LOCATIONS_FILE, JSON.stringify(locations, null, 4));
        return NextResponse.json(locations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
