import getProductsList from "./../handlers/getProductsList";

jest.mock(`aws-sdk`, () => {
  class mockDocumentClient {
    scan() {
      return {
        promise: jest.fn().mockReturnValue({
          Items: [
            {
              product: "test-product",
            },
          ],
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
describe("getProductsList", () => {
  it("Should return the correct response ", async () => {
    const response = await getProductsList();
    const expectedResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify([{ product: "test-product" }]),
    };
    expect(response).toStrictEqual(expectedResponse);
  });
});
