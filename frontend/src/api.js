import axios from "axios";

export const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

export async function predictFrame(imageData) {
  const response = await api.post("/predict", { image: imageData });
  return response.data;
}

export function getGifUrl(letter) {
  if (!letter || !/^[A-Za-z]$/.test(letter)) {
    return null;
  }
  return `${API_BASE_URL}/static/gifs/${letter.toUpperCase()}.gif`;
}
