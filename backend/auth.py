from flask import Blueprint, request, jsonify
import jwt, datetime
from models import get_db

auth_bp = Blueprint("auth", __name__)
SECRET_KEY = "secret123"

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    db = get_db()
    db.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (data["username"], data["password"])
    )
    db.commit()
    return jsonify({"message": "User registered successfully"})


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    token = jwt.encode({
        "user": data["username"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({"token": token})
