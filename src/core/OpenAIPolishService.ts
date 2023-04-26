/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode'
import { PolishWithRemoteService } from "./PolishWithRemoteService"

export class OpenAiPolishService extends PolishWithRemoteService {
    private readonly model: string

    constructor(model: string, key?: string, url?: string, systemPrompt?: string, userPrompt?: string) {
        super(key, url, systemPrompt, userPrompt)
        this.model = model
    }

    async polish(text: string): Promise<string> {
        if (!this.key || !this.url || !this.systemPrompt || !this.userPrompt) {
            return ''
        }
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.key}`,
        }
        const body = this.bodyBuilder(this.url, text, this.model, this.systemPrompt, this.userPrompt)
        const options = {
            method: 'POST',
            headers: headers
        }
        const req = await this.httpPostAsync(this.url, options, body)

        const response = JSON.parse(req) as ChatCompletion
        return this.normalizeResponse(response?.choices?.[0]?.message?.content ?? '')
    }
}
