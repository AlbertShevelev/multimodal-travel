const express = require("express");
const router = express.Router();

const {
  getRoutes,
  getActiveTariffs,
  getSchedules,
  getStops,
  createBookingOrder,
} = require("./garsService");

// /api/routes
router.get("/routes", async (req, res) => {
  try {
    const data = await getRoutes();
    res.json(data);
  } catch (e) {
    console.error("routes error:", e.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

// /api/stops
router.get("/stops", async (req, res) => {
  try {
    const data = await getStops();
    res.json(data);
  } catch (e) {
    console.error("stops error:", e.response?.data || e.message);
    res.status(500).json({ error: "failed to fetch stops" });
  }
});

// /api/schedules
router.get("/schedules", async (req, res) => {
  try {
    const data = await getSchedules();
    res.json(data);
  } catch (e) {
    console.error("schedules error:", e.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// /api/tariffs
router.get("/tariffs", async (req, res) => {
  try {
    const data = await getActiveTariffs();
    res.json(data);
  } catch (e) {
    console.error("tariffs error:", e.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch tariffs" });
  }
});

// /api/cities
router.get("/cities", async (req, res) => {
  try {
    const stopsRes = await getStops();
    const stops = stopsRes.value || [];

    const cities = stops
      .filter(s => !s.IsFolder && (s.НаселенныйПункт || s.Description))
      .map(s => (s.НаселенныйПункт || s.Description).trim())
      .filter(Boolean);

    const uniqueCities = [...new Set(cities)]
      .sort((a, b) => a.localeCompare(b, "ru"));

    res.json({ value: uniqueCities });
  } catch (e) {
    console.error("cities error:", e.response?.data || e.message);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

// /api/book
router.post("/book", async (req, res) => {
  try {
    const order = await createBookingOrder(req.body);
    res.json(order);
  } catch (e) {
    console.error("book error:", e.response?.data || e.message);
    res.status(500).json({
      error: "Failed to book ticket",
      details: e.response?.data || e.message,
    });
  }
});

router.post("/book-roundtrip", async (req, res) => {
  try {
    const body = req.body || {};
    const outbound =
      body.outbound || body.outboundTicket || body.out;
    const inbound =
      body.inbound || body.return || body.returnTicket || body.back;

    const passenger = body.passenger;

    if (!outbound || !inbound) {
      return res.status(400).json({ error: "Missing outbound/inbound" });
    }
    const outPayload = {
      ...outbound,
      passenger: outbound.passenger || passenger,
    };
    const inPayload = {
      ...inbound,
      passenger: inbound.passenger || passenger,
    };

    const outOrder = await createBookingOrder(outPayload);
    const inOrder = await createBookingOrder(inPayload);

    res.json({
      outboundOrder: outOrder,
      inboundOrder: inOrder,
    });
  } catch (e) {
    console.error("book-roundtrip error:", e.response?.data || e.message);
    res.status(500).json({
      error: "Failed to book roundtrip",
      details: e.response?.data || e.message,
    });
  }
});


module.exports = router;
