const {
  convertData2Csv,
  queryData,
  getHtmlContent,
  repData,
  getUrl,
  convertFimt2Fit,
  adjNetCost,
} = require("./helper");

const futureUrl = "https://www.taifex.com.tw/cht/3/futContractsDate";
const optionUrl = "https://www.taifex.com.tw/cht/3/callsAndPutsDate";

let data = [];
const getFutureData = queryData(getUrl(futureUrl)).then((response) => {
  const $ = repData(response);

  const fitDealerLongCount = getHtmlContent([$, 4, 4, "count"]);
  const fitForeignLongCount = getHtmlContent([$, 6, 2, "count"]);
  const fitLongCount = fitDealerLongCount + fitForeignLongCount;

  const fitDealerShortCount = getHtmlContent([$, 4, 6, "count"]);
  const fitForeignShortCount = getHtmlContent([$, 6, 4, "count"]);
  const fitShortCount = fitDealerShortCount + fitForeignShortCount;

  // const fitNetCount = fitLongCount - fitShortCount;

  const fimtDealerLongCount = getHtmlContent([$, 13, 4, "count"]);
  const fimtForeignLongCount = getHtmlContent([$, 15, 2, "count"]);
  const fimtLongCount = fimtDealerLongCount + fimtForeignLongCount;

  const fimtDealerShortCount = getHtmlContent([$, 13, 6, "count"]);
  const fimtForeignShortCount = getHtmlContent([$, 15, 4, "count"]);
  const fimtShortCount = fimtDealerShortCount + fimtForeignShortCount;

  // const fimtNetCount = fimtLongCount - fimtShortCount;

  const fLongCount = fitLongCount + convertFimt2Fit(fimtLongCount);
  const fLongCountText = Math.round(fLongCount);

  const fShortCount = fitShortCount + convertFimt2Fit(fimtShortCount);
  const fShortCountText = Math.round(fShortCount);

  const fitDealerLongMoney = getHtmlContent([$, 4, 5, "money"]);
  const fitForeignLongMoney = getHtmlContent([$, 6, 3, "money"]);
  const fitDealerShortMoney = getHtmlContent([$, 4, 7, "money"]);
  const fitForeignShortMoney = getHtmlContent([$, 6, 5, "money"]);
  const fitLongMoney = fitDealerLongMoney + fitForeignLongMoney;
  const fitShortMoney = fitDealerShortMoney + fitForeignShortMoney;

  const fimtDealerLongMoney = getHtmlContent([$, 13, 5, "money"]);
  const fimtForeignLongMoney = getHtmlContent([$, 15, 3, "money"]);
  const fimtDealerShortMoney = getHtmlContent([$, 13, 7, "money"]);
  const fimtForeignShortMoney = getHtmlContent([$, 15, 5, "money"]);
  const fimtLongMoney = fimtDealerLongMoney + fimtForeignLongMoney;
  const fimtShortMoney = fimtDealerShortMoney + fimtForeignShortMoney;

  const fLongMoney = fitLongMoney + fimtLongMoney;
  const fShortMoney = fitShortMoney + fimtShortMoney;

  // 千元與一點兩百元 => *1000 /200 = 5
  const fLongCost = Math.round((fLongMoney / fLongCount) * 5);
  const fShortCost = Math.round((fShortMoney / fShortCount) * 5);

  // console.log({ fLongCost });
  // console.log({ fShortCost });
  const fNetCount = fLongCount - fShortCount;
  const fNetCountText = Math.round(fNetCount);

  const fNetMoney = fLongMoney - fShortMoney;
  const fNetCost = Math.round((fNetMoney / fNetCount) * 5);

  const oiFitDealerNetCount = getHtmlContent([$, 4, 14]);
  const oiFitForeignNetCount = getHtmlContent([$, 6, 12]);
  const oiFimtDealerNetCount = getHtmlContent([$, 13, 14]);
  const oiFimtForeignNetCount = getHtmlContent([$, 15, 12]);
  const oiFitNetCount = oiFitDealerNetCount + oiFitForeignNetCount;
  const oiFimtNetCount = oiFimtDealerNetCount + oiFimtForeignNetCount;
  const oiFNetCount = Math.round(
    oiFitNetCount + convertFimt2Fit(oiFimtNetCount)
  );

  const oiFitDealerNetMoney = getHtmlContent([$, 4, 15]);
  const oiFitForeignNetMoney = getHtmlContent([$, 6, 13]);
  const oiFimtDealerNetMoney = getHtmlContent([$, 13, 15]);
  const oiFimtForeignNetMoney = getHtmlContent([$, 15, 13]);
  const oiFitNetMoney = oiFitDealerNetMoney + oiFitForeignNetMoney;
  const oiFimtNetMoney = oiFimtDealerNetMoney + oiFimtForeignNetMoney;
  // console.log({ oiFitNetMoney });
  // console.log({ oiFimtNetMoney });
  const oiFNetMoney = Math.round(oiFitNetMoney + oiFimtNetMoney);

  const oiFNetCost = Math.round((oiFNetMoney / oiFNetCount) * 5);

  const future = {
    商品: "台指",
    買方口數: fLongCountText,
    買方成本: fLongCost,
    賣方口數: fShortCountText,
    賣方成本: fShortCost,
    日盤淨口數: fNetCountText,
    日盤淨成本: fNetCost,
    收盤價: "",
    未平倉淨口數: oiFNetCount,
    未平倉淨成本: oiFNetCost,
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
  const callLongCost = Math.round((callLongMoney / callLongCount) * 20);
  const putLongCost = Math.round((putLongMoney / putLongCount) * 20);

  const callShortCost = Math.round((callShortMoney / callShortCount) * 20);
  const putShortCost = Math.round((putShortMoney / putShortCount) * 20);

  const callNetCount = callLongCount - callShortCount;
  const callNetMoney = callLongMoney - callShortMoney;

  const callNetCost = adjNetCost(callNetMoney, callNetCount);
  // console.log({ callNetCount });
  // console.log({ callNetMoney });

  const putNetCount = putLongCount - putShortCount;
  const putNetMoney = putLongMoney - putShortMoney;

  const putNetCost = adjNetCost(putNetMoney, putNetCount);

  const oiCallDealerNetCount = getHtmlContent([$, 4, 15, "count", "option"]);
  const oiCallForeignNetCount = getHtmlContent([$, 6, 12, "count", "option"]);

  const oiCallNetCount = oiCallDealerNetCount + oiCallForeignNetCount;

  const oiPutDealerNetCount = getHtmlContent([$, 7, 13, "count", "option"]);
  const oiPutForeignNetCount = getHtmlContent([$, 9, 12, "count", "option"]);
  const oiPutNetCount = oiPutDealerNetCount + oiPutForeignNetCount;

  const oiCallDealerNetMoney = getHtmlContent([$, 4, 16, "money", "option"]);
  const oiCallForeignNetMoney = getHtmlContent([$, 6, 13, "money", "option"]);
  const oiCallNetMoney = oiCallDealerNetMoney + oiCallForeignNetMoney;
  const oiCallNetCost = adjNetCost(oiCallNetMoney, oiCallNetCount);
  // console.log({ oiCallNetMoney });
  // console.log({ oiCallNetCount });

  const oiPutDealerNetMoney = getHtmlContent([$, 7, 14, "money", "option"]);
  const oiPutForeignNetMoney = getHtmlContent([$, 9, 13, "money", "option"]);
  const oiPutNetMoney = oiPutDealerNetMoney + oiPutForeignNetMoney;

  const oiPutNetCost = adjNetCost(oiPutNetMoney, oiPutNetCount);

  const call = {
    商品: "CALL",
    買方口數: callLongCount,
    買方成本: callLongCost,
    賣方口數: callShortCount,
    賣方成本: callShortCost,
    日盤淨口數: callNetCount,
    日盤淨成本: callNetCost,
    收盤價: "",
    未平倉淨口數: oiCallNetCount,
    未平倉淨成本: oiCallNetCost,
  };
  const put = {
    商品: "PUT",
    買方口數: putLongCount,
    買方成本: putLongCost,
    賣方口數: putShortCount,
    賣方成本: putShortCost,
    日盤淨口數: putNetCount,
    日盤淨成本: putNetCost,
    收盤價: "",
    未平倉淨口數: oiPutNetCount,
    未平倉淨成本: oiPutNetCost,
  };
  data = [...data, call, put];
});

Promise.all([getFutureData, getOptionData]).then(() => {
  const sortData = data.sort();
  convertData2Csv(sortData);
});
