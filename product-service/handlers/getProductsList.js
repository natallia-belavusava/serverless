"use strict";

import mockProductsArray from "./../mockProducts.js";

const getProductsMock = () => {
  return new Promise((resolve) => {
    resolve(mockProductsArray);
  });
};
const getProductsList = async () => {
  try {
    const mockProductsArray = await getProductsMock();
    return {
      statusCode: 200,
      headers: {
        // Required for CORS support to work
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(mockProductsArray),
    };
  } catch (e) {}
};

export default async (event) => {
  return await getProductsList();
};
