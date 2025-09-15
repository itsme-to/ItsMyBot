import { Action, ActionData, FollowUpActionArgumentsValidator, Context, Variable, Utils } from '@itsmybot';
import { IsDefined, IsOptional, IsString } from 'class-validator';

class ArgumentsValidator extends FollowUpActionArgumentsValidator {
  @IsDefined()
  @IsString()
  value: string;
  
  @IsOptional()
  @IsString()
  method: string

  @IsOptional()
  body: any

  @IsOptional()
  headers: any
}

export default class SendRequestAction extends Action {
  id = "sendRequest";
  argumentsValidator = ArgumentsValidator;

  async onTrigger(script: ActionData, context: Context, variables: Variable[]) {
    const url = script.args.getString("value");

    const method = script.args.getStringOrNull("method") || "GET";
    const headers = await this.applyVariablesToObject(script.args.getObjectOrNull("headers"), variables, context);
    const body = await this.applyVariablesToObject(script.args.getObjectOrNull("body"), variables, context);

    const requestOptions: RequestInit = {
      method,
      headers,
      body,
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");


      let data: any;
      if (contentType?.includes("application/json")) {
        data = await response.json();
        variables.push(...this.jsonToVariable(data));
      } else {
        data = await response.text();
        variables.push({ searchFor: "%data%", replaceWith: data });
      }

      return this.triggerFollowUpActions(script, context, variables);
    } catch (error) {
      script.logger.error(`Error fetching data: ${error}`);
    }
  }

  jsonToVariable(json: any, path?: string): Variable[] {
    const variables: Variable[] = [];
    if (typeof json === "object" && json !== null) {
      for (const key in json) {
        const value = json[key];
        variables.push(...this.jsonToVariable(value, this.getPath(key, path)));
      }
    } else {
      variables.push({ searchFor: `%data_${path}%`, replaceWith: json });
    }
    return variables;
  }

  getPath(key: string, path: string | undefined): string {
    if (!path) return key;
    return `${path}_${key}`;
  }

  async applyVariablesToObject(obj: any, variables: Variable[], context: Context) {
    if (typeof obj === "object" && obj !== null && obj !== undefined) {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          const value = await Utils.applyVariables(obj[key], variables, context);
          obj[key] = value;
        } else {
          const value = await this.applyVariablesToObject(obj[key], variables, context);
          obj[key] = value;
        }
      }
    }
    return obj;
  }
}