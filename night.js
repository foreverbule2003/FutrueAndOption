const {
  convertData2Csv,
  queryData,
  getHtmlContent,
  repData,
  getUrl,
  convertFimt2Fit,
  adjNetCost,
} = require("./helper");

const futureUrl = "https://www.taifex.com.tw/cht/3/futContractsDateAh";
const optionUrl = "https://www.taifex.com.tw/cht/3/callsAndPutsDateAh";

let data = [];
const getFutureData = queryData(getUrl(futureUrl)).then((response) => {
  const $ = repData(response);

  const fitDealerNetCount = getHtmlContent([$, 4, 8, "count"]);
  const fitForeignNetCount = getHtmlContent([$, 6, 6, "count"]);

  const fitNetCount = fitDealerNetCount + fitForeignNetCount;
  //   console.log({ fitNetCount });

  const fimtDealerNetCount = getHtmlContent([$, 10, 8, "count"]);
  const fimtForeignNetCount = getHtmlContent([$, 12, 6, "count"]);

  const fimtNetCount = fimtDealerNetCount + fimtForeignNetCount;

  const fitDealerNetMoney = getHtmlContent([$, 4, 9, "money"]);
  const fitForeignNetMoney = getHtmlContent([$, 6, 7, "money"]);
  const fitNetMoney = fitDealerNetMoney + fitForeignNetMoney;

  //   console.log({ fitDealerNetMoney });
  //   console.log({ fitForeignNetMoney });

  const fimtDealerNetMoney = getHtmlContent([$, 10, 9, "money"]);
  const fimtForeignNetMoney = getHtmlContent([$, 12, 7, "money"]);
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

  const callDealerLongCount = getHtmlContent([$, 4, 5, "count", "option"]);
  const callForeignLongCount = getHtmlContent([$, 6, 2, "count", "option"]);

  const callLongCount = callDealerLongCount + callForeignLongCount;

  const putDealerLongCount = getHtmlContent([$, 7, 3, "count", "option"]);
  const putForeignLongCount = getHtmlContent([$, 9, 2, "count", "option"]);
  const putLongCount = putDealerLongCount + putForeignLongCount;

  const callDealerShortCount = getHtmlContent([$, 4, 7, "count", "option"]);
  const callForeignShortCount = getHtmlContent([$, 6, 4, "count", "option"]);
  const callShortCount = callDealerShortCount + callForeignShortCount;

  const putDealerShortCount = getHtmlContent([$, 7, 5, "count", "option"]);
  const putForeignShortCount = getHtmlContent([$, 9, 4, "count", "option"]);
  const putShortCount = putDealerShortCount + putForeignShortCount;

  const callDealerLongMoney = getHtmlContent([$, 4, 6, "money", "option"]);
  const callForeignLongMoney = getHtmlContent([$, 6, 3, "money", "option"]);
  const callLongMoney = callDealerLongMoney + callForeignLongMoney;

  const putDealerLongMoney = getHtmlContent([$, 7, 4, "money", "option"]);
  const putForeignLongMoney = getHtmlContent([$, 9, 3, "money", "option"]);
  const putLongMoney = putDealerLongMoney + putForeignLongMoney;

  const callDealerShortMoney = getHtmlContent([$, 4, 8, "money", "option"]);
  const callForeignShortMoney = getHtmlContent([$, 6, 5, "money", "option"]);
  const callShortMoney = callDealerShortMoney + callForeignShortMoney;

  const putDealerShortMoney = getHtmlContent([$, 7, 6, "money", "option"]);
  const putForeignShortMoney = getHtmlContent([$, 9, 5, "money", "option"]);
  const putShortMoney = putDealerShortMoney + putForeignShortMoney;

  // 千元與一點五十元 => *1000 /50 = 20
  const callNetCount = callLongCount - callShortCount;
  const callNetMoney = callLongMoney - callShortMoney;

  const callNetCost = adjNetCost(callNetMoney, callNetCount);
  // console.log({ callNetCount });
  // console.log({ callNetMoney });

  const putNetCount = putLongCount - putShortCount;
  const putNetMoney = putLongMoney - putShortMoney;

  const putNetCost = adjNetCost(putNetMoney, putNetCount);

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
