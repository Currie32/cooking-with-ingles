const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

export async function fetchChatCompletions(message) {

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Bearer ' + apiKey,
    },
    method: 'POST',
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an excellent chef who can create interesting recipes." },
        { role: "user", content: message }
      ],
    })
  });

  return response;
}
