// night.test.js

// Define mock functions that will be used by the mock factory
const mockConvertData2Csv = jest.fn();
const mockQueryData = jest.fn();
const mockGetHtmlContent = jest.fn();
const mockRepData = jest.fn((html) => require('cheerio').load(html)); // Keep real Cheerio
const mockGetUrl = jest.fn((url) => url);
const mockConvertFimt2Fit = jest.fn((value) => value / 4); // Actual logic
const mockAdjNetCost = jest.fn((netMoney, netCount) => { // Actual logic
    if (netCount === 0) return netMoney === 0 ? NaN : (netMoney > 0 ? Infinity : -Infinity);
    let cost = Math.round((netMoney / netCount) * 20);
    if (netCount < 0 && netMoney > 0) cost *= -1;
    if (netCount < 0 && netMoney < 0) cost *= -1;
    return cost;
});

jest.mock('./helper', () => ({
  convertData2Csv: mockConvertData2Csv,
  queryData: mockQueryData,
  getHtmlContent: mockGetHtmlContent,
  repData: mockRepData,
  getUrl: mockGetUrl,
  convertFimt2Fit: mockConvertFimt2Fit,
  adjNetCost: mockAdjNetCost,
}));

describe('night.js data processing', () => {
  beforeEach(() => {
    jest.resetModules(); // Resets module cache
    
    mockConvertData2Csv.mockClear().mockReset();
    mockQueryData.mockClear().mockReset();
    mockGetHtmlContent.mockClear().mockReset();
    mockRepData.mockClear().mockReset();
    mockGetUrl.mockClear().mockReset();
    mockConvertFimt2Fit.mockClear().mockReset();
    mockAdjNetCost.mockClear().mockReset();
  });

  test('should process future and option data and call convertData2Csv with correct results for night session', async () => {
    mockQueryData
      .mockResolvedValueOnce('mock future html night') // For getFutureData
      .mockResolvedValueOnce('mock option html night'); // For getOptionData

    // Chain all 24 getHtmlContent mocks for night.js
    mockGetHtmlContent
      // Future Data (8 calls)
      .mockReturnValueOnce(100)  // fitDealerNetCount
      .mockReturnValueOnce(200)  // fitForeignNetCount
      .mockReturnValueOnce(40)   // fimtDealerNetCount
      .mockReturnValueOnce(80)   // fimtForeignNetCount
      .mockReturnValueOnce(1000) // fitDealerNetMoney
      .mockReturnValueOnce(2000) // fitForeignNetMoney
      .mockReturnValueOnce(400)  // fimtDealerNetMoney
      .mockReturnValueOnce(800)  // fimtForeignNetMoney
    // Option Data (16 calls)
      .mockReturnValueOnce(50)   // callDealerLongCount
      .mockReturnValueOnce(100)  // callForeignLongCount
      .mockReturnValueOnce(25)   // putDealerLongCount
      .mockReturnValueOnce(50)   // putForeignLongCount
      .mockReturnValueOnce(40)   // callDealerShortCount
      .mockReturnValueOnce(60)   // callForeignShortCount
      .mockReturnValueOnce(20)   // putDealerShortCount
      .mockReturnValueOnce(30)   // putForeignShortCount
      .mockReturnValueOnce(500)  // callDealerLongMoney
      .mockReturnValueOnce(1000) // callForeignLongMoney
      .mockReturnValueOnce(250)  // putDealerLongMoney
      .mockReturnValueOnce(500)  // putForeignLongMoney
      .mockReturnValueOnce(400)  // callDealerShortMoney
      .mockReturnValueOnce(600)  // callForeignShortMoney
      .mockReturnValueOnce(200)  // putDealerShortMoney
      .mockReturnValueOnce(300); // putForeignShortMoney

    let processedData;
    mockConvertData2Csv.mockImplementation(data => {
      processedData = data;
    });

    require('./night.js');

    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for promises

    expect(mockQueryData).toHaveBeenCalledTimes(2);
    expect(mockGetHtmlContent).toHaveBeenCalledTimes(24);
    expect(mockConvertData2Csv).toHaveBeenCalledTimes(1);

    const expectedFutureNight = {
      商品: "期貨",
      淨口數: 330,
      淨成本: 64, 
    };
    const expectedCallNight = {
      商品: "CALL",
      淨口數: 50,
      淨成本: 200,
    };
    const expectedPutNight = {
      商品: "PUT",
      淨口數: 25,
      淨成本: 200,
    };
    
    expect(processedData).toEqual(expect.arrayContaining([
      expectedFutureNight,
      expectedCallNight,
      expectedPutNight,
    ]));
    expect(processedData.map(item => item.商品)).toEqual(["CALL", "PUT", "期貨"]);
  });
});
