from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict

# variable ~~ database
data_storage = []

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/")
def home():
    return jsonify({"status": "Server is running"}), 200

@app.route("/api/packages", methods=["POST"])
def receive_data():
    data = request.get_json()
    data_storage.append(data)
    return jsonify({"status": "received"}), 200

@app.route("/api/packages", methods=["GET"])
def get_data():
    return jsonify(data_storage)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    location_counts = defaultdict(int)
    activity_data = defaultdict(int)
    
    for pkg in data_storage:
        loc = (pkg['latitude'], pkg['longitude'])
        location_counts[loc] += 1
        activity_data[pkg['continent']] += 1
    
    return jsonify({
        'total_packages': len(data_storage),
        'suspicious_packages': sum(1 for p in data_storage if p.get('suspicious', 0)),
        'top_locations': [ {'lat': loc[0], 'lng': loc[1], 'count': count}
            for loc, count in sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:5]],
        'continents': [ {'continent': cont, 'count': count}
            for cont, count in sorted(activity_data.items(), key=lambda x: x[1], reverse=True)],
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

