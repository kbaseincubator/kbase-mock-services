import { JSONArray } from '../../lib/json.ts';
import { JSONRPCClient } from './JSONRPC11.ts';

export interface ServiceClientParams {
    url: string;
    timeout: number;
    token?: string;
}

export abstract class ServiceClient {
    abstract module: string;
    url: string;
    timeout: number;
    token?: string;
    constructor({ url, timeout, token }: ServiceClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.token = token;
    }
    async callFunc<ParamType extends JSONArray, ReturnType extends JSONArray>(funcName: string, params: ParamType): Promise<ReturnType> {
        const client = new JSONRPCClient({ url: this.url, timeout: this.timeout, token: this.token });
        const method = `${this.module}.${funcName}`;
        const result = await client.callMethod(method, params, { timeout: this.timeout });

        if (result.length === 0) {
            throw new Error('Too few (none) return values in return array');
        }

        return (result as unknown) as ReturnType;
    }
    async callFuncEmptyResult<ParamType extends JSONArray>(funcName: string, params: ParamType): Promise<void> {
        const client = new JSONRPCClient({ url: this.url, timeout: this.timeout, token: this.token });
        const method = `${this.module}.${funcName}`;
        const result = await client.callMethod(method, params, { timeout: this.timeout });

        if (result.length !== 0) {
            throw new Error(`Too many (${result.length}) return values in return array`);
        }

        return;
    }
}
