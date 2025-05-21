const helperModule = require('./helper');
console.log('HELPER MODULE:', helperModule);
const { toNumber, adjNetCost, convertData2Csv, getUrl, repData, mergeContent, getHtmlContent, isCount, getTableContent, convertFimt2Fit } = helperModule;

const cheerio = require('cheerio'); // Required for actual repData call if not fully mocked
const ObjectsToCsv = require('objects-to-csv'); // For convertData2Csv
const path = require('path'); // For convertData2Csv

jest.mock('objects-to-csv'); // Auto-mock objects-to-csv

describe('toNumber', () => {
  test('should convert a string with commas to a number', () => {
    expect(toNumber('1,234,567')).toBe(1234567);
  });
  test('should convert a string with currency and commas to a number', () => {
    expect(toNumber('$1,234.56')).toBe(1234.56);
  });
  test('should handle numbers as strings', () => {
    expect(toNumber('123')).toBe(123);
  });
  test('should handle negative numbers as strings', () => {
    expect(toNumber('-123.45')).toBe(-123.45);
  });
  test('should return 0 for non-numeric strings', () => {
    expect(toNumber('abc')).toBe(0);
  });
  test('should handle empty string', () => {
    expect(toNumber('')).toBe(0);
  });
});

describe('convertFimt2Fit', () => {
  test('should correctly divide by 4', () => {
    expect(convertFimt2Fit(100)).toBe(25);
    expect(convertFimt2Fit(0)).toBe(0);
    expect(convertFimt2Fit(-20)).toBe(-5);
  });
});

describe('adjNetCost', () => {
  test('should calculate cost correctly for positive netCount', () => {
    expect(adjNetCost(100, 10)).toBe(200); 
  });
  test('should calculate cost correctly for netCount < 0 and netMoney > 0', () => {
    expect(adjNetCost(100, -10)).toBe(200); 
  });
  test('should calculate cost correctly for netCount < 0 and netMoney < 0', () => {
    expect(adjNetCost(-100, -10)).toBe(-200); 
  });
  test('should handle netMoney = 0', () => {
    expect(adjNetCost(0, 10)).toBe(0);
    expect(adjNetCost(0, -10)).toBe(-0);
  });
  test('should handle division by zero by returning NaN or Infinity as per JS Math.round behavior', () => {
    expect(adjNetCost(100, 0)).toBe(Infinity); 
    expect(adjNetCost(-100, 0)).toBe(-Infinity); 
    expect(adjNetCost(0,0)).toBeNaN(); 
  });
});

describe('isCount', () => {
  test('should return true if "count"', () => {
    expect(isCount('count')).toBe(true);
  });
  test('should return false if not "count"', () => {
    expect(isCount('money')).toBe(false);
    expect(isCount('')).toBe(false);
  });
});

describe('getTableContent', () => {
  test('should return correct selector string', () => {
    expect(getTableContent(1, 2)).toBe('> tr:nth-child(1) > td:nth-child(2)');
  });
});

// Mock process.argv before tests for getUrl
const originalArgv = process.argv;
afterEach(() => {
  process.argv = originalArgv; 
});

describe('getUrl', () => {
  const baseUrl = 'http://example.com';
  test('should return base URL if no specDate in argv', () => {
    process.argv = ['node', 'script.js'];
    expect(getUrl(baseUrl)).toBe(baseUrl);
  });
  test('should return modified URL if specDate is in argv', () => {
    process.argv = ['node', 'script.js', '1231']; 
    const expectedUrl = `${baseUrl}?queryType=1&goDay=&doQuery=1&dateaddcnt=&queryDate=2023%2F12%2F31&commodityId=`;
    expect(getUrl(baseUrl)).toBe(expectedUrl);
  });
  test('should handle different specDate format if applicable (current logic is MMdd)', () => {
    process.argv = ['node', 'script.js', '0105']; 
    const expectedUrl = `${baseUrl}?queryType=1&goDay=&doQuery=1&dateaddcnt=&queryDate=2023%2F01%2F05&commodityId=`;
    expect(getUrl(baseUrl)).toBe(expectedUrl);
  });
});


