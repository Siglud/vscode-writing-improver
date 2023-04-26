/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @author Siglud <siglud@gmail.com>
 */
import { jest, expect } from '@jest/globals'
import { Stream } from 'stream';

const mockHttpResponse = jest.fn((url, options, callback: (res: Stream) => void) => {
    const res = JSON.stringify({
        choices: [{
            text: '\n\n   Hello, world!   ',
        }],
    })
    let stream = new Stream()
    callback(stream)
    stream.emit('data', res)
    stream.emit('end')
})

jest.mock('https', () => ({
    request: mockHttpResponse,
}));

import { AzureOpenAIPolishService } from '../../core/AzurePolishService'


describe('AzureOpenAIPolishService', () => {
    const mockKey = 'mock-key';
    const mockUrl = 'https://mock-url.com';
    const mockSystemPrompt = 'mock-system-prompt';
    const mockUserPrompt = 'mock-user-prompt';

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return an empty string if key, url, and prompts are not set', async () => {
        const service = new AzureOpenAIPolishService('', '', '', '');
        const input = 'Hello, world!';
        const expectedOutput = '';
        const actualOutput = await service.polish(input);
        expect(actualOutput).toEqual(expectedOutput);
    });

    it('should send a POST request with the correct headers and body', async () => {
        const service = new AzureOpenAIPolishService(mockKey, mockUrl, mockSystemPrompt, mockUserPrompt);
        const input = 'Hello, world!';
        await service.polish(input);
        expect(mockHttpResponse).toHaveBeenCalledWith(mockUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': mockKey,
            }
        }, expect.anything());
    });

    it('should return the first choice text from the response', async () => {
        const service = new AzureOpenAIPolishService(mockKey, mockUrl, mockSystemPrompt, mockUserPrompt);
        const input = 'Hello, world!';
        const expectedOutput = 'Hello, world!   ';
        const actualOutput = await service.polish(input);
        expect(actualOutput).toEqual(expectedOutput);
    });

    it('should normalize the response text', async () => {
        const service = new AzureOpenAIPolishService(mockKey, mockUrl, mockSystemPrompt, mockUserPrompt);
        const input = '   Hello, world!   ';
        const expectedOutput = 'Hello, world!   ';
        const actualOutput = await service.polish(input);
        expect(actualOutput).toEqual(expectedOutput);
    });
});
