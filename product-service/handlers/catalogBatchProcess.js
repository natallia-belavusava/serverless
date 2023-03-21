import { SNSClient } from "@aws-sdk/client-sns";
import { PublishCommand } from "@aws-sdk/client-sns";
import createProduct from "./createProduct.js";

const snsClient = new SNSClient({ region: process.env.region });
const sendToSNS = async (products) => {
  const params = {
    Message: products, // MESSAGE_TEXT
    TopicArn: process.env.SNS_ARN, //TOPIC_ARN
  };

  try {
    const data = await snsClient.send(new PublishCommand(params));
    return data;
  } catch (err) {
    console.error(err.message);
  }
};
const catalogBatchProcess = async (products) => {
  for (const product of products) {
    await createProduct(product);
  }

  await sendToSNS(products);
};
export default async (event) => {
  const products = event.Records.map(({ body }) => body);
  return await catalogBatchProcess(products);
};
