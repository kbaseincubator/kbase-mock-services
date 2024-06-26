import {JSONArray, JSONObject, JSONValue} from '../../lib/json.ts';
import {JSONRPC11Exception} from './types.ts';

// import AJV from 'ajv';

export interface ModuleMethodInput {
    params: JSONValue;
    token: string | null;
    dataDir: string;
    timeout: number;
}

export default abstract class ModuleMethod<ParamType, ResultType> {
    // protected static paramsSchema: any;
    // protected static resultSchema: any;
    // protected validateParams?(possibleParams: MethodParams): ParamType;
    // validator: AJV.Ajv;

    inputParams: JSONArray;
    token: string | null;
    dataDir: string;
    timeout: number;

    // static paramCount: number = 1;
    constructor({params, token, dataDir, timeout}: ModuleMethodInput) {
        this.inputParams = this.ensureParams(params);
        this.token = token;
        this.dataDir = dataDir;
        this.timeout = timeout;

        // const paramsSchema = (this.constructor as typeof ModuleMethod).paramsSchema;
        // const resultSchema = (this.constructor as typeof ModuleMethod).resultSchema;

        // this.validator = new AJV({
        //     allErrors: true
        // });
        // this.validator.addSchema(paramsSchema, 'paramsSchema');
        // this.validator.addSchema(resultSchema, 'resultSchema');
    }

    errorInvalidParams(errorText: string) {
        return new JSONRPC11Exception({
            message: `Invalid params`,
            code: -32602,
            name: 'JSONRPCError',
            error: null
        });
    }

    errorMissingParam(paramName: string) {
        return new JSONRPC11Exception({
            message: `Invalid params - missing param ${paramName}`,
            code: -32602,
            name: 'JSONRPCError',
            error: null
        });
    }

    errorInvalidParamCount(countShouldBe: number, countIs: number) {
        return new JSONRPC11Exception({
            message: `Invalid param count, should be ${countShouldBe}, but is ${countIs}`,
            code: -32602,
            name: 'JSONRPCError',
            error: null
        });
    }

    errorWrongParamType(name: string, expectedType: string, actualType: string) {
        return new JSONRPC11Exception({
            message: `Invalid param type, ${name} should be ${expectedType}, but is ${actualType}`,
            code: -32602,
            name: 'JSONRPCError',
            error: null
        });
    }

    errorInternal() {
        return new JSONRPC11Exception({
            message: `Internal Error`,
            code: -32603,
            name: 'JSONRPCError',
            error: null
        });
    }

    errorMethodNotFound() {
        return new JSONRPC11Exception({
            message: `Method Not Found`,
            code: -32601,
            name: 'JSONRPCError',
            error: null
        });
    }

    checkParamCount(expectedCount: number) {
        if (this.inputParams.length !== expectedCount) {
            throw new JSONRPC11Exception({
                code: -32602,
                name: 'JSONRPCError',
                message: `Invalid params - wrong number of params, should be ${expectedCount}, is ${this.inputParams.length}`,
                error: null
            });
        }
    }

    errorParamsNotArray(actualType: string) {
        return new JSONRPC11Exception({
            message: `Invalid params - should be Array, but is not (${actualType})`,
            code: -32602,
            name: 'JSONRPCError',
            error: null
        });
    }

    ensureObject(possibleObject: any): JSONObject {
        if (typeof possibleObject !== 'object') {
            throw new JSONRPC11Exception({
                code: -32602,
                name: 'JSONRPCError',
                message: `Invalid params - expected object received ${typeof possibleObject}`,
                error: null
            });
        }
        if (possibleObject === null) {
            throw new JSONRPC11Exception({
                code: -32602,
                name: 'JSONRPCError',
                message: `Invalid params - unexpected null params`,
                error: null
            });
        }
        return possibleObject;
    }

    protected abstract validateParams(possibleParams: JSONArray): ParamType;

    private ensureParams(rawParams: JSONValue): JSONArray {
        if (!(rawParams instanceof Array)) {
            throw this.errorParamsNotArray(typeof this.inputParams);
        }
        return rawParams;
    }

    private checkParams(): ParamType {
        // const check1 = this.checkParamCount();
        // We can check now that it is an array.
        const params = this.inputParams;

        // return (params[0] as unknown) as ParamType;
        return (params as unknown) as ParamType;

        // TODO: get working
        // if (this.validator.validate('paramsSchema', params)) {
        //     return (params as unknown) as ParamType;
        // } else {
        //     throw this.errorInvalidParams(this.validator.errorsText());
        // }

    }

    protected validateStringParam(params: JSONObject, key: string): string {
        if (!(key in params)) {
            throw this.errorMissingParam(key);
        }
        const value = params[key];
        if (typeof value !== 'string') {
            throw this.errorWrongParamType(key, 'string', typeof value);
        }
        return value;
    }

    protected validateIntegerParam(params: JSONObject, key: string): number {
        if (!(key in params)) {
            throw this.errorMissingParam(key);
        }
        const value = params[key];
        if (typeof value !== 'number') {
            throw this.errorWrongParamType(key, 'int', typeof value);
        }
        if (!Number.isInteger(value)) {
            throw new JSONRPC11Exception({
                message: `Invalid numeric value '${value}', not an integer`,
                code: -32602,
                name: 'JSONRPCError',
                error: null
            });
        }
        if (Number.isNaN(value) || !Number.isFinite(value) || !Number.isSafeInteger(value)) {
            throw new JSONRPC11Exception({
                message: `Invalid numeric value '${value}'`,
                code: -32602,
                name: 'JSONRPCError',
                error: null
            });
        }
        return value;
    }

    protected validateFloatParam(params: JSONObject, key: string): number {
        if (!(key in params)) {
            throw this.errorMissingParam(key);
        }
        const value = params[key];
        if (typeof value !== 'number') {
            throw this.errorWrongParamType(key, 'float', typeof value);
        }
        if (Number.isNaN(value) || !Number.isFinite(value) || !Number.isSafeInteger(value)) {
            throw new JSONRPC11Exception({
                message: `Invalid numeric value '${value}'`,
                code: -32602,
                name: 'JSONRPCError',
                error: null
            });
        }
        return value;
    }

    protected validateBooleanParam(params: JSONObject, key: string): number {
        if (!(key in params)) {
            throw this.errorMissingParam(key);
        }
        const value = params[key];
        if (typeof value !== 'number') {
            throw this.errorWrongParamType(key, 'bool (0 or 1)', typeof value);
        }
        if (!Number.isInteger(value)) {
            throw new JSONRPC11Exception({
                message: `Invalid boolean value, '${value}' must be an integer`,
                code: -32602,
                name: 'JSONRPCError',
                error: null
            });
        }
        if (Number.isNaN(value) || !Number.isFinite(value) || !Number.isSafeInteger(value)) {
            throw new JSONRPC11Exception({
                message: `Invalid boolean, must be an an integer of value 1 or 0, given '${value}'`,
                code: -32602,
                name: 'JSONRPCError',
                error: null
            });
        }
        if (value !== 0 && value !== 1) {
            throw new JSONRPC11Exception({
                message: `Invalid boolean value, '${value}' must be '0' (false) or '1' (true)`,
                code: -32602,
                name: 'JSONRPCError',
                error: null
            });
        }
        return value;
    }

    protected abstract callFunc(params: ParamType): Promise<ResultType>;

    run(): Promise<ResultType> {
        const params = this.checkParams();
        return this.callFunc(params);
    }
}