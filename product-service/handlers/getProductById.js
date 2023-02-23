"use strict";

import mockProductsArray from "./../mockProducts.js";

const getProductMock = (id) => {
  return new Promise((resolve, reject) => {
    const product = mockProductsArray.filter((product) => {
      return product.id === id;
    });
    if (!product?.length) {
      reject(new Error("Product not found"))
    }
    resolve(product);
  });
};
const getProductById = async (id) => {
  try {
    const mockProduct = await getProductMock(id);
    return {
      statusCode: 200,
      headers: {
        // Required for CORS support to work
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(mockProduct),
    };
  } catch (error) {
    console.log(error)
    return {
      statusCode: 404,
      headers: {
        // Required for CORS support to work
        "Access-Control-Allow-Origin": "*",
      },
      body: error.message,
    };
  }
};

export default async (event) => {
  const productId = event.pathParameters?.id;
  return await getProductById(productId);
};
