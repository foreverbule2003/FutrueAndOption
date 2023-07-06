const ObjectsToCsv = require("objects-to-csv");
const axios = require("axios");

const convertData2Csv = (data) => {
  (async () => {
    const csv = new ObjectsToCsv(data);
    const today = new Date().toISOString().slice(0, 10);
    console.log({ today });
    // Save to file:
    await csv.toDisk(`./${today}.csv`);
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

const toNumber = (content) => Number(content.replace(/[^0-9.-]+/g, ""));
const getHtmlContent = (content) => toNumber(content.text());

module.exports = {
  convertData2Csv,
  queryData,
  getHtmlContent,
};