describe('repData', () => {
  test('should load HTML string and return a Cheerio object', () => {
    const html = '<html><body><h1>Hello</h1></body></html>';
    const $ = repData(html);
    expect(typeof $).toBe('function'); 
    expect($('h1').text()).toBe('Hello');
  });
});

// Mock const.js values as they are used in mergeContent
jest.mock('./const', () => ({
  tablePath: '#table > tbody',
  fTableContentPath4Count: '> div > .count',
  fTableContentPath4Money: '> div > .money',
  oTableContentPath4Count: '> .count',
  oTableContentPath4Money: '> .money',
}));

describe('mergeContent and getHtmlContent', () => {
  let mockCheerioInstance;
  let mockSelectedElement;

  beforeEach(() => {
    mockSelectedElement = {
      text: jest.fn()
    };
    // Create a mock Cheerio instance that returns the mockSelectedElement
    // when any selector is passed to it.
    mockCheerioInstance = jest.fn(() => mockSelectedElement);
  });

  describe('mergeContent', () => {
    test('should construct correct future selector for count', () => {
      mergeContent(mockCheerioInstance, 1, 2, 'count', 'future');
      expect(mockCheerioInstance).toHaveBeenCalledWith('#table > tbody > tr:nth-child(1) > td:nth-child(2) > div > .count');
    });
    test('should construct correct future selector for money', () => {
      mergeContent(mockCheerioInstance, 3, 4, 'money', 'future');
      expect(mockCheerioInstance).toHaveBeenCalledWith('#table > tbody > tr:nth-child(3) > td:nth-child(4) > div > .money');
    });
    test('should construct correct option selector for count', () => {
      mergeContent(mockCheerioInstance, 5, 6, 'count', 'option');
      expect(mockCheerioInstance).toHaveBeenCalledWith('#table > tbody > tr:nth-child(5) > td:nth-child(6) > .count');
    });
    test('should construct correct option selector for money', () => {
      mergeContent(mockCheerioInstance, 7, 8, 'money', 'option');
      expect(mockCheerioInstance).toHaveBeenCalledWith('#table > tbody > tr:nth-child(7) > td:nth-child(8) > .money');
    });
    test('should return the cheerio selected element', () => {
      const result = mergeContent(mockCheerioInstance, 1, 2, 'count', 'future');
      expect(result).toBe(mockSelectedElement);
    });
  });

  describe('getHtmlContent', () => {
    test('should call mergeContent and toNumber correctly', () => {
      const textValue = '1,234';
      mockSelectedElement.text.mockReturnValue(textValue);
      const result = getHtmlContent([mockCheerioInstance, 1, 2, 'count', 'future']);
      expect(mockCheerioInstance).toHaveBeenCalledWith('#table > tbody > tr:nth-child(1) > td:nth-child(2) > div > .count');
      expect(mockSelectedElement.text).toHaveBeenCalled();
      expect(result).toBe(1234); 
    });

    test('should handle different parameters for getHtmlContent', () => {
      const textValue = '-5.67';
      mockSelectedElement.text.mockReturnValue(textValue);
      const result = getHtmlContent([mockCheerioInstance, 3, 4, 'money', 'option']);
      expect(mockCheerioInstance).toHaveBeenCalledWith('#table > tbody > tr:nth-child(3) > td:nth-child(4) > .money');
      expect(mockSelectedElement.text).toHaveBeenCalled();
      expect(result).toBe(-5.67);
    });
  });
});


