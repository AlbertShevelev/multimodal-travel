const axios = require("axios");
const https = require("https");

const GARS_API_URL = "https://avibus.gars-ykt.ru:4443/avitest/odata/standard.odata/";
const GARS_API_USER = "ХАКАТОН";
const GARS_API_PASS = "123456";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const garsApi = axios.create({
  baseURL: GARS_API_URL,
  httpsAgent,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization:
      "Basic " +
      Buffer.from(`${GARS_API_USER}:${GARS_API_PASS}`).toString("base64"),
  },
});

// -------- маршруты ----------
async function getRoutes() {
  const url = encodeURI("/Catalog_Маршруты?$format=json");
  const res = await garsApi.get(url);
  return res.data;
}

// -------- рейсы по дате (АктуальныеРейсы) ----------
async function getFlightsByDate(dateFrom, dateTo) {
  const filter =
    `InformationRegister_АктуальныеРейсы?` +
    `$filter=` +
    `ДатаДействия ge datetime'${dateFrom}T00:00:00' and ` +
    `ДатаДействия le datetime'${dateTo}T23:59:59'` +
    `&$format=json`;

  const url = encodeURI(filter);
  const res = await garsApi.get(url);
  return res.data;
}

// -------- автобусы ----------
async function getBuses() {
  const url = encodeURI("/Catalog_Автобусы?$format=json");
  const res = await garsApi.get(url);
  return res.data;
}

// -------- остановки ----------
async function getStops() {
  const url = encodeURI("/Catalog_Остановки?$format=json");
  const res = await garsApi.get(url);
  return res.data;
}

// -------- действующие тарифы ----------
async function getActiveTariffs() {
  const url = encodeURI("/InformationRegister_ДействующиеТарифы?$format=json");
  const res = await garsApi.get(url);
  return res.data;
}

// -------- перевозчики ----------
async function getCarriers() {
  const url = encodeURI("/Catalog_Перевозчики?$format=json");
  const res = await garsApi.get(url);
  return res.data;
}

// -------- расписания рейсов ----------
async function getSchedules() {
  const url = encodeURI("/Catalog_РейсыРасписания?$format=json");
  const res = await garsApi.get(url);
  return res.data;
}

/**
 * Создание заказа на бронирование билета
 * ВАЖНО:
 * - Поле "Рейс" в 1С полиморфное, поэтому нужно отправлять Рейс + Рейс_Type
 * - ПунктНазначения тоже полиморфный => ПунктНазначения + ПунктНазначения_Type
 *
 * Ожидаем, что из поиска прилетает scheduleKey (Ref_Key расписания)
 */
async function createBookingOrder(payload = {}) {
  const {
    fromStopKey,
    toStopKey,
    scheduleKey, // <-- НОВОЕ, обязательно!
    routeName,   // можно хранить для UI, но в 1С это НЕ ключ
    departureDateTime,
    arrivalDateTime,
    price,
    passenger,
    seatNumber = 1,

    // временно фиксированный тариф
    tariffKey = "8bc3c8bf-013d-11ef-bba8-00505601092d",
  } = payload;

  const missing = [];
  if (!fromStopKey) missing.push("fromStopKey");
  if (!toStopKey) missing.push("toStopKey");
  if (!scheduleKey) missing.push("scheduleKey");
  if (!departureDateTime) missing.push("departureDateTime");
  if (price == null || price <= 0) missing.push("price");
  if (!passenger) missing.push("passenger");

  if (missing.length) {
    throw new Error("Missing required booking fields: " + missing.join(", "));
  }


  const body = {
    Date: new Date().toISOString(),

    ПокупательИмя: passenger.name,
    ПокупательТелефон: passenger.phone,
    ПокупательЭлектроннаяПочта: passenger.email,

    ПунктОтправления_Key: fromStopKey,

    // пункт назначения полиморфный:
    ПунктНазначения: toStopKey,
    ПунктНазначения_Type: "StandardODATA.Catalog_Остановки",

    // Рейс полиморфный:
    Рейс: routeName,
    Рейс_Type: "Edm.String",

    ВремяОтправления: departureDateTime,
    ВремяПрибытия: arrivalDateTime || null,

    СуммаЗаказа: price,
    СтоимостьБронирования: price,
    Оплачен: false,

    // Табличная часть "Билеты"
    Билеты: [
      {
        LineNumber: "1",
        Active: true,

        ПунктОтправления_Key: fromStopKey,

        ПунктНазначения: toStopKey,
        ПунктНазначения_Type: "StandardODATA.Catalog_Остановки",

        Рейс_Key: scheduleKey,    // Guid поле строки билета
        ВидТарифа_Key: tariffKey,

        НомерМеста: seatNumber,
        СтоимостьБилета: price,
        Тариф: price,
      },
    ],
  };

  const url = encodeURI("/Document_ЗаказБилетовИУслуг?$format=json");
  const res = await garsApi.post(url, body);
  return res.data;
}

module.exports = {
  garsApi,
  getRoutes,
  getFlightsByDate,
  getActiveTariffs,
  getStops,
  getSchedules,
  getBuses,
  getCarriers,
  createBookingOrder,
};
