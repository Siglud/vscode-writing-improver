/* eslint-disable @typescript-eslint/naming-convention */
interface AzureOpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        text?: string;
        index: number;
        finish_reason: string;
        logprobs: any;
    }[] | undefined;
    usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
    };
    error?: {
        message: string;
        type: string;
    }
}

interface ChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices?: {
        message?: {
            role: string;
            content?: string;
        };
        finish_reason: string;
        index: number;
    }[];
    error?: {
        message: string;
        type: string;
    }
}