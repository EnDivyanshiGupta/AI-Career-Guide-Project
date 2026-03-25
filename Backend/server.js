const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const file = "users.json";


// signup API
app.post("/signup", (req, res) => {

    const data = req.body;

    let users = [];

    if (fs.existsSync(file)) {
        users = JSON.parse(fs.readFileSync(file));
    }

    users.push(data);

    fs.writeFileSync(file, JSON.stringify(users, null, 2));

    res.json({ message: "User saved" });

});


// start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});