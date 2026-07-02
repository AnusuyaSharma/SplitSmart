const parseExpenseWithGemini = async (transcript, members, currentUserName) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const memberNames = members.map(m => m.name).join(', ');

  const prompt = `You are helping parse a voice-recorded expense for a bill-splitting app.

Group members: ${memberNames}
Current user (the person using the app): ${currentUserName}

The user said: "${transcript}"

Respond ONLY with a valid JSON object, no explanation, no markdown:
{
  "description": "short description of the expense",
  "amount": 500,
  "paidBy": "Name of who paid",
  "members": ["Name1", "Name2"]
}

Rules:
- amount must be a plain number, no currency symbols
- paidBy must be exactly one name from the group members list
- if the user says "I" or "me" for paidBy, use "${currentUserName}"
- if paidBy is not mentioned at all, default to "${currentUserName}"
- members must only contain names from the group member list above
- if no members are mentioned, return all group members
- if no amount is found, return 0
- description should be 1-4 words`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  })
});


  if (!res.ok) throw new Error('Gemini API call failed');

  const data = await res.json();
  const raw = data.choices[0].message.content;

  // Gemini sometimes wraps response in ```json ... ``` — strip that
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const matchedMembers = members.filter(m =>
    parsed.members.some(name => name.toLowerCase() === m.name.toLowerCase())
  );

  const currentUserMember = members.find(m =>
    m.name.toLowerCase() === currentUserName.toLowerCase()
  );

  const paidByMember = members.find(m =>
    m.name.toLowerCase() === parsed.paidBy?.toLowerCase()
  ) || currentUserMember;

  return {
    description: parsed.description || '',
    amount: parsed.amount || 0,
    paidBy: paidByMember,
    members: matchedMembers
  };
};

export default parseExpenseWithGemini;
