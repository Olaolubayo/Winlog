export default async function handler(req,res) {    

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {count,wins} = req.body;

    if (typeof count !== 'number' || !Array.isArray(wins)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions',{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',                
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body : JSON.stringify({
                model : 'llama-3.3-70b-versatile',
                messages : [
                    {role : 'system',content : `You are a calm, encouraging companion helping someone reflect on their small personal wins this month. You will be given a list of wins they logged and a total count. Write a short (2-3 sentence) reflection message. You may mention the count naturally, but never frame it as good or bad, high or low — every count is worth acknowledging equally. Be warm and specific — reference a theme or pattern in their wins if one is visible, without listing every single one. Avoid hype, exclamation marks, and phrases like 'crushing it' or 'killing it.' Never compare their count to what would be 'enough' or suggest they should have done more.`},                    
                    {role : 'user',content : `Total wins this month: ${count}\nWins:\n${wins.map(w => `- ${w}`).join('\n')}`}
                ]
            })                
            });                    

        if(!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.log('GROQ API error:',errorText);
            return res.status(502).json({error : 'Failed to generate reflection'})
        }

        const data = await groqResponse.json();
        const message = data.choices[0].message.content.trim();

        if(!message) {
            return res.status(502).json({error : 'No message returned'});
        } 
        return res.status(200).json({ message })
    }catch(err) {
        console.log(err);
        return res.status(500).json({error : 'Something went wrong'});
    }
    
}