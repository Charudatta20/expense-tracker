from flask import Flask, render_template, request, jsonify
import sqlite3
import datetime
import jwt

app = Flask(__name__)
app.config["SECRET_KEY"] = "iaurosystems_secret_key"

# ---------------- DATABASE ----------------
def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            amount REAL,
            comments TEXT,
            created_at TEXT
        )
    """)
    db.commit()
    db.close()

init_db()

# ---------------- PAGES ----------------
@app.route("/")
def login_page():
    return render_template("login.html")

@app.route("/signup")
def signup_page():
    return render_template("signup.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

# ---------------- AUTH APIs ----------------
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (data["username"], data["password"])
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "User already exists"}), 400
    finally:
        db.close()

    return jsonify({"success": True})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    db = get_db()

    user = db.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (data["username"], data["password"])
    ).fetchone()
    db.close()

    if not user:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    token = jwt.encode({
        "username": user["username"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, app.config["SECRET_KEY"], algorithm="HS256")

    return jsonify({"success": True, "token": token})

# ---------------- EXPENSE APIs ----------------
@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM expenses ORDER BY created_at DESC"
    ).fetchall()
    db.close()
    return jsonify([dict(row) for row in rows])

@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.json
    db = get_db()
    db.execute("""
        INSERT INTO expenses (category, amount, comments, created_at)
        VALUES (?, ?, ?, ?)
    """, (
        data["category"],
        data["amount"],
        data.get("comments", ""),
        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    db.commit()
    db.close()
    return jsonify({"message": "Expense added"})

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)
