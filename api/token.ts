export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const rawBody = await req.text();
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'http://localhost:5173', // Microsoft Graph sometimes demands a whitelisted Origin even on S2S
            },
            body: rawBody,
        });

        const data = await tokenResponse.json();

        return new Response(JSON.stringify(data), {
            status: tokenResponse.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Proxy failed to reach Microsoft Graph' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
