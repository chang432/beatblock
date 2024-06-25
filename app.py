from flask import Flask, render_template
app = Flask(__name__, template_folder='frontend/dist', static_folder='frontend/dist/assets')

@app.route('/')
def serve():
    return render_template('index.html')