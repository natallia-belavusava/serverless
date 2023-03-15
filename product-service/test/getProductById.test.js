import getProductById from "./../handlers/getProductById";

jest.mock(`aws-sdk`, () => {
  class mockDocumentClient {
    query() {
      return {
        promise: jest
          .fn()
          .mockReturnValueOnce({
            Items: [
              {
                id: "1",
                title: "test-title1",
                description: "test-description1",
                price: 100,
                count: 1,
              },
            ],
          })
          .mockReturnValueOnce({
            Items: [],
          }),
      };
    }
  }
  return {
    DynamoDB: {
      DocumentClient: mockDocumentClient,
    },
  };
});

const event = { httpMethod: "GET", pathParameters: { id: "1" } };

describe("getProductById", () => {
  it("should return product by id from an array of products", async () => {
    const response = await getProductById(event);
    const expectedResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        id: "1",
        title: "test-title1",
        description: "test-description1",
        price: 100,
        count: 1,
      }),
    };
    expect(response).toStrictEqual(expectedResponse);
  });
  it("should return error message and 404 status code if the product is not found", async () => {
    const response = await getProductById({
      ...event,
      pathParameters: { id: "error" },
    });
    const expectedResponse = {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      body: "Product not found",
    };
    expect(response).toStrictEqual(expectedResponse);
  });
});
