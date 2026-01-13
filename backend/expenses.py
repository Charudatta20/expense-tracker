from flask import Blueprint, request, jsonify
from models import get_db
import datetime

expense_bp = Blueprint("expenses", __name__)

@expense_bp.route("/expenses", methods=["POST"])
def add_expense():
    data = request.json
    db = get_db()
    db.execute("""
        INSERT INTO expenses (category, amount, comments, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["category"],
        data["amount"],
        data.get("comments", ""),
        datetime.datetime.now(),
        datetime.datetime.now()
    ))
    db.commit()
    return jsonify({"message": "Expense added"})


@expense_bp.route("/expenses", methods=["GET"])
def get_expenses():
    db = get_db()
    rows = db.execute("""
        SELECT * FROM expenses ORDER BY created_at DESC
    """).fetchall()
    return jsonify([dict(row) for row in rows])


@expense_bp.route("/expenses/<int:id>", methods=["PUT"])
def update_expense(id):
    data = request.json
    db = get_db()
    db.execute("""
        UPDATE expenses
        SET category=?, amount=?, comments=?, updated_at=?
        WHERE id=?
    """, (
        data["category"],
        data["amount"],
        data.get("comments", ""),
        datetime.datetime.now(),
        id
    ))
    db.commit()
    return jsonify({"message": "Expense updated"})


@expense_bp.route("/expenses/<int:id>", methods=["DELETE"])
def delete_expense(id):
    db = get_db()
    db.execute("DELETE FROM expenses WHERE id=?", (id,))
    db.commit()
    return jsonify({"message": "Expense deleted"})
