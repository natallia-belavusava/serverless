import importProductsFile from "./../handlers/importProductsFile.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
jest.mock(`@aws-sdk/client-s3`);
PutObjectCommand.mockImplementation(() => {
  return "PutObjectCommand";
});
S3Client.mockImplementation(() => {
  return "S3Client";
});

jest.mock(`@aws-sdk/s3-request-presigner`);

getSignedUrl
  .mockImplementationOnce(() => "presignedUrl")
  .mockImplementationOnce(() => {
    throw new Error("error");
  })
  .mockImplementation(() => "presignedUrl");

describe("importProductsFile", () => {
  const originalEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {};
    process.env = {
      BUCKET: "bucket",
      REGION: "region",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  it("Should return the correct response with presigned Url ", async () => {
    const response = await importProductsFile({
      queryStringParameters: { name: "fileName" },
    });
    const expectedResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify("presignedUrl"),
    };
    expect(response).toStrictEqual(expectedResponse);
  });
  it("should return error message and 500 status code if error occurred", async () => {
    const response = await importProductsFile({
      queryStringParameters: { name: "fileName" },
    });
    const expectedResponse = {
      statusCode: 500,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "error",
    };
    expect(response).toStrictEqual(expectedResponse);
  });
  it("should call @aws-sdk functions with correct arguments", async () => {
    await importProductsFile({
      queryStringParameters: { name: "fileName" },
    });
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.BUCKET,
      Key: "uploaded/fileName",
    });
    expect(S3Client).toHaveBeenCalledWith({ region: process.env.REGION });
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 3600 }
    );
  });
});
