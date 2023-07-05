const axios = require("axios");
const cheerio = require("cheerio");
const specDate = process.argv[2];
console.log({ specDate });


const sitePath = "https://www.taifex.com.tw/cht/3/futContractsDate";


const getUrl = (specDate) => {
  if (!specDate) return sitePath;
  const month = specDate.slice(0, 2);
  const date = specDate.slice(2);
  const reqCondition = `?queryType=1&goDay=&doQuery=1&dateaddcnt=&queryDate=2023%2F${month}%2F${date}&commodityId=`;
  return sitePath + reqCondition;
}
const url = getUrl(specDate);
const toNumber = (content) => Number(content.replace(/[^0-9.-]+/g, ""));
const getHtmlContent = (content) => toNumber(content.text());
const tableContentPath4Count = '> div:nth-child(1) > font';
const tableContentPath4Money = '> div:nth-child(1)';
const isCount = (param) => param === 'c';

const tablePath = "#printhere > div:nth-child(4) > table > tbody > tr:nth-child(2) > td > table > tbody";
const getTableContent = (param1, param2) => `> tr:nth-child(${param1}) > td:nth-child(${param2})`;
const mergeContent = (domEle, param1, param2, param3) => {
  // console.log(`${tablePath} ${getTableContent(param1, param2)} ${isCount(param3) ? tableContentPath4Count : tableContentPath4Money}`)
  return domEle(`${tablePath} ${getTableContent(param1, param2)} ${isCount(param3) ? tableContentPath4Count : tableContentPath4Money}`)
};
const convertFimt2Fit = (fimt) => fimt / 4;
// const payload = { queryType: 1, doQuery: 1, queryDate: '2023/07/03' }
axios
  .request(url)
  .then((response) => {
    const $ = cheerio.load(response.data);
    // console.log($);

    // const fitTablePath = `${tablePath} > td > table > tbody`;


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

    const fLongCount = fitLongCount + convertFimt2Fit(fimtLongCount);
    const fShortCount = fitShortCount + convertFimt2Fit(fimtShortCount);
    // console.log(fitDealerLongCount);
    // console.log(fitForeignLongCount);
    // console.log(fitLongCount);
    // console.log(fitDealerShortCount);
    // console.log(fitForeignShortCount);
    // console.log(fitShortCount);

    // console.log({ fitNetCount });

    // console.log({ fimtDealerLongCount });
    // console.log({ fimtLongCount });
    // console.log({ fimtShortCount });
    // console.log({ fimtNetCount });
    // console.log({ fLongCount });
    // console.log({ fShortCount });

    fNetCount = fLongCount - fShortCount;
    // console.log({ fNetCount });

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
    // console.log({ fitDealerLongMoney });
    // console.log({ fitForeignLongMoney });
    // console.log({ fitLongMoney });
    // console.log({ fitShortMoney });

    // console.log({ fimtDealerLongMoney });
    // console.log({ fimtForeignLongMoney });

    // console.log({ fimtLongMoney });
    // console.log({ fimtShortMoney });
    // console.log({ fitDealerShortMoney });
    // console.log({ fitForeignShortMoney });

    console.log({ fLongMoney });
    console.log({ fLongCount });
    console.log({ fShortMoney });
    console.log({ fShortCount });

    // 千元與一點兩百元 => *1000 /200 = 5 
    const fLongCost = Math.round(fLongMoney / fLongCount * 5);
    const fShortCost = Math.round(fShortMoney / fShortCount * 5);

    console.log({ fLongCost });
    console.log({ fShortCost });
  })

  .catch((error) => {
    console.log(error);
  });
