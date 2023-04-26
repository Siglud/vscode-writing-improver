/* eslint-disable @typescript-eslint/naming-convention */
import { PolishWithRemoteService } from './PolishWithRemoteService';

export class AzureOpenAIPolishService extends PolishWithRemoteService {

    async polish(text: string): Promise<string> {
        if (!this.key || !this.url || (!this.systemPrompt && !this.userPrompt)) {
            return ''
        }
        const headers = {
            "Content-Type": "application/json",
            "api-key": this.key,
        }
        const body = this.bodyBuilder(this.url, text, undefined, this.systemPrompt, this.userPrompt)

        const options = {
            method: 'POST',
            headers: headers
        }

        const req = await this.httpPostAsync(this.url, options, body)

        const response = JSON.parse(req) as AzureOpenAIResponse

        return this.normalizeResponse(response?.choices?.[0]?.text ?? '')
    }
}
