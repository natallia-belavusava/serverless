export default (event, context, callback) => {
  const token = event.authorizationToken;
  const b64Creds = token.split(" ")[1];

  if (event["type"] !== "TOKEN" || !b64Creds) {
    callback("Unauthorized"); // Return a 401 Unauthorized response
  }
  try {
    const creds = Buffer.from(b64Creds, "base64").toString("utf-8").split(":");
    const userName = creds[0];
    const password = creds[1];

    console.log(`userName ${userName}, password ${password}`);

    const storedPassword = process.env[userName];

    const effect =
      !storedPassword || storedPassword !== password ? "Deny" : "Allow";

    const policy = generatePolicy(b64Creds, effect, event.methodArn);

    callback(null, policy);
  } catch (e) {
    callback(`Unauthorized ${e.message}`);
  }
};

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, resource) {
  const authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};