describe('convertData2Csv', () => {
  let mockToDisk;
  let originalProcessArgvForCsv; // Use a different variable name to avoid conflict
  
  const OriginalDate = global.Date; // Store original Date constructor
  let mockDate; // Variable to hold the spy

  beforeEach(() => {
    mockToDisk = jest.fn().mockResolvedValue(undefined);
    ObjectsToCsv.mockImplementation(() => ({ // Ensure ObjectsToCsv is mocked correctly
      toDisk: mockToDisk,
    }));

    originalProcessArgvForCsv = { ...process.argv }; // Shallow copy argv

    // Default Date mock for 'new Date()' calls without arguments
    mockDate = jest.spyOn(global, 'Date').mockImplementation((...args) => {
      if (args.length > 0) { // If Date is called with arguments, use original Date
        return new OriginalDate(...args);
      }
      // Default mock for 'new Date()' should be a time that doesn't trigger day/night specific logic
      return new OriginalDate(2023, 9, 26, 8, 0, 0); // Oct 26, 2023, 08:00:00 local time
    });
  });

  afterEach(() => {
    mockDate.mockRestore(); // Restore original Date
    process.argv = originalProcessArgvForCsv; // Restore original argv
    jest.clearAllMocks(); // Clear all mock usage data, including ObjectsToCsv
  });

  test('should generate correct filename for day.js (default date mock)', async () => {
    process.argv = ['node', '/path/to/day.js']; // Simulating day.js run
    const data = [{ a: 1, b: 2 }];
    await convertData2Csv(data);
    expect(ObjectsToCsv).toHaveBeenCalledWith(data);
    // With default mockDate (08:00), neither isDayTradingTime nor isNightTradingTime should be true.
    // So, dd should be 26.
    expect(mockToDisk).toHaveBeenCalledWith('././1026盤後回顧.csv');
  });

  test('should generate correct filename for night.js (default date mock)', async () => {
    process.argv = ['node', '/path/to/night.js']; // Simulating night.js run
    const data = [{ c: 3, d: 4 }];
    await convertData2Csv(data);
    expect(ObjectsToCsv).toHaveBeenCalledWith(data);
    // With default mockDate (08:00), neither isDayTradingTime nor isNightTradingTime should be true.
    // So, dd should be 26.
    expect(mockToDisk).toHaveBeenCalledWith('././1026盤前回顧(昨夜交易資料).csv');
  });

  test('should use specficDay from argv for filename if provided', async () => {
    process.argv = ['node', '/path/to/day.js', '1101']; // specficDay = 1101
    // Date mock doesn't matter as specficDay is used
    const data = [{ e: 5 }];
    await convertData2Csv(data);
    expect(ObjectsToCsv).toHaveBeenCalledWith(data);
    expect(mockToDisk).toHaveBeenCalledWith('././1101盤後回顧.csv');
  });

  test('should adjust filename for day.js if during day trading hours (9-14)', async () => {
    process.argv = ['node', '/path/to/day.js'];
    // Override Date mock for this specific test
    mockDate.mockImplementation(() => new OriginalDate(2023, 9, 26, 10, 30, 0)); // Oct 26, 10:30 AM
    const data = [{ f: 6 }];
    await convertData2Csv(data);
    expect(ObjectsToCsv).toHaveBeenCalledWith(data);
    // isDayTradingTime = true, so dd = yesterday (25)
    expect(mockToDisk).toHaveBeenCalledWith('././1025盤後回顧.csv');
  });

  test('should adjust filename for night.js if during night trading hours (15 PM - 5 AM)', async () => {
    process.argv = ['node', '/path/to/night.js'];
    // Override Date mock for this specific test
    mockDate.mockImplementation(() => new OriginalDate(2023, 9, 26, 16, 0, 0)); // Oct 26, 4 PM (16:00)
    const data = [{ g: 7 }];
    await convertData2Csv(data);
    expect(ObjectsToCsv).toHaveBeenCalledWith(data);
    // isNightTradingTime = true, so dd = yesterday (25)
    expect(mockToDisk).toHaveBeenCalledWith('././1025盤前回顧(昨夜交易資料).csv');
  });
});
