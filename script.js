function saveSkills() {

    let skills = document.getElementById("skills").value;

    localStorage.setItem("userSkills", skills);

    window.location.href = "insert.html";

    return false;
    
}
function saveInterest() {

let interest = document.getElementById("interest").value;

let cgpa = document.getElementById("cgpa").value;

localStorage.setItem("interest", interest);

localStorage.setItem("cgpa", cgpa);

window.location.href = "result.html";

return false;

}

function showResult() {

let skills = localStorage.getItem("userSkills") || "";
let interest = localStorage.getItem("interest") || "";
let cgpa = localStorage.getItem("cgpa") || 0;

let career = "";
let explain = "";


if (skills.includes("python") || interest.includes("ai")) {

career = "Data Scientist";

explain =
"You have skills related to Python / AI. Data Science requires programming, statistics and machine learning. It has high demand in IT industry.";

}

else if (interest.includes("cloud")) {

career = "Cloud Engineer";

explain =
"You selected Cloud interest. Cloud Engineers work with AWS, Azure and Google Cloud. This field has very high demand.";

}

else if (interest.includes("design")) {

career = "UI/UX Designer";

explain =
"You have design interest. UI/UX designers create user interfaces for apps and websites.";

}

else if (interest.includes("network")) {

career = "Network Engineer";

explain =
"You have networking interest. Network engineers manage servers, routers and security.";

}

else if (cgpa >= 8) {

career = "Higher Studies / Research";

explain =
"Your CGPA is high, so you can go for M.Tech, MS or Research field.";

}

else {

career = "Software Developer";

explain =
"Based on your skills, software development is a good option.";

}


document.getElementById("career").innerText = career;

document.getElementById("explain").innerText = explain;

}