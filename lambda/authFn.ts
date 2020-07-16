import axios, { AxiosError } from 'axios';
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, PolicyDocument } from 'aws-lambda';

type VerifyResponse = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time?: number;
  nonce?: string;
  amr: ['pwd', 'lineautologin', 'lineqr', 'linesso'];
  name?: string;
  picture?: string;
  email?: string;
};

type VerifyError = {
  error: string;
  error_description: string;
}

const verifyIdToken = async ({idToken}: { idToken: string }): Promise<VerifyResponse> => {
  const res = await axios.post<VerifyResponse>('https://api.line.me/oauth2/v2.1/verify', {
    id_token: idToken,
    client_id: process.env.CLIENT_ID
  }).catch((e: AxiosError<VerifyError>) => {
    console.log('Error: ' + JSON.stringify(e.response?.data, null, 2));
    throw new Error(e.response?.data.error);
  });

  return res.data;
};

const generatePolicy = (
  {
    resource,
    effect,
  }: {
    effect: 'Allow' | 'Deny',
    resource: string,
  }): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: effect,
        Action: 'execute-api:Invoke',
        Resource: resource
      }
    ]
  };

};

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('Event: ' + JSON.stringify(event, null, 2));

  // API Gatewayによるバリデーションで Barere XXXXXX 形式である事は担保されているので例外処理は不要です。
  const idToken = event.authorizationToken.split(' ')[1];

  const payload = await verifyIdToken({ idToken }).catch(() => {
    return null;
  });

  const principalId = 'user';
  const resource = event.methodArn;

  if (payload == null) {
    return {
      principalId,
      policyDocument: generatePolicy({effect: 'Deny', resource}),
    }
  }

  return {
    principalId,
    context: {
      sub: payload.sub,
      name: payload.name,
      picture: payload.picture,
      email: payload.email
    },
    policyDocument: generatePolicy({effect: 'Allow', resource}),
  }
};
