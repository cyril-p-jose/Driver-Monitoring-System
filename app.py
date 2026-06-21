from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/detect_objects", methods=["POST"])
def detect_objects():

    return jsonify({
        "phone": False,
        "seatbelt": True,
        "persons": 1,
        "model_loaded": True
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
