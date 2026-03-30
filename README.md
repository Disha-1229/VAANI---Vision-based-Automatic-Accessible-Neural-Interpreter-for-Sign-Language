# VAANI

Vision-based Automatic Accessible Neural Interpreter for Sign Language.

## Project Structure

```text
VAANI/
  backend/
    app.py
    requirements.txt
    model/
      best.pt                # add your trained model here
    utils/
      __init__.py
      prediction.py
    static/
      gifs/
        A.gif ... Z.gif      # add finger spelling GIFs
  frontend/
    package.json
    index.html
    vite.config.js
    src/
      main.jsx
      App.jsx
      api.js
      styles.css
      pages/
        HomePage.jsx
        LiveDetectionPage.jsx
```

## Backend Setup (Flask + YOLO)

1. Open terminal:
   - `cd backend`
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Add model file:
   - Place `best.pt` in `backend/model/best.pt`
4. Add GIF assets:
   - Put `A.gif` to `Z.gif` in `backend/static/gifs/`
5. Run:
   - `python app.py`

Backend runs at `http://localhost:5000`

## Frontend Setup (React + Vite)

1. Open terminal:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Run:
   - `npm run dev`

Frontend runs at `http://localhost:5173`

## API

- `POST /predict`
  - Body JSON:
    - `{ "image": "<base64 data URL>" }`
  - Response:
    - `{ "label": "A", "confidence": 0.95, "gif_url": "/static/gifs/A.gif" }`

- `GET /health`
  - Returns server health and selected device.

- WebSocket (optional):
  - `ws://localhost:5000/ws/predict`
  - Send base64 image (data URL string), receive JSON response.
