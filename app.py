from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import boto3
import json
import os

os.environ["AWS_PROFILE"] = "beatblock"
app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')
CORS(app)

@app.route('/')
def serve():
    return render_template('index.html')

@app.route('/api/subsidize', methods=['POST'])
def subsidize():
    try:
        data = request.json
        target = data.get("target",None)
        if not target:
            raise Exception("'target' parameter required!")

        lambda_client = boto3.client("lambda")

        payload = {
            "state": "prod",
            "dry_run": True,
            "target": target
        }

        response = lambda_client.invoke(
            FunctionName="BeatBlockTransactionSubsidizer",
            Payload=json.dumps(payload)
        )

        response_payload = json.loads(response['Payload'].read())

        print("Response from Lambda:", response_payload)

        return jsonify({
            "status": "success",
            "message": str(response_payload)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })