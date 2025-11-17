import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export async function searchFlights(from, to, date) {
    const response = await fetch(
        `http://localhost:5000/api/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`
    );
    return response.json();
}


export async function getRoutes() {
  const res = await api.get('/routes');
  return res.data.value || [];
}
