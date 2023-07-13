const ObjectsToCsv = require("objects-to-csv");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const {
  tablePath,
  fTableContentPath4Count,
  fTableContentPath4Money,
  oTableContentPath4Count,
  oTableContentPath4Money,
} = require("./const");

const convertData2Csv = (data) => {
  (async () => {
    const csv = new ObjectsToCsv(data);
    const date = new Date();

    // month start from 0
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    let dd = String(date.getDate()).padStart(2, "0");
    const yesterday = String(date.getDate() - 1).padStart(2, "0");
    const tomorrow = String(date.getDate() + 1).padStart(2, "0");
    let specficDay = process.argv[2];

    // 盤中只能抓到昨天的資料
    const isDayTradingTime = date.getHours() > 9 && date.getHours() < 14;
    const isNightTradingTime = date.getHours() > 15 && date.getHours() < 5;

    if (!specficDay && isDayTradingTime) dd = yesterday;
    if (!specficDay && isNightTradingTime) dd = yesterday;

    // 盤中只能抓到昨天的資料

    // 有指定日期要顯示指定日期，無指定預設為今日
    let fileDay = specficDay ? specficDay : `${mm}${dd}`;

    const filePath = process.argv[1];
    const execfileName = path.basename(filePath);

    let fileName;
    const isGetDayTradingData = execfileName === "day.js";

    isGetDayTradingData
      ? (fileName = `./${fileDay}盤後回顧`)
      : (fileName = `./${fileDay}盤前回顧(昨夜交易資料)`);

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
const getHtmlContent = (content) => {
  const result = mergeContent(...content).text();
  return toNumber(result);
};
const convertFimt2Fit = (fimt) => fimt / 4;

const getTableContent = (param1, param2) =>
  `> tr:nth-child(${param1}) > td:nth-child(${param2})`;

const isCount = (param) => param === "count";

const mergeContent = (domEle, param1, param2, type, product = "future") => {
  const domPath =
    product === "future"
      ? `${tablePath} ${getTableContent(param1, param2)} ${
          isCount(type) ? fTableContentPath4Count : fTableContentPath4Money
        }`
      : `${tablePath} ${getTableContent(param1, param2)} ${
          isCount(type) ? oTableContentPath4Count : oTableContentPath4Money
        }`;
  // console.log({ domPath });
  const result = domEle(domPath);
  // console.log(result);
  return result;
};

const adjOp = (cost) => cost * -1;

// Call, netCount 正: BC，負: SC
// netMoney 的正負值和 BC、SC 的組合，解讀 netCost 的正負含意

// netCount  netMoney  netCount
// BC        為正      付出權利金比較多 => +
// BC        為負      收取權利金比較少(也就是付出) => -
// SC        為正      收取權利金比較多 => -
// SC        為負      付出權利金比較少 => +

// Put, netCount 正: BP，負: SP
// netMoney 的正負值和 BP、SP 的組合，解讀 netCost 的正負含意

// netCount  netMoney  netCount
// BP        為正      付出權利金比較多 => +
// BP        為負      收取權利金比較少(也就是付出) => -
// SP        為正      收取權利金比較多 => -
// SP        為負      付出權利金比較少 => +

const adjNetCost = (netMoney, netCount) => {
  let putNetCost = Math.round((netMoney / netCount) * 20);
  if (netCount < 0 && netMoney > 0) putNetCost = adjOp(putNetCost);
  if (netCount < 0 && netMoney < 0) putNetCost = adjOp(putNetCost);
  return putNetCost;
};

module.exports = {
  convertData2Csv,
  queryData,
  getHtmlContent,
  repData,
  getUrl,
  convertFimt2Fit,
  getTableContent,
  adjNetCost,
  isCount,
  mergeContent,
};
