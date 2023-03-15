import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import mockProductsArray from "./mockProducts.js";
import * as dotenv from "dotenv";

dotenv.config();
AWS.config.update({ region: process.env.REGION });

const productsTable = process.env.PRODUCTS_TABLE;
const stocksTable = process.env.STOCKS_TABLE;

const dynamo = new AWS.DynamoDB.DocumentClient();

const putItemProductTable = async (item) => {
  return await dynamo.put({ TableName: productsTable, Item: item }).promise();
};

const putItemStocksTable = async (item) => {
  console.log(item);
  return await dynamo.put({ TableName: stocksTable, Item: item }).promise();
};

const putProductsItems = async () => {
  return mockProductsArray.forEach((item) => {
    const uuid = uuidv4();
    putItemStocksTable({ product_id: uuid, count: item.count });
    putItemProductTable({
      id: uuid,
      title: item.title,
      description: item.description,
      price: item.price,
    });
  });
};

putProductsItems();
