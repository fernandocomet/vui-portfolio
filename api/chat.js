export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { model, messages, max_tokens, temperature } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model, messages, max_tokens, temperature })
    });

    const data = await response.json();

    if (!response.ok) {
        return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
}
