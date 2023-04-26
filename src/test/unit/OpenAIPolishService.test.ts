/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @author Siglud <siglud@gmail.com>
 */
import { expect, jest } from '@jest/globals'
import { OpenAiPolishService } from '../../core/OpenAIPolishService';
import { RequestOptions } from "http";

// always return the same response
jest.mock('https', () => ({
    request: (url: string, postOption: any, callback: any) => callback({
        on: (data: string, cb: any) => cb(Buffer.from(JSON.stringify({
            choices: [
                {
                    message: {
                        content: data,
                    },
                },
            ],
        }), 'utf8')),
        statusCode: 200,
        statusMessage: 'API Success'
    }),
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn()
}));

describe('OpenAiPolishService', () => {
    const model = 'test-model';
    const key = 'test-key';
    const url = 'test-url/chat/completions';
    const systemPrompt = 'test-system-prompt';
    const userPrompt = 'test-user-prompt';

    describe('polish', () => {
        it('should return empty string if key, url, systemPrompt, or userPrompt is not provided', async () => {
            const service = new OpenAiPolishService(model);
            const result = await service.polish('test-text');
            expect(result).toBe('');
        });

        it('should return normalized response if key, url, systemPrompt, and userPrompt are provided', async () => {
            const service = new OpenAiPolishService(model, key, url, systemPrompt, userPrompt);
            const mockResponse = {
                choices: [
                    {
                        message: {
                            content: 'test-response',
                        },
                    },
                ],
            };
            const mockHttpPostAsync = jest.fn((a: string, b: RequestOptions, c): Promise<string> => {
                return new Promise((resolve) => {
                    resolve(JSON.stringify(mockResponse));
                })
            })
            service.httpPostAsync = mockHttpPostAsync

            const result = await service.polish('test-text');
            expect(mockHttpPostAsync).toHaveBeenCalledWith(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${key}`,
                    },
                },
                expect.any(String)
            );
            expect(result).toBe('test-response');
        });

        it('should return empty string if response is invalid', async () => {
            const service = new OpenAiPolishService(model, key, url, systemPrompt, userPrompt);
            const mockResponse = {
                choices: [
                    {
                        message: {},
                    },
                ],
            };
            service.httpPostAsync = jest.fn((a: string, b: RequestOptions, c): Promise<string> => {
                return new Promise((resolve) => {
                    resolve(JSON.stringify(mockResponse));
                })
            })

            const result = await service.polish('test-text');
            expect(result).toBe('');
        });
    });
});
