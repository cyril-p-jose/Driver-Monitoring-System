from flask import Flask, render_template, jsonify
from ultralytics import YOLO
import cv2
import numpy as np
app = Flask(__name__)
model = YOLO("models/yolov8n.pt")

@app.route("/")
def home():
    return render_template("index.html")
    @app.route("/detect_objects", methods=["POST"])
def detect_objects():

    return jsonify({
        "phone": False,
        "seatbelt": True,
        "persons": 1
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
