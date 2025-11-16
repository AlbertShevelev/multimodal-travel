const axios = require('axios');
const https = require('https');

// данные для авторизации
const GARS_API_URL = 'https://avibus.gars-ykt.ru:4443/avitest/odata/standard.odata/';
const GARS_API_USER = 'ХАКАТОН';
const GARS_API_PASS = '123456';

// базовая конфигурация axios
const garsApi = axios.create({
  baseURL: GARS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization:
      'Basic ' + Buffer.from(`${GARS_API_USER}:${GARS_API_PASS}`).toString('base64'),
  }
});

async function getRoutes() {
  try {
    const url = encodeURI('/Catalog_Маршруты?$format=json');
    const response = await garsApi.get(url);
    return response.data;
  } catch (error) {
    console.error('ERROR getRoutes():', error.response?.data || error.message);
    throw new Error('Failed to fetch routes');
  }
}

async function getTariffs() {
  try {
    const url = encodeURI('/InformationRegister_ДействующиеТарифы?$format=json');
    const response = await garsApi.get(url);
    return response.data;
  } catch (error) {
    console.error('ERROR getTariffs():', error.response?.data || error.message);
    throw new Error('Failed to fetch tariffs');
  }
}

async function getFlightsByDate(startDate, endDate) {
  try {
    const url = encodeURI(
      `/Document_Рейс?$filter=Date ge datetime'${startDate}T00:00:00' and Date le datetime'${endDate}T23:59:59'&$format=json`
    );
    const response = await garsApi.get(url);
    return response.data;
  } catch (error) {
    console.error('ERROR getFlightsByDate():', error.response?.data || error.message);
    throw new Error('Failed to fetch flights');
  }
}

module.exports = {
  getRoutes,
  getTariffs,
  getFlightsByDate,
};
