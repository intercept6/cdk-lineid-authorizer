import { expect as expectCDK, haveResource, SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';
import { AuthorizationType, MockIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import * as CdkLineidAuthorizer from '../lib/index';

test('APIGateway Authorizer Created', () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    // WHEN
    const { authorizer }  = new CdkLineidAuthorizer.CdkLineidAuthorizer(stack, 'MyTestConstruct');
    const api =  new RestApi(stack, 'Api');
    api.root.addMethod('GET', new MockIntegration(), {
      authorizationType: AuthorizationType.CUSTOM,
      authorizer
    });

    // THEN
    expectCDK(stack).to(haveResource("AWS::ApiGateway::Authorizer", {
      Type: 'TOKEN',
      IdentitySource: "method.request.header.Authorization",
    }));
});

test('Snapshot test', () => {
  const app = new App();
  const stack = new Stack(app, "TestStack");
  // WHEN
  const { authorizer }  = new CdkLineidAuthorizer.CdkLineidAuthorizer(stack, 'MyTestConstruct');
  const api =  new RestApi(stack, 'Api');
  api.root.addMethod('GET', new MockIntegration(), {
    authorizationType: AuthorizationType.CUSTOM,
    authorizer
  });

  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
