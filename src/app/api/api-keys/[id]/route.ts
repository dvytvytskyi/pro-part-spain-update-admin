import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const API_KEYS_FILE = path.join(process.cwd(), 'src/data/api_keys.json');

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const fileContent = fs.readFileSync(API_KEYS_FILE, 'utf8');
        const keys = JSON.parse(fileContent);

        const index = keys.findIndex((k: any) => k.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 });
        }

        keys[index] = { ...keys[index], ...body };
        fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 4));

        return NextResponse.json(keys[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const fileContent = fs.readFileSync(API_KEYS_FILE, 'utf8');
        let keys = JSON.parse(fileContent);

        const initialLength = keys.length;
        keys = keys.filter((k: any) => k.id !== id);

        if (keys.length === initialLength) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 });
        }

        fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 4));
        return NextResponse.json({ message: 'API key deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
