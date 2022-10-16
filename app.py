import json

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


API_KEY = "dc9fe71e-c95e-47d9-9e40-e01d09ee4bc0"
ENDPOINT = f"https://graphhopper.com/api/1/route?key={API_KEY}"
MAX_ZONES = 1000

DEG_PER_METER = 10**-5  # roughly lol
RECT_SIZE = 10 * DEG_PER_METER  # meters

with open("zones.json") as data:
    zones = json.loads(data.read())[:MAX_ZONES]

areas = {
    f"area{i}": {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        area["point"][1] - RECT_SIZE,
                        area["point"][0] - RECT_SIZE,
                    ],
                    [
                        area["point"][1] - RECT_SIZE,
                        area["point"][0] + RECT_SIZE,
                    ],
                    [
                        area["point"][1] + RECT_SIZE,
                        area["point"][0] - RECT_SIZE,
                    ],
                    [
                        area["point"][1] + RECT_SIZE,
                        area["point"][0] + RECT_SIZE,
                    ],
                    [
                        area["point"][1] - RECT_SIZE,
                        area["point"][0] - RECT_SIZE,
                    ],
                ]
            ],
        },
    }
    for i, area in enumerate(zones)
}

# SAFETY_PRIORITY = 0.5


def get_priority(safety_priority):
    return [
        {
            "if": f"in_area{i}",
            "multiply_by": str(area["safety"] * (1 - safety_priority))
            if safety_priority != 0
            else "1",
        }
        for i, area in enumerate(zones)
    ]


standard_payload = {
    "profile": "foot",
    "points_encoded": False,
    "instructions": False,
    "ch.disable": True,
    "custom_model": {"areas": areas},
}


@app.route("/get_points")
def get_points():
    return jsonify(zones)


# TODO: Flip point order?
@app.route("/route", methods=["POST"])
def route():
    data = json.loads(request.data)
    payload = standard_payload.copy()
    payload["points"] = data["points"]
    payload["custom_model"]["priority"] = get_priority(data["safety_priority"])
    resp = requests.post(ENDPOINT, json=payload)
    points = json.loads(resp.text)
    return jsonify(points["paths"][0]["points"]["coordinates"])
