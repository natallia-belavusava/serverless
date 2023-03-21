import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import productSchema from "./../productSchema.js";

const dynamo = new AWS.DynamoDB.DocumentClient();
const productsTable = process.env.PRODUCTS_TABLE;
const stocksTable = process.env.STOCKS_TABLE;

const createProduct = async (event) => {
  const { title, description, price, count } = JSON.parse(event);
  console.log(
    `POST - createProduct with title ${title}, description ${description}, price ${price}, count ${count}; event ${event}`
  );
  try {
    const { error } = productSchema.validate({
      title,
      description,
      price,
      count,
    });

    if (error) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/plain" },
        body: error.message,
      };
    }

    const id = uuidv4();
    await dynamo
      .transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: productsTable,
              Item: { title, description, price, id },
            },
          },
          {
            Put: {
              TableName: stocksTable,
              Item: { count, product_id: id },
            },
          },
        ],
      })
      .promise();

    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 200,
      body: JSON.stringify({ id, title, description, price, count }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: { "Content-Type": "text/plain" },
      body: error.message,
    };
  }
};

export default async (event) => {
  return await createProduct(event);
};
