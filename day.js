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

const futureUrl = "https://www.taifex.com.tw/cht/3/futContractsDate";
const optionUrl = "https://www.taifex.com.tw/cht/3/callsAndPutsDate";

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

  const fitDealerLongCount = getHtmlContent(mergeContent($, 4, 4, "c"));
  const fitForeignLongCount = getHtmlContent(mergeContent($, 6, 2, "c"));
  const fitLongCount = fitDealerLongCount + fitForeignLongCount;

  const fitDealerShortCount = getHtmlContent(mergeContent($, 4, 6, "c"));
  const fitForeignShortCount = getHtmlContent(mergeContent($, 6, 4, "c"));
  const fitShortCount = fitDealerShortCount + fitForeignShortCount;

  const fitNetCount = fitLongCount - fitShortCount;

  const fimtDealerLongCount = getHtmlContent(mergeContent($, 13, 4, "c"));
  const fimtForeignLongCount = getHtmlContent(mergeContent($, 15, 2, "c"));
  const fimtLongCount = fimtDealerLongCount + fimtForeignLongCount;

  const fimtDealerShortCount = getHtmlContent(mergeContent($, 13, 6, "c"));
  const fimtForeignShortCount = getHtmlContent(mergeContent($, 15, 4, "c"));
  const fimtShortCount = fimtDealerShortCount + fimtForeignShortCount;

  const fimtNetCount = fimtLongCount - fimtShortCount;

  const fLongCount = fitLongCount + convertFimt2Fit(fimtLongCount);
  const fLongCountText = Math.round(fLongCount);

  const fShortCount = fitShortCount + convertFimt2Fit(fimtShortCount);
  const fShortCountText = Math.round(fShortCount);

  const fitDealerLongMoney = getHtmlContent(mergeContent($, 4, 5, "m"));
  const fitForeignLongMoney = getHtmlContent(mergeContent($, 6, 3, "m"));
  const fitDealerShortMoney = getHtmlContent(mergeContent($, 4, 7, "m"));
  const fitForeignShortMoney = getHtmlContent(mergeContent($, 6, 5, "m"));
  const fitLongMoney = fitDealerLongMoney + fitForeignLongMoney;
  const fitShortMoney = fitDealerShortMoney + fitForeignShortMoney;

  const fimtDealerLongMoney = getHtmlContent(mergeContent($, 13, 5, "m"));
  const fimtForeignLongMoney = getHtmlContent(mergeContent($, 15, 3, "m"));
  const fimtDealerShortMoney = getHtmlContent(mergeContent($, 13, 7, "m"));
  const fimtForeignShortMoney = getHtmlContent(mergeContent($, 15, 5, "m"));
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

  const oiFitDealerNetCount = getHtmlContent(mergeContent($, 4, 14));
  const oiFitForeignNetCount = getHtmlContent(mergeContent($, 6, 12));
  const oiFimtDealerNetCount = getHtmlContent(mergeContent($, 13, 14));
  const oiFimtForeignNetCount = getHtmlContent(mergeContent($, 15, 12));
  const oiFitNetCount = oiFitDealerNetCount + oiFitForeignNetCount;
  const oiFimtNetCount = oiFimtDealerNetCount + oiFimtForeignNetCount;
  const oiFNetCount = Math.round(
    oiFitNetCount + convertFimt2Fit(oiFimtNetCount)
  );

  const oiFitDealerNetMoney = getHtmlContent(mergeContent($, 4, 15));
  const oiFitForeignNetMoney = getHtmlContent(mergeContent($, 6, 13));
  const oiFimtDealerNetMoney = getHtmlContent(mergeContent($, 13, 15));
  const oiFimtForeignNetMoney = getHtmlContent(mergeContent($, 15, 13));
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
  const callLongCost = Math.round((callLongMoney / callLongCount) * 20);
  const putLongCost = Math.round((putLongMoney / putLongCount) * 20);

  const callShortCost = Math.round((callShortMoney / callShortCount) * 20);
  const putShortCost = Math.round((putShortMoney / putShortCount) * 20);

  const callNetCount = callLongCount - callShortCount;
  const callNetMoney = callLongMoney - callShortMoney;

  const callNetCost = calCallNetCost(callNetMoney, callNetCount);
  // console.log({ callNetCount });
  // console.log({ callNetMoney });

  const putNetCount = putLongCount - putShortCount;
  const putNetMoney = putLongMoney - putShortMoney;

  const putNetCost = calPutNetCost(putNetMoney, putNetCount);

  const oiCallDealerNetCount = getHtmlContent(mergeContent($, 4, 15, "c", "o"));
  const oiCallForeignNetCount = getHtmlContent(
    mergeContent($, 6, 12, "c", "o")
  );

  const oiCallNetCount = oiCallDealerNetCount + oiCallForeignNetCount;

  const oiPutDealerNetCount = getHtmlContent(mergeContent($, 7, 13, "c", "o"));
  const oiPutForeignNetCount = getHtmlContent(mergeContent($, 9, 12, "c", "o"));
  const oiPutNetCount = oiPutDealerNetCount + oiPutForeignNetCount;

  const oiCallDealerNetMoney = getHtmlContent(mergeContent($, 4, 16, "m", "o"));
  const oiCallForeignNetMoney = getHtmlContent(
    mergeContent($, 6, 13, "m", "o")
  );
  const oiCallNetMoney = oiCallDealerNetMoney + oiCallForeignNetMoney;
  const oiCallNetCost = calCallNetCost(oiCallNetMoney, oiCallNetCount);
  console.log({ oiCallNetMoney });
  console.log({ oiCallNetCount });

  const oiPutDealerNetMoney = getHtmlContent(mergeContent($, 7, 14, "m", "o"));
  const oiPutForeignNetMoney = getHtmlContent(mergeContent($, 9, 13, "m", "o"));
  const oiPutNetMoney = oiPutDealerNetMoney + oiPutForeignNetMoney;

  const oiPutNetCost = calPutNetCost(oiPutNetMoney, oiPutNetCount);

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
