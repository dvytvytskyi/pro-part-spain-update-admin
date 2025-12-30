import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const NEWS_FILE = path.join(process.cwd(), 'src/data/news.json');

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const fileContent = fs.readFileSync(NEWS_FILE, 'utf8');
        const news = JSON.parse(fileContent);
        const article = news.find((n: any) => n.id === id);

        if (!article) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        return NextResponse.json(article);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const fileContent = fs.readFileSync(NEWS_FILE, 'utf8');
        const news = JSON.parse(fileContent);

        const index = news.findIndex((n: any) => n.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        news[index] = { ...news[index], ...body };
        fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 4));

        return NextResponse.json(news[index]);
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
        const fileContent = fs.readFileSync(NEWS_FILE, 'utf8');
        let news = JSON.parse(fileContent);

        const initialLength = news.length;
        news = news.filter((n: any) => n.id !== id);

        if (news.length === initialLength) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 4));
        return NextResponse.json({ message: 'News deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
