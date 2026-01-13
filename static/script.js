function signup() {
    fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Signup successful! Please login.");
            window.location.href = "/";
        } else {
            alert(data.message);
        }
    });
}

function login() {
    fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: login_username.value,
            password: login_password.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // ✅ Store JWT token
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard";
        } else {
            alert("Invalid credentials");
        }
    });
}

function addExpense() {
    fetch("/api/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            category: category.value,
            amount: amount.value,
            comments: comments.value
        })
    }).then(() => loadExpenses());
}

function loadExpenses() {
    fetch("/api/expenses", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {
        table.innerHTML = `
            <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Comments</th>
            </tr>
        `;

        let totals = {};

        data.forEach(e => {
            table.innerHTML += `
                <tr>
                    <td>${e.category}</td>
                    <td>${e.amount}</td>
                    <td>${e.comments}</td>
                </tr>
            `;
            totals[e.category] = (totals[e.category] || 0) + e.amount;
        });

        drawChart(totals);
    });
}
