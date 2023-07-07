const {
  convertData2Csv,
  queryData,
  getHtmlContent,
  repData,
  getUrl,
  convertFimt2Fit,
  tablePath,
  getTableContent,
  calCallNetCost,
  calPutNetCost,
} = require("./helper");

const futureUrl = "https://www.taifex.com.tw/cht/3/futContractsDateAh";
const optionUrl = "https://www.taifex.com.tw/cht/3/callsAndPutsDateAh";

const fTableContentPath4Count = "> div:nth-child(1) > font";
const fTableContentPath4Money = "> div:nth-child(1)";
const oTableContentPath4Count = "> font";
const oTableContentPath4Money = "";
const isCount = (param) => param === "c";

// product: future or option
// type: count or money
const mergeContent = (domEle, param1, param2, type, product = "f") => {
  const domPath =
    product === "f"
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

let data = [];

const getFutureData = queryData(getUrl(futureUrl)).then((response) => {
  const $ = repData(response);

  const fitDealerNetCount = getHtmlContent(mergeContent($, 4, 8, "c"));
  const fitForeignNetCount = getHtmlContent(mergeContent($, 6, 6, "c"));

  const fitNetCount = fitDealerNetCount + fitForeignNetCount;
  //   console.log({ fitNetCount });

  const fimtDealerNetCount = getHtmlContent(mergeContent($, 10, 8, "c"));
  const fimtForeignNetCount = getHtmlContent(mergeContent($, 12, 6, "c"));

  const fimtNetCount = fimtDealerNetCount + fimtForeignNetCount;

  const fitDealerNetMoney = getHtmlContent(mergeContent($, 4, 9, "m"));
  const fitForeignNetMoney = getHtmlContent(mergeContent($, 6, 7, "m"));
  const fitNetMoney = fitDealerNetMoney + fitForeignNetMoney;

  //   console.log({ fitDealerNetMoney });
  //   console.log({ fitForeignNetMoney });

  const fimtDealerNetMoney = getHtmlContent(mergeContent($, 10, 9, "m"));
  const fimtForeignNetMoney = getHtmlContent(mergeContent($, 12, 7, "m"));
  const fimtNetMoney = fimtDealerNetMoney + fimtForeignNetMoney;
  // 千元與一點兩百元 => *1000 /200 = 5

  const fNetCount = fitNetCount + convertFimt2Fit(fimtNetCount);
  const fNetCountText = Math.round(fNetCount);
  const fNetMoney = fitNetMoney + fimtNetMoney;
  const fNetCost = Math.round((fNetMoney / fNetCount) * 5);
  const future = {
    商品: "期貨",
    淨口數: fNetCountText,
    淨成本: fNetCost,
  };
  data = [future, ...data];
});

const getOptionData = queryData(getUrl(optionUrl)).then((response) => {
  const $ = repData(response);

  const callDealerLongCount = getHtmlContent(mergeContent($, 4, 5, "c", "o"));
  const callForeignLongCount = getHtmlContent(mergeContent($, 6, 2, "c", "o"));

  const callLongCount = callDealerLongCount + callForeignLongCount;

  const putDealerLongCount = getHtmlContent(mergeContent($, 7, 3, "c", "o"));
  const putForeignLongCount = getHtmlContent(mergeContent($, 9, 2, "c", "o"));
  const putLongCount = putDealerLongCount + putForeignLongCount;

  const callDealerShortCount = getHtmlContent(mergeContent($, 4, 7, "c", "o"));
  const callForeignShortCount = getHtmlContent(mergeContent($, 6, 4, "c", "o"));
  const callShortCount = callDealerShortCount + callForeignShortCount;

  const putDealerShortCount = getHtmlContent(mergeContent($, 7, 5, "c", "o"));
  const putForeignShortCount = getHtmlContent(mergeContent($, 9, 4, "c", "o"));
  const putShortCount = putDealerShortCount + putForeignShortCount;

  const callDealerLongMoney = getHtmlContent(mergeContent($, 4, 6, "m", "o"));
  const callForeignLongMoney = getHtmlContent(mergeContent($, 6, 3, "m", "o"));
  const callLongMoney = callDealerLongMoney + callForeignLongMoney;

  const putDealerLongMoney = getHtmlContent(mergeContent($, 7, 4, "m", "o"));
  const putForeignLongMoney = getHtmlContent(mergeContent($, 9, 3, "m", "o"));
  const putLongMoney = putDealerLongMoney + putForeignLongMoney;

  const callDealerShortMoney = getHtmlContent(mergeContent($, 4, 8, "m", "o"));
  const callForeignShortMoney = getHtmlContent(mergeContent($, 6, 5, "m", "o"));
  const callShortMoney = callDealerShortMoney + callForeignShortMoney;

  const putDealerShortMoney = getHtmlContent(mergeContent($, 7, 6, "m", "o"));
  const putForeignShortMoney = getHtmlContent(mergeContent($, 9, 5, "m", "o"));
  const putShortMoney = putDealerShortMoney + putForeignShortMoney;

  // 千元與一點五十元 => *1000 /50 = 20

  const callNetCount = callLongCount - callShortCount;
  const callNetMoney = callLongMoney - callShortMoney;

  const callNetCost = calCallNetCost(callNetMoney, callNetCount);
  console.log({ callNetCount });
  console.log({ callNetMoney });

  const putNetCount = putLongCount - putShortCount;
  const putNetMoney = putLongMoney - putShortMoney;

  const putNetCost = calPutNetCost(putNetMoney, putNetCount);

  const call = {
    商品: "CALL",
    淨口數: callNetCount,
    淨成本: callNetCost,
  };
  const put = {
    商品: "PUT",
    淨口數: putNetCount,
    淨成本: putNetCost,
  };
  data = [...data, call, put];
});

Promise.all([getFutureData, getOptionData]).then(() => {
  const sortData = data.sort();
  convertData2Csv(sortData);
});
