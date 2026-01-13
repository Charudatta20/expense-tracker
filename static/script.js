let chartInstance = null;

/* ================= SIGNUP ================= */
function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Signup successful! Please login.");
            window.location.href = "/";
        } else {
            alert(data.message || "Signup failed");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Signup error");
    });
}

/* ================= LOGIN ================= */
function login() {
    console.log("Login button clicked");

    const username = document.getElementById("login_username").value;
    const password = document.getElementById("login_password").value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Login response:", data);

        if (data.success) {
            alert("Login successful");
            window.location.href = "/dashboard";
        } else {
            alert("Invalid credentials");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Login error");
    });
}

/* ================= ADD / EDIT EXPENSE ================= */
function saveExpense() {
    console.log("Save Expense clicked");

    const id = document.getElementById("expense_id").value;
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const comments = document.getElementById("comments").value;

    if (!category || !amount) {
        alert("Category and Amount are required");
        return;
    }

    const payload = { category, amount, comments };

    // EDIT
    if (id) {
        fetch(`/api/expenses/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(() => {
            alert("Expense updated");
            resetForm();
        });
    }
    // ADD
    else {
        fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(() => {
            alert("Expense added");
            resetForm();
        });
    }
}

/* ================= RESET FORM ================= */
function resetForm() {
    document.getElementById("expense_id").value = "";
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("comments").value = "";
    loadExpenses();
}

/* ================= LOAD EXPENSES ================= */
function loadExpenses() {
    fetch("/api/expenses")
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById("table");
            if (!table) return; // page safety

            table.innerHTML = `
                <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Comments</th>
                    <th>Actions</th>
                </tr>
            `;

            let totals = {};

            data.forEach(e => {
                table.innerHTML += `
                    <tr>
                        <td>${e.category}</td>
                        <td>${e.amount}</td>
                        <td>${e.comments || ""}</td>
                        <td>
                            <button type="button" onclick='editExpense(${JSON.stringify(e)})'>Edit</button>
                            <button type="button" onclick='deleteExpense(${e.id})'>Delete</button>
                        </td>
                    </tr>
                `;

                totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
            });

            drawChart(totals);
        });
}

/* ================= EDIT EXPENSE ================= */
function editExpense(exp) {
    document.getElementById("expense_id").value = exp.id;
    document.getElementById("category").value = exp.category;
    document.getElementById("amount").value = exp.amount;
    document.getElementById("comments").value = exp.comments;
}

/* ================= DELETE EXPENSE ================= */
function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    fetch(`/api/expenses/${id}`, {
        method: "DELETE"
    })
    .then(() => {
        alert("Expense deleted");
        loadExpenses();
    });
}

/* ================= PIE CHART ================= */
function drawChart(data) {
    const chartCanvas = document.getElementById("chart");
    if (!chartCanvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#8BC34A",
                    "#FF9800",
                    "#9C27B0"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/* ================= AUTO LOAD ON DASHBOARD ================= */
document.addEventListener("DOMContentLoaded", () => {
    loadExpenses();
});
