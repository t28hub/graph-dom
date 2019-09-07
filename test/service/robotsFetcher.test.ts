import axios from 'axios';
import { parse } from 'url';
import { RobotsFetcher } from '../../src/service/robotsFetcher';
import each from 'jest-each';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RobotsFetcher', () => {
  describe('fetch', () => {
    const fetcher = new RobotsFetcher(axios);

    each([
      'https://example.com',
      'https://example.com/',
      'https://example.com:443/',
      'https://example.com/test/',
      'https://example.com/test/index.html',
      'https://example.com/test/index.html?query=example',
      'https://example.com/test/index.html?query=example#title',
    ]).test('should fetch robots.txt from %s', async (url: string) => {
      // Arrange
      mockedAxios.get.mockImplementation(async () => {
        const data = `
          User-Agent: *
          Allow: /
        `;
        return { status: 200, statusText: 'OK', data };
      });

      // Act
      const parsed = parse(url);
      const actual = await fetcher.fetch(parsed);

      // Assert
      expect(mockedAxios.get).toBeCalledWith('https://example.com/robots.txt', { responseType: 'text' });
      expect(actual).toBeDefined();
    });

    test('should throw an Error string when a request failed', async () => {
      // Arrange
      mockedAxios.get.mockImplementation(async () => {
        throw new Error('Unable to get request');
      });

      // Act
      await expect(fetcher.fetch(parse('https://example.com')))
        .rejects
        .toThrow('Failed to fetch text from https://example.com/robots.txt');

      // Assert
      expect(mockedAxios.get).toBeCalledWith('https://example.com/robots.txt', { responseType: 'text' });
    });

    test('should throw an Error when received status is not 200', async () => {
      // Arrange
      mockedAxios.get.mockImplementation(async () => {
        return { status: 404, statusText: 'Not Found' };
      });

      // Act
      await expect(fetcher.fetch(parse('https://example.com')))
        .rejects
        .toThrow('Received unexpected status \'404 Not Found\' from https://example.com/robots.txt');

      // Assert
      expect(mockedAxios.get).toBeCalledWith('https://example.com/robots.txt', { responseType: 'text' });
    });
  });
});
