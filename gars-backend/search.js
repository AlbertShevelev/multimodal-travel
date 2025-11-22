// gars-backend/search.js
const express = require("express");
const router = express.Router();

const { getStops, getSchedules, getActiveTariffs } = require("./garsService");

function formatTime(dtStr) {
  if (!dtStr) return "";
  const d = new Date(dtStr);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function combineDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  return `${dateStr}T${timeStr}:00`;
}

function flattenTariffs(tariffsData) {
  const out = [];
  for (const block of tariffsData.value || []) {
    if (Array.isArray(block.RecordSet)) out.push(...block.RecordSet);
  }
  return out;
}

// ---- главный помощник поиска one-way ----
async function searchOneWay(from, to, date) {
  const [stopsData, schedulesData, tariffsData] = await Promise.all([
    getStops(),
    getSchedules(),
    getActiveTariffs(),
  ]);

  const stops = stopsData.value || [];
  const schedules = schedulesData.value || [];
  const tariffs = flattenTariffs(tariffsData);

  const fromStop = stops.find(
    (x) => x.Description?.toLowerCase() === from.toLowerCase()
  );
  const toStop = stops.find(
    (x) => x.Description?.toLowerCase() === to.toLowerCase()
  );

  if (!fromStop || !toStop) return [];

  const fromStopKey = fromStop.Ref_Key;
  const toStopKey = toStop.Ref_Key;

  const results = [];

  for (const s of schedules) {
    const stopsInSchedule = s.Остановки || [];

    const fromIdx = stopsInSchedule.findIndex(
      (st) => st.Остановка_Key === fromStopKey
    );
    const toIdx = stopsInSchedule.findIndex(
      (st) => st.Остановка_Key === toStopKey
    );

    if (fromIdx === -1 || toIdx === -1) continue;
    if (fromIdx >= toIdx) continue;

    const fromSeg = stopsInSchedule[fromIdx];
    const toSeg = stopsInSchedule[toIdx];

    const departureTime = formatTime(fromSeg.ВремяОтправления || s.ВремяОтправления);
    const arrivalTime = formatTime(toSeg.ВремяПрибытия || s.ВремяПрибытия);

    const departureDateTime = combineDateTime(date, departureTime);
    const arrivalDateTime = combineDateTime(date, arrivalTime);

    const tariff = tariffs.find(
      (t) =>
        t.Маршрут_Key === s.Маршрут_Key &&
        t.ПунктОтправления_Key === fromStopKey &&
        t.ПунктНазначения_Key === toStopKey &&
        t.Active === true
    );

    const price = tariff ? tariff.Тариф : null;

    results.push({
      routeName: s.Description?.trim(),
      scheduleKey: s.Ref_Key, // <-- для брони в garsService
      from: fromStop.Description,
      to: toStop.Description,
      fromStopKey,
      toStopKey,
      departureTime,
      arrivalTime,
      departureDateTime,
      arrivalDateTime,
      duration: s.ВремяВПутиПредставление,
      price,
      carrierKey: s.Перевозчик_Key,
      busKey: s.Автобус_Key,
      transport: "bus",
    });
  }

  return results;
}

// ---- /api/search ----
// если нет returnDate -> { value: [...] }
// если есть returnDate -> { outbound:[...], return:[...] }
router.get("/search", async (req, res) => {
  try {
    const { from, to, date, returnDate } = req.query;
    if (!from || !to || !date) {
      return res.status(400).json({ error: "from, to, date are required" });
    }

    const outbound = await searchOneWay(from, to, date);

    if (!returnDate) {
      return res.json({ value: outbound });
    }

    const ret = await searchOneWay(to, from, returnDate);

    return res.json({
      outbound,
      return: ret,
    });
  } catch (e) {
    console.error("search error:", e?.response?.data || e);
    res.status(500).json({
      error: "Failed to search tickets",
      details: e?.response?.data || e.message,
    });
  }
});

module.exports = router;
