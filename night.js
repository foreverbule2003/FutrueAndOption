const {
  convertData2Csv,
  queryData,
  getHtmlContent,
  repData,
  getUrl,
  convertFimt2Fit,
  getTableContent,
  adjNetCost,
  isCount,
} = require("./helper");

const {
  tablePath,
  fTableContentPath4Count,
  fTableContentPath4Money,
  oTableContentPath4Count,
  oTableContentPath4Money,
} = require("./const");

const futureUrl = "https://www.taifex.com.tw/cht/3/futContractsDateAh";
const optionUrl = "https://www.taifex.com.tw/cht/3/callsAndPutsDateAh";

// product: future or option
// type: count or money
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

let data = [];

const getFutureData = queryData(getUrl(futureUrl)).then((response) => {
  const $ = repData(response);

  const fitDealerNetCount = getHtmlContent(mergeContent($, 4, 8, "count"));
  const fitForeignNetCount = getHtmlContent(mergeContent($, 6, 6, "count"));

  const fitNetCount = fitDealerNetCount + fitForeignNetCount;
  //   console.log({ fitNetCount });

  const fimtDealerNetCount = getHtmlContent(mergeContent($, 10, 8, "count"));
  const fimtForeignNetCount = getHtmlContent(mergeContent($, 12, 6, "count"));

  const fimtNetCount = fimtDealerNetCount + fimtForeignNetCount;

  const fitDealerNetMoney = getHtmlContent(mergeContent($, 4, 9, "money"));
  const fitForeignNetMoney = getHtmlContent(mergeContent($, 6, 7, "money"));
  const fitNetMoney = fitDealerNetMoney + fitForeignNetMoney;

  //   console.log({ fitDealerNetMoney });
  //   console.log({ fitForeignNetMoney });

  const fimtDealerNetMoney = getHtmlContent(mergeContent($, 10, 9, "money"));
  const fimtForeignNetMoney = getHtmlContent(mergeContent($, 12, 7, "money"));
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

  const callDealerLongCount = getHtmlContent(
    mergeContent($, 4, 5, "count", "option")
  );
  const callForeignLongCount = getHtmlContent(
    mergeContent($, 6, 2, "count", "option")
  );

  const callLongCount = callDealerLongCount + callForeignLongCount;

  const putDealerLongCount = getHtmlContent(
    mergeContent($, 7, 3, "count", "option")
  );
  const putForeignLongCount = getHtmlContent(
    mergeContent($, 9, 2, "count", "option")
  );
  const putLongCount = putDealerLongCount + putForeignLongCount;

  const callDealerShortCount = getHtmlContent(
    mergeContent($, 4, 7, "count", "option")
  );
  const callForeignShortCount = getHtmlContent(
    mergeContent($, 6, 4, "count", "option")
  );
  const callShortCount = callDealerShortCount + callForeignShortCount;

  const putDealerShortCount = getHtmlContent(
    mergeContent($, 7, 5, "count", "option")
  );
  const putForeignShortCount = getHtmlContent(
    mergeContent($, 9, 4, "count", "option")
  );
  const putShortCount = putDealerShortCount + putForeignShortCount;

  const callDealerLongMoney = getHtmlContent(
    mergeContent($, 4, 6, "money", "option")
  );
  const callForeignLongMoney = getHtmlContent(
    mergeContent($, 6, 3, "money", "option")
  );
  const callLongMoney = callDealerLongMoney + callForeignLongMoney;

  const putDealerLongMoney = getHtmlContent(
    mergeContent($, 7, 4, "money", "option")
  );
  const putForeignLongMoney = getHtmlContent(
    mergeContent($, 9, 3, "money", "option")
  );
  const putLongMoney = putDealerLongMoney + putForeignLongMoney;

  const callDealerShortMoney = getHtmlContent(
    mergeContent($, 4, 8, "money", "option")
  );
  const callForeignShortMoney = getHtmlContent(
    mergeContent($, 6, 5, "money", "option")
  );
  const callShortMoney = callDealerShortMoney + callForeignShortMoney;

  const putDealerShortMoney = getHtmlContent(
    mergeContent($, 7, 6, "money", "option")
  );
  const putForeignShortMoney = getHtmlContent(
    mergeContent($, 9, 5, "money", "option")
  );
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
