import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const productsTable = process.env.PRODUCTS_TABLE;
const stocksTable = process.env.STOCKS_TABLE;

const getProduct = async (id) => {
  console.log(`GET - getProduct by Id: id = ${id} `);
  const product = await dynamo
    .query({
      TableName: productsTable,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();

  const stock = await dynamo
    .query({
      TableName: stocksTable,
      KeyConditionExpression: "product_id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();

  if (!product?.Items?.length || !stock?.Items?.length) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return { ...product.Items[0], count: stock.Items[0].count };
};
const getProductById = async (id) => {
  try {
    const product = await getProduct(id);
    return {
      statusCode: 200,
      headers: {
        // Required for CORS support to work
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(product),
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
  const productId = event.pathParameters?.id;
  return await getProductById(productId);
};
