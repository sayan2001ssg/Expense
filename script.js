const transactionTableBody = document.getElementById("transactionTableBody");
const addTransactionButton = document.getElementById("addTransaction");
const remainingBalance = document.getElementById("remainingBalance");

let transactions = [];

function updateTable() {
    transactionTableBody.innerHTML = "";

    transactions.forEach((transaction, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>${transaction.description}</td>
            <td>₹${transaction.amount}</td>
            <td><button class="editButton" data-index="${index}">Edit</button></td>
        `;

        transactionTableBody.appendChild(row);
    });

    updateRemainingBalance();
    setEditButtonListeners();
}

function updateRemainingBalance() {
    const total = transactions.reduce((total, transaction) => {
        return transaction.type === "credit" ? total + transaction.amount : total - transaction.amount;
    }, 0);

    remainingBalance.innerText = `Total Remaining Balance: ₹${total}`;
}

function setEditButtonListeners() {
    const editButtons = document.getElementsByClassName("editButton");

    Array.from(editButtons).forEach(button => {
        button.addEventListener("click", () => {
            const index = button.getAttribute("data-index");
            editTransaction(index);
        });
    });
}

function editTransaction(index) {
    const transaction = transactions[index];
    const newDescription = prompt("Enter new description:", transaction.description);
    const newAmount = parseFloat(prompt("Enter new amount:", transaction.amount));

    if (newDescription !== null && !isNaN(newAmount)) {
        transaction.description = newDescription;
        transaction.amount = newAmount;
        updateTable();
    }
}

addTransactionButton.addEventListener("click", () => {
    const transactionType = document.getElementById("transactionType").value;
    const transactionDescription = document.getElementById("transactionDescription").value;
    const transactionAmount = parseFloat(document.getElementById("transactionAmount").value);

    if (!transactionType || !transactionDescription || isNaN(transactionAmount)) {
        return;
    }

    const transactionDate = new Date().toISOString().split("T")[0];

    const transactionData = {
        date: transactionDate,
        type: transactionType,
        description: transactionDescription,
        amount: transactionAmount
    };

    fetch("/save_transaction", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transactionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            transactions.push(transactionData);
            updateTable();
        } else {
            alert("Failed to save the transaction. Please try again.");
        }
    });
});

window.addEventListener("load", () => {
    fetch("/get_transactions")
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            transactions = data.transactions;
            updateTable();
        }
    });
});

window.addEventListener("beforeunload", () => {
    fetch("/save_transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transactions)
    });
});
