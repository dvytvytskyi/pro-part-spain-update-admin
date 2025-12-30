import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const API_KEYS_FILE = path.join(process.cwd(), 'src/data/api_keys.json');

export async function GET() {
    try {
        if (!fs.existsSync(API_KEYS_FILE)) {
            return NextResponse.json([]);
        }
        const fileContent = fs.readFileSync(API_KEYS_FILE, 'utf8');
        const keys = JSON.parse(fileContent);
        // Do not return secrets in the list
        const safeKeys = keys.map(({ secret, ...rest }: any) => rest);
        return NextResponse.json(safeKeys);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!fs.existsSync(path.dirname(API_KEYS_FILE))) {
            fs.mkdirSync(path.dirname(API_KEYS_FILE), { recursive: true });
        }

        const fileContent = fs.existsSync(API_KEYS_FILE) ? fs.readFileSync(API_KEYS_FILE, 'utf8') : '[]';
        const keys = JSON.parse(fileContent);

        const clientId = `pp_${crypto.randomBytes(24).toString('hex')}`;
        const clientSecret = crypto.randomBytes(32).toString('hex');

        // In a real app we'd store a hash of the secret
        const newKey = {
            id: Date.now().toString(),
            name: body.name || 'Untitled Key',
            key: clientId,
            secret: clientSecret, // Storing raw for this demo, but logic-wise we only show it once
            status: 'active',
            last_used: null,
            created_at: new Date().toISOString(),
        };

        keys.unshift(newKey);
        fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 4));

        // Return the full object including the secret only this once
        return NextResponse.json(newKey);
    } catch (error) {
        console.error('Error creating API key:', error);
        return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }
}
