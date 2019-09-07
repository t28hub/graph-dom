import axios from 'axios';
import { parse } from 'url';
import { RobotsFetcher } from '../../src/service/robotsFetcher';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RobotsFetcher', () => {
  describe('fetch', () => {
    const fetcher = new RobotsFetcher(axios);

    test('should fetch robots.txt', async () => {
      // Arrange
      mockedAxios.get.mockImplementation(async () => {
        const data = 'This is a robots.txt.';
        return { status: 200, statusText: 'OK', data };
      });

      // Act
      const actual = await fetcher.fetch(parse('https://example.com'));

      // Assert
      expect(mockedAxios.get).toBeCalledWith('https://example.com/robots.txt', { responseType: 'text' });
      expect(actual).toBe('This is a robots.txt.');
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
