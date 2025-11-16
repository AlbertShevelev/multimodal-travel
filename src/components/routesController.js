const express = require('express');
const router = express.Router();

const {
  getRoutes,
  getTariffs,
  getFlightsByDate,
} = require('./garsService');

router.get('/routes', async (req, res) => {
  try {
    const data = await getRoutes();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tariffs', async (req, res) => {
  try {
    const data = await getTariffs();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/flights', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getFlightsByDate(startDate, endDate);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
