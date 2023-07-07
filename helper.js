const ObjectsToCsv = require("objects-to-csv");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const convertData2Csv = (data) => {
  (async () => {
    const csv = new ObjectsToCsv(data);

    const date = new Date();

    // month start from 0
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    let dd = String(date.getDate()).padStart(2, "0");
    const yesterday = String(date.getDate() - 1).padStart(2, "0");
    const tomorrow = String(date.getDate() + 1).padStart(2, "0");
    // console.log({ mm });
    console.log({ dd });
    console.log({ tomorrow });
    let specficDay = process.argv[2];

    // 盤中只能抓到昨天的資料
    const isDayTradingTime = date.getHours() > 9 && date.getHours() < 14;
    const isNightTradingTime = date.getHours() > 15 && date.getHours() < 5;
    console.log({ isNightTradingTime });
    if (!specficDay && isDayTradingTime) dd = yesterday;
    // 盤中只能抓到昨天的資料
    let fileDay = `${mm}${dd}`;
    if (specficDay) fileDay = specficDay;

    const filePath = process.argv[1];
    const execfileName = path.basename(filePath);

    let fileName;
    execfileName === "day.js"
      ? (fileName = `./${fileDay}日盤`)
      : (fileName = `./${fileDay}夜盤`);

    // console.log({ execfileName });
    // console.log({ fileName });

    // Save to file:
    await csv.toDisk(`./${fileName}.csv`);
  })();
};

const queryData = async (url) => {
  let rusult;
  try {
    rusult = await axios.request(url);
  } catch (e) {
    console.log(e);
  }
  return rusult.data;
};

const getUrl = (url) => {
  const specDate = process.argv[2];
  if (!specDate) return url;
  const month = specDate.slice(0, 2);
  const date = specDate.slice(2);
  const reqCondition = `?queryType=1&goDay=&doQuery=1&dateaddcnt=&queryDate=2023%2F${month}%2F${date}&commodityId=`;
  return `${url}${reqCondition}`;
};

const repData = (response) => cheerio.load(response);
const toNumber = (content) => Number(content.replace(/[^0-9.-]+/g, ""));
const getHtmlContent = (content) => toNumber(content.text());
const convertFimt2Fit = (fimt) => fimt / 4;
const tablePath =
  "#printhere > div:nth-child(4) > table > tbody > tr:nth-child(2) > td > table > tbody";

const getTableContent = (param1, param2) =>
  `> tr:nth-child(${param1}) > td:nth-child(${param2})`;

module.exports = {
  convertData2Csv,
  queryData,
  getHtmlContent,
  repData,
  getUrl,
  convertFimt2Fit,
  tablePath,
  getTableContent,
};
