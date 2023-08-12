import { Construct } from 'constructs';
import { Stage } from '../bin/env';
import * as ssm from '@aws-sdk/client-ssm';

function ensureLeadingSlash(s: string) {
  return s.startsWith('/') ? s : `/${s}`;
}

export enum ParameterRegistry {
  /**
   * This enum contains the list of all parameters that are used in the project.
   * Starting from the construct path, the parameter name is built as follows:
   * /<construct path>/<parameter name>
   *
   * It excludes the stack name, which is added by the ParameterClient for retrieval,
   * and by the generateParameterName function for infrastructure deployment.
   */
  integTests_Demo_QueueUrl = 'integTests/Demo/queueUrl',
  integTests_Demo_tableName = 'integTests/Demo/tableName',
}

export function generateParameterName(scope: Construct, name: string) {
  const paramName = `${scope.node.path}/${name}`;

  const withoutStackName = paramName.split('/').slice(1).join('/');
  if (
    !Object.values(ParameterRegistry).includes(
      withoutStackName as ParameterRegistry
    )
  ) {
    throw new Error(`Parameter name ${paramName} is not in the registry`);
  }
  return ensureLeadingSlash(paramName);
}

export class ParameterClient {
  private readonly stage: Stage;

  private readonly paramNameStackPrefix: string;

  private readonly featureBranchName?: string;

  private readonly client: ssm.SSMClient;

  constructor(stage: Stage, client: ssm.SSMClient, featureBranchName?: string) {
    this.stage = stage;
    if (stage === Stage.DEV && featureBranchName === undefined) {
      throw new Error('feature_branch_name must be provided for DEV stage');
    }
    this.featureBranchName = featureBranchName;
    this.paramNameStackPrefix = this.determineParamNameStackPrefix();
    this.client = client;
  }

  private determineParamNameStackPrefix(): string {
    if (this.stage === Stage.DEV) {
      return `${this.featureBranchName}-${this.stage.toString()}`;
    } else {
      return this.stage.toString();
    }
  }

  public async retrieveParameter(parameterName: ParameterRegistry) {
    const completeParameterName = ensureLeadingSlash(
      `${this.paramNameStackPrefix}/${parameterName.toString()}`
    );
    let response;
    try {
      response = await this.client.send(
        new ssm.GetParameterCommand({
          Name: completeParameterName,
          WithDecryption: false,
        })
      );
    } catch (e) {
      throw new Error(
        `Parameter ${completeParameterName} could not be retrieved: ${e}`
      );
    }
    const value = response.Parameter?.Value;
    if (!value) {
      throw new Error(
        `No value in response for parameter ${completeParameterName}, response: ${JSON.stringify(
          response
        )}`
      );
    }
    return value;
  }

  public async retrieveParameters<K extends string>(
    parameterNames: Record<K, ParameterRegistry>
  ): Promise<Record<K, string>> {
    const keys = Object.keys(parameterNames) as K[];
    const promises = keys.map((key) =>
      this.retrieveParameter(parameterNames[key])
    );

    const values = await Promise.all(promises);
    return keys.reduce((acc, key, i) => {
      acc[key] = values[i];
      return acc;
    }, {} as Record<K, string>);
  }
}
