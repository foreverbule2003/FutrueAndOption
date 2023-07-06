const cheerio = require("cheerio");
const {
  convertData2Csv,
  queryData,
  getHtmlContent,
} = require('./helper')

const specDate = process.argv[2];
console.log({ specDate });

const futureUrl = "https://www.taifex.com.tw/cht/3/futContractsDate";
const optionUrl = 'https://www.taifex.com.tw/cht/3/callsAndPutsDate';

const getUrl = (url) => {
  if (!specDate) return url;
  const month = specDate.slice(0, 2);
  const date = specDate.slice(2);
  const reqCondition = `?queryType=1&goDay=&doQuery=1&dateaddcnt=&queryDate=2023%2F${month}%2F${date}&commodityId=`;
  return `${url}${reqCondition}`;
};

const fTableContentPath4Count = '> div:nth-child(1) > font';
const fTableContentPath4Money = '> div:nth-child(1)';
const oTableContentPath4Count = '> font';
const oTableContentPath4Money = '';
const isCount = (param) => param === 'c';

const tablePath = "#printhere > div:nth-child(4) > table > tbody > tr:nth-child(2) > td > table > tbody";

const getTableContent = (param1, param2) => `> tr:nth-child(${param1}) > td:nth-child(${param2})`;

// product: future or option
// type: count or money
const mergeContent = (domEle, param1, param2, type, product = 'f') => {
  const domPath = product === 'f'
    ? `${tablePath} ${getTableContent(param1, param2)} ${isCount(type) ? fTableContentPath4Count : fTableContentPath4Money}`
    : `${tablePath} ${getTableContent(param1, param2)} ${isCount(type) ? oTableContentPath4Count : oTableContentPath4Money}`
  // console.log({ domPath });
  const result = domEle(domPath);
  // console.log(result);
  return result;
};
const convertFimt2Fit = (fimt) => fimt / 4;

let data = [];
const getFutureData = queryData(getUrl(futureUrl))
  .then((response) => {

    const $ = cheerio.load(response);
    const fitDealerLongCount = getHtmlContent(mergeContent($, 4, 4, 'c'));
    const fitForeignLongCount = getHtmlContent(mergeContent($, 6, 2, 'c'));
    const fitLongCount = fitDealerLongCount + fitForeignLongCount;

    const fitDealerShortCount = getHtmlContent(mergeContent($, 4, 6, 'c'));
    const fitForeignShortCount = getHtmlContent(mergeContent($, 6, 4, 'c'));
    const fitShortCount = fitDealerShortCount + fitForeignShortCount;

    const fitNetCount = fitLongCount - fitShortCount;

    const fimtDealerLongCount = getHtmlContent(mergeContent($, 13, 4, 'c'));
    const fimtForeignLongCount = getHtmlContent(mergeContent($, 15, 2, 'c'));
    const fimtLongCount = fimtDealerLongCount + fimtForeignLongCount;

    const fimtDealerShortCount = getHtmlContent(mergeContent($, 13, 6, 'c'));
    const fimtForeignShortCount = getHtmlContent(mergeContent($, 15, 4, 'c'));
    const fimtShortCount = fimtDealerShortCount + fimtForeignShortCount;

    const fimtNetCount = fimtLongCount - fimtShortCount;

    const fLongCount = Math.round(fitLongCount + convertFimt2Fit(fimtLongCount));
    const fShortCount = Math.round(fitShortCount + convertFimt2Fit(fimtShortCount));

    const fitDealerLongMoney = getHtmlContent(mergeContent($, 4, 5, 'm'));
    const fitForeignLongMoney = getHtmlContent(mergeContent($, 6, 3, 'm'));
    const fitDealerShortMoney = getHtmlContent(mergeContent($, 4, 7, 'm'));
    const fitForeignShortMoney = getHtmlContent(mergeContent($, 6, 5, 'm'));
    const fitLongMoney = fitDealerLongMoney + fitForeignLongMoney;
    const fitShortMoney = fitDealerShortMoney + fitForeignShortMoney;

    const fimtDealerLongMoney = getHtmlContent(mergeContent($, 13, 5, 'm'));
    const fimtForeignLongMoney = getHtmlContent(mergeContent($, 15, 3, 'm'));
    const fimtDealerShortMoney = getHtmlContent(mergeContent($, 13, 7, 'm'));
    const fimtForeignShortMoney = getHtmlContent(mergeContent($, 15, 5, 'm'));
    const fimtLongMoney = fimtDealerLongMoney + fimtForeignLongMoney;
    const fimtShortMoney = fimtDealerShortMoney + fimtForeignShortMoney;

    const fLongMoney = fitLongMoney + fimtLongMoney;
    const fShortMoney = fitShortMoney + fimtShortMoney;

    // 千元與一點兩百元 => *1000 /200 = 5 
    const fLongCost = Math.round(fLongMoney / fLongCount * 5);
    const fShortCost = Math.round(fShortMoney / fShortCount * 5);

    // console.log({ fLongCost });
    // console.log({ fShortCost });
    const fNetCount = Math.round(fLongCount - fShortCount);
    const fNetMoney = Math.round(fLongMoney - fShortMoney);
    const fNetCost = Math.round(fNetMoney / fNetCount * 5);
    const future = {
      商品: '期貨',
      買方口數: fLongCount,
      買方成本: fLongCost,
      賣方口數: fShortCount,
      賣方成本: fShortCost,
      淨口數: fNetCount,
      淨成本: fNetCost,
    };
    data = [...data, future];
  });

const getOptionData = queryData(getUrl(optionUrl))
  .then((response) => {
    const $ = cheerio.load(response);

    const callDealerLongCount = getHtmlContent(mergeContent($, 4, 5, 'c', 'o'));
    const callForeignLongCount = getHtmlContent(mergeContent($, 6, 2, 'c', 'o'));
    const callLongCount = callDealerLongCount + callForeignLongCount;

    const putDealerLongCount = getHtmlContent(mergeContent($, 7, 3, 'c', 'o'));
    const putForeignLongCount = getHtmlContent(mergeContent($, 9, 2, 'c', 'o'));
    const putLongCount = putDealerLongCount + putForeignLongCount;

    const callDealerShortCount = getHtmlContent(mergeContent($, 4, 7, 'c', 'o'));
    const callForeignShortCount = getHtmlContent(mergeContent($, 6, 4, 'c', 'o'));
    const callShortCount = callDealerShortCount + callForeignShortCount;

    const putDealerShortCount = getHtmlContent(mergeContent($, 7, 5, 'c', 'o'));
    const putForeignShortCount = getHtmlContent(mergeContent($, 9, 4, 'c', 'o'));
    const putShortCount = putDealerShortCount + putForeignShortCount;

    const callDealerLongMoney = getHtmlContent(mergeContent($, 4, 6, 'm', 'o'));
    const callForeignLongMoney = getHtmlContent(mergeContent($, 6, 3, 'm', 'o'));
    const callLongMoney = callDealerLongMoney + callForeignLongMoney;

    const putDealerLongMoney = getHtmlContent(mergeContent($, 7, 4, 'm', 'o'));
    const putForeignLongMoney = getHtmlContent(mergeContent($, 9, 3, 'm', 'o'));
    const putLongMoney = putDealerLongMoney + putForeignLongMoney;

    const callDealerShortMoney = getHtmlContent(mergeContent($, 4, 8, 'm', 'o'));
    const callForeignShortMoney = getHtmlContent(mergeContent($, 6, 5, 'm', 'o'));
    const callShortMoney = callDealerShortMoney + callForeignShortMoney;

    const putDealerShortMoney = getHtmlContent(mergeContent($, 7, 6, 'm', 'o'));
    const putForeignShortMoney = getHtmlContent(mergeContent($, 9, 5, 'm', 'o'));
    const putShortMoney = putDealerShortMoney + putForeignShortMoney;

    // 千元與一點五十元 => *1000 /50 = 20 
    const callLongCost = Math.round(callLongMoney / callLongCount * 20);
    const putLongCost = Math.round(putLongMoney / putLongCount * 20);

    const callShortCost = Math.round(callShortMoney / callShortCount * 20);
    const putShortCost = Math.round(putShortMoney / putShortCount * 20);

    const callNetCount = callLongCount - callShortCount;
    const callNetMoney = callLongMoney - callShortMoney;
    const callNetCost = Math.round(callNetMoney / callNetCount * 20);

    const putNetCount = putLongCount - putShortCount;
    const putNetMoney = putLongMoney - putShortMoney;
    const putNetCost = Math.round(putNetMoney / putNetCount * 20);
    const call = {
      商品: 'CALL',
      買方口數: callLongCount,
      買方成本: callLongCost,
      賣方口數: callShortCount,
      賣方成本: callShortCost,
      淨口數: callNetCount,
      淨成本: callNetCost,
    };
    const put = {
      商品: 'PUT',
      買方口數: putLongCount,
      買方成本: putLongCost,
      賣方口數: putShortCount,
      賣方成本: putShortCost,
      淨口數: putNetCount,
      淨成本: putNetCost,
    };
    data = [...data, put, call];
  });

Promise.all([
  getFutureData,
  getOptionData
])
  .then(() => {
    const sortData = data.reverse();
    convertData2Csv(sortData)
  });
