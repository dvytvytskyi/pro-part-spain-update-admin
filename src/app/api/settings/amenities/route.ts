import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const AMENITIES_FILE = path.join(process.cwd(), 'src/data/amenities.json');

export async function GET() {
    try {
        if (!fs.existsSync(AMENITIES_FILE)) {
            return NextResponse.json([]);
        }
        const fileContent = fs.readFileSync(AMENITIES_FILE, 'utf8');
        return NextResponse.json(JSON.parse(fileContent));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!fs.existsSync(AMENITIES_FILE)) {
            fs.writeFileSync(AMENITIES_FILE, JSON.stringify([], null, 4));
        }

        const fileContent = fs.readFileSync(AMENITIES_FILE, 'utf8');
        const amenities = JSON.parse(fileContent);

        if (Array.isArray(body)) {
            amenities.push(...body);
        } else {
            amenities.push(body);
        }

        fs.writeFileSync(AMENITIES_FILE, JSON.stringify(amenities, null, 4));
        return NextResponse.json(amenities);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));

        if (!fs.existsSync(AMENITIES_FILE)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(AMENITIES_FILE, 'utf8');
        let amenities = JSON.parse(fileContent);

        amenities = amenities.filter((item: any) => item.id !== id);

        fs.writeFileSync(AMENITIES_FILE, JSON.stringify(amenities, null, 4));
        return NextResponse.json(amenities);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
