import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigateway';

export interface CdkLineidAuthorizerProps {
  /**
   * Authorizer Lambda関数のプロパティ
   */
  authFnProps?: lambda.NodejsFunctionProps;
}

export class CdkLineidAuthorizer extends cdk.Construct {
  /** @returns the authorizer */
  public readonly authorizer: apigateway.Authorizer;

  constructor(scope: cdk.Construct, id: string, props: CdkLineidAuthorizerProps = {}) {
    super(scope, id);

    const authFn = new lambda.NodejsFunction(this, 'AuthorizerLambda', {
      entry: 'lambda/authFn.ts',
      handler: 'handler',
      ...this.authorizer
    })

    this.authorizer = new apigateway.TokenAuthorizer(this, 'Authorizer', {
      handler: authFn,
    })
  }
}
