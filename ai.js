const API_KEY = "YOUR_API_KEY_HERE";

async function getCareer(skills) {

    const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + API_KEY
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: "Suggest one career for skills: " + skills + ". Give career name and short explanation."
                    }
                ]
            })
        }
    );

    const data = await response.json();

    console.log(data);

    return data.choices[0].message.content;
}