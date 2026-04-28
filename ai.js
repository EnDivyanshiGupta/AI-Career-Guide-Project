async function getCareer() {
    const skills = document.getElementById("skills").value;
    const interest = document.getElementById("interest").value;
    const cgpa = document.getElementById("cgpa").value;
    const field = document.getElementById("field").value;

    try {
        const response = await fetch("https://ai-career-guide-project.onrender.com/api/career", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                skills,
                interest,
                cgpa,
                field
            })
        });

        const data = await response.json();

        console.log(data);

        if (data.success) {
            return data.result;
        } else {
            return "Error: " + data.error;
        }

    } catch (error) {
        console.error(error);
        return "Something went wrong";
    }
}