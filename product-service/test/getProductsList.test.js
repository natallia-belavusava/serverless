import getProductsList from "./../handlers/getProductsList";
import mockProductsArray from "./../mockProducts.js";

jest.mock("./../mockProducts.js", () => {
  return [{ product: "test-product" }];
});

describe("getProductsList", () => {
  it("Should return the correct response ", async () => {
    const response = await getProductsList();
    const expectedResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify([{ product: "test-product" }]),
    };
    expect(response).toStrictEqual(expectedResponse);
  });
});
