const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();

app.use(bodyParser.json());

app.post("/save_transaction", (req, res) => {
    const { date, type, description, amount } = req.body;
    const data = `${date},${type},${description},${amount}\n`;

    fs.appendFile("transactions.txt", data, err => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
});

app.get("/get_transactions", (req, res) => {
    fs.readFile("transactions.txt", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
            const transactions = data
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => {
                    const [date, type, description, amount] = line.split(",");
                    return { date, type, description, amount: parseFloat(amount) };
                });

            res.json({ success: true, transactions });
        }
    });
});

app.post("/save_transactions", (req, res) => {
    const transactions = req.body;

    const data = transactions
        .map(transaction => `${transaction.date},${transaction.type},${transaction.description},${transaction.amount}`)
        .join("\n");

    fs.writeFile("transactions.txt", data, err => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
