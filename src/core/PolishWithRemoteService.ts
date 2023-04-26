/* eslint-disable @typescript-eslint/naming-convention */
import * as https from 'https'

export abstract class PolishWithRemoteService implements PolishServiceInterface {
    protected readonly key?: string;
    protected readonly url?: string;
    protected readonly systemPrompt?: string;
    protected readonly userPrompt?: string;

    constructor(key?: string, url?: string, systemPrompt?: string, userPrompt?: string) {
        this.key = key;
        this.url = url;
        this.systemPrompt = systemPrompt;
        this.userPrompt = userPrompt;
    }

    /**
     * sends an HTTP POST request to a specified URL with the given headers and body.
     * It returns a Promise that resolves with the response data as a string.
     * The method uses the built-in https module to make the request and handles the response using event listeners.
     *
     * @param url request url
     * @param headers request headers
     * @param body request body
     * @returns response data as a string
     */
    public async httpPostAsync(url: string, headers: https.RequestOptions, body: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = https.request(url, headers, (res) => {
                let data = ''

                res.on('data', (chunk) => {
                    data += chunk
                })

                res.on('end', () => {
                    resolve(data)
                })
            });

            req.on('error', (err) => {
                reject(err)
            })

            req.write(body)

            req.end()
        })
    }

    /**
     * removes leading spaces or \n from a string
     * @param s input string
     * @returns string with leading spaces removed
     */
    protected normalizeResponse(s: string): string {
        return s.trimStart()
    }

    protected bodyBuilder(url: string, text: string, model?: string, systemPrompt?: string, userPrompt?: string): string {
        const useChat = url.includes('chat/completions')
        let body = model ? { "model": model } : {};
        // chat api always use message as prompt
        if (useChat) {
            Object.assign(body, {
                "temperature": 0,
                "max_tokens": 1000,
                "top_p": 1,
                "frequency_penalty": 1,
                "presence_penalty": 1,
                "stream": true,
                "messages": [
                    {
                        "role": "system",
                        "content": systemPrompt,
                    },
                    {
                        "role": "user",
                        "content": userPrompt,
                    },
                    { "role": "user", content: text },
                ],
            })
            return JSON.stringify(body)
        }
        Object.assign(body, {
            "prompt": this.formatPrompt(text, systemPrompt, userPrompt),
            "temperature": 1,
            "top_p": 0.5,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "max_tokens": 100,
            "stop": "<|im_end|>"
        })
        return JSON.stringify(body)
    }

    protected formatPrompt(text: string, systemPrompt?: string, userPrompt?: string): string {
        if (!systemPrompt && !userPrompt) {
            return `<|im_start|>system\n${systemPrompt}\n<|im_end|>\n<|im_start|>user\n${userPrompt}\n${text}\n<|im_end|>\n<|im_start|>assistant\n`
        }
        const prompt = systemPrompt ?? userPrompt ?? ''
        return prompt.replace('${message}', text)
    }


    abstract polish(text: string): Promise<string>
}
