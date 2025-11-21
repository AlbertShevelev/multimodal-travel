import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export async function searchFlights(from, to, date, returnDate) {
  const res = await api.get("/search", {
    params: { from, to, date, returnDate },
  });
  return res.data;
}

export async function bookTicket(payload) {
  const res = await api.post("/book", payload);
  return res.data;
}

export async function bookRoundTrip({ outbound, inbound, passenger }) {
  if (!outbound || !inbound) {
    throw new Error("Missing outbound/inbound");
  }
  const res = await api.post("/book-roundtrip", {
    outbound,
    inbound,
    passenger,
  });
  return res.data;
}

export async function fetchCities() {
  const res = await api.get("/cities");
  return res.data;
}
