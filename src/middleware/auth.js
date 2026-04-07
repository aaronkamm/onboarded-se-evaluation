const verifyWebhookToken = (incomingToken) => {
  const expectedToken = process.env.ONBOARDED_WEBHOOK_TOKEN;
  if (!expectedToken) {
    throw new Error(`Token not set -- server can't verify webhook requests`);
  }
  return incomingToken === expectedToken;
};

export default verifyWebhookToken;
