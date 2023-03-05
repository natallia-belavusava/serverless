import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const productsTable = process.env.PRODUCTS_TABLE;
const stocksTable = process.env.STOCKS_TABLE;

const getProducts = async () => {
  console.log(`GET - getProductsList`);
  const products = await dynamo.scan({ TableName: productsTable }).promise();
  const stocks = await dynamo.scan({ TableName: stocksTable }).promise();

  return products.Items.map((product) => {
    const stock = stocks.Items.find((stock) => stock.product_id === product.id);
    return { ...product, count: stock.count };
  });
};

const getProductsList = async () => {
  try {
    const productsArray = await getProducts();
    return {
      statusCode: 200,
      headers: {
        // Required for CORS support to work
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(productsArray),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/plain",
      },
      body: error.message,
    };
  }
};

export default async (event) => {
  return await getProductsList();
};
