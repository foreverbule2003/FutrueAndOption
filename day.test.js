// day.test.js

// Define mock functions that will be used by the mock factory
const mockConvertData2Csv = jest.fn();
const mockQueryData = jest.fn();
const mockGetHtmlContent = jest.fn();
const mockRepData = jest.fn((html) => require('cheerio').load(html)); // Keep real Cheerio for repData
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

describe('day.js data processing', () => {
  beforeEach(() => {
    jest.resetModules(); // Resets module cache, so day.js gets the fresh mock via the factory
    
    // Clear only mock call history and implementations, not the mock functions themselves
    mockConvertData2Csv.mockClear().mockReset(); // Use mockReset to clear any mockImplementation
    mockQueryData.mockClear().mockReset();
    mockGetHtmlContent.mockClear().mockReset();
    mockRepData.mockClear().mockReset();
    mockGetUrl.mockClear().mockReset();
    mockConvertFimt2Fit.mockClear().mockReset();
    mockAdjNetCost.mockClear().mockReset();
  });

  test('should process future and option data and call convertData2Csv with correct results', async () => {
    // Setup the mock implementations for this specific test run
    mockQueryData
      .mockResolvedValueOnce('mock future html')  // For getFutureData in day.js
      .mockResolvedValueOnce('mock option html'); // For getOptionData in day.js

    // Chain all 48 getHtmlContent mock return values for day.js
    mockGetHtmlContent
        // Future Data (24 calls)
        .mockReturnValueOnce(1000) // fitDealerLongCount (1)
        .mockReturnValueOnce(2000) // fitForeignLongCount (2)
        .mockReturnValueOnce(500)  // fitDealerShortCount (3)
        .mockReturnValueOnce(1000) // fitForeignShortCount (4)
        .mockReturnValueOnce(400)  // fimtDealerLongCount (5)
        .mockReturnValueOnce(800)  // fimtForeignLongCount (6)
        .mockReturnValueOnce(200)  // fimtDealerShortCount (7)
        .mockReturnValueOnce(400)  // fimtForeignShortCount (8)
        .mockReturnValueOnce(100000) // fitDealerLongMoney (9)
        .mockReturnValueOnce(200000) // fitForeignLongMoney (10)
        .mockReturnValueOnce(50000)  // fitDealerShortMoney (11)
        .mockReturnValueOnce(100000) // fitForeignShortMoney (12)
        .mockReturnValueOnce(40000)  // fimtDealerLongMoney (13)
        .mockReturnValueOnce(80000)  // fimtForeignLongMoney (14)
        .mockReturnValueOnce(20000)  // fimtDealerShortMoney (15)
        .mockReturnValueOnce(40000)  // fimtForeignShortMoney (16)
        .mockReturnValueOnce(150)    // oiFitDealerNetCount (17)
        .mockReturnValueOnce(250)    // oiFitForeignNetCount (18)
        .mockReturnValueOnce(60)     // oiFimtDealerNetCount (19)
        .mockReturnValueOnce(100)    // oiFimtForeignNetCount (20)
        .mockReturnValueOnce(15000)  // oiFitDealerNetMoney (21)
        .mockReturnValueOnce(25000)  // oiFitForeignNetMoney (22)
        .mockReturnValueOnce(6000)   // oiFimtDealerNetMoney (23)
        .mockReturnValueOnce(10000)  // oiFimtForeignNetMoney (24)
      // Option Data (24 calls)
        .mockReturnValueOnce(100) // callDealerLongCount (25)
        .mockReturnValueOnce(200) // callForeignLongCount (26)
        .mockReturnValueOnce(50)  // putDealerLongCount (27)
        .mockReturnValueOnce(100) // putForeignLongCount (28)
        .mockReturnValueOnce(80)  // callDealerShortCount (29)
        .mockReturnValueOnce(120) // callForeignShortCount (30)
        .mockReturnValueOnce(40)  // putDealerShortCount (31)
        .mockReturnValueOnce(60)  // putForeignShortCount (32)
        .mockReturnValueOnce(1000) // callDealerLongMoney (33)
        .mockReturnValueOnce(2000) // callForeignLongMoney (34)
        .mockReturnValueOnce(500)  // putDealerLongMoney (35)
        .mockReturnValueOnce(1000) // putForeignLongMoney (36)
        .mockReturnValueOnce(800)  // callDealerShortMoney (37)
        .mockReturnValueOnce(1200) // callForeignShortMoney (38)
        .mockReturnValueOnce(400)  // putDealerShortMoney (39)
        .mockReturnValueOnce(600)  // putForeignShortMoney (40)
        .mockReturnValueOnce(30)   // oiCallDealerNetCount (41)
        .mockReturnValueOnce(70)   // oiCallForeignNetCount (42)
        .mockReturnValueOnce(20)   // oiPutDealerNetCount (43)
        .mockReturnValueOnce(30)   // oiPutForeignNetCount (44)
        .mockReturnValueOnce(300)  // oiCallDealerNetMoney (45)
        .mockReturnValueOnce(700)  // oiCallForeignNetMoney (46)
        .mockReturnValueOnce(200)  // oiPutDealerNetMoney (47)
        .mockReturnValueOnce(300); // oiPutForeignNetMoney (48th call for day.js)

    let processedData;
    mockConvertData2Csv.mockImplementation(data => { // Set specific mock implementation for this test
      processedData = data;
    });

    // Dynamically require day.js AFTER mocks are set up for it
    require('./day.js'); 

    // Wait for promises to resolve. A timeout can be more robust for complex promise chains.
    await new Promise(resolve => setTimeout(resolve, 50)); // Increased timeout slightly

    expect(mockQueryData).toHaveBeenCalledTimes(2);
    expect(mockGetHtmlContent).toHaveBeenCalledTimes(48); // Ensure this matches day.js
    expect(mockConvertData2Csv).toHaveBeenCalledTimes(1);
    
    // Expected Future Data Calculations:
    const expectedFuture = {
      商品: "台指",
      買方口數: 3300,
      買方成本: 636,
      賣方口數: 1650,
      賣方成本: 636,
      日盤淨口數: 1650,
      日盤淨成本: 636,
      收盤價: "", 
      未平倉淨口數: 440,
      未平倉淨成本: 636,
    };
    // Expected Option Data Calculations (Call):
    const expectedCall = {
      商品: "CALL",
      買方口數: 300,
      買方成本: 200,
      賣方口數: 200,
      賣方成本: 200,
      日盤淨口數: 100,
      日盤淨成本: 200,
      收盤價: "",
      未平倉淨口數: 100,
      未平倉淨成本: 200,
    };
    // Expected Option Data Calculations (Put):
    const expectedPut = {
      商品: "PUT",
      買方口數: 150,
      買方成本: 200,
      賣方口數: 100,
      賣方成本: 200,
      日盤淨口數: 50,
      日盤淨成本: 200,
      收盤價: "",
      未平倉淨口數: 50,
      未平倉淨成本: 200,
    };
    expect(processedData).toEqual(expect.arrayContaining([
      expectedFuture,
      expectedCall,
      expectedPut,
    ]));
    expect(processedData.map(item => item.商品)).toEqual(["CALL", "PUT", "台指"]);
  });
});
