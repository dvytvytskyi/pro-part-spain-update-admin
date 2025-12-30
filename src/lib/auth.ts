import fs from 'fs';
import path from 'path';

const API_KEYS_FILE = path.join(process.cwd(), 'src/data/api_keys.json');

export function validateApiKey(request: Request) {
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = request.headers.get('x-api-secret');

    if (!apiKey || !apiSecret) {
        return { valid: false, error: 'Missing API Key or Secret' };
    }

    try {
        if (!fs.existsSync(API_KEYS_FILE)) {
            return { valid: false, error: 'No API keys configured' };
        }
        const fileContent = fs.readFileSync(API_KEYS_FILE, 'utf8');
        const keys = JSON.parse(fileContent);

        const keyRecord = keys.find((k: any) => k.key === apiKey && k.status === 'active');

        if (!keyRecord) {
            return { valid: false, error: 'Invalid or inactive API Key' };
        }

        if (keyRecord.secret !== apiSecret) {
            return { valid: false, error: 'Invalid API Secret' };
        }

        // Update last_used (optional, but good for tracking)
        // Note: fs.writeFileSync in a middleware/helper might be slow, but for mock it's okay
        keyRecord.last_used = new Date().toISOString();
        fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 4));

        return { valid: true, keyName: keyRecord.name };
    } catch (error) {
        console.error('API Validation Error:', error);
        return { valid: false, error: 'Internal Server Error during validation' };
    }
}
