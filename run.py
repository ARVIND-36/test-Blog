from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    # Use 0.0.0.0 to allow external connections (required for Docker)
    host = os.environ.get("FLASK_HOST", "127.0.0.1")
    port = int(os.environ.get("FLASK_PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(host=host, port=port, debug=debug)
