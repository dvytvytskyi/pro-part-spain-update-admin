import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateApiKey } from '@/lib/auth';

const NEWS_FILE = path.join(process.cwd(), 'src/data/news.json');

export async function GET(request: Request) {
    // API Key Validation for external requests
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
        const validation = validateApiKey(request);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
    }

    try {
        if (!fs.existsSync(NEWS_FILE)) {
            return NextResponse.json([]);
        }
        const fileContent = fs.readFileSync(NEWS_FILE, 'utf8');
        return NextResponse.json(JSON.parse(fileContent));
    } catch (error) {
        console.error('Error reading news:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // API Key Validation for external requests
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
        const validation = validateApiKey(request);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
    }

    try {
        const body = await request.json();

        if (!fs.existsSync(NEWS_FILE)) {
            fs.mkdirSync(path.dirname(NEWS_FILE), { recursive: true });
            fs.writeFileSync(NEWS_FILE, '[]');
        }

        const fileContent = fs.readFileSync(NEWS_FILE, 'utf8');
        const news = JSON.parse(fileContent);

        const newArticle = {
            id: Date.now().toString(),
            ...body,
            created_at: new Date().toISOString(),
            published: body.published ?? false,
        };

        news.unshift(newArticle);
        fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 4));

        return NextResponse.json(newArticle);
    } catch (error) {
        console.error('Error creating news:', error);
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}
