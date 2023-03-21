import catalogBatchProcess from "./../handlers/catalogBatchProcess";
import { SNSClient } from "@aws-sdk/client-sns";
import { PublishCommand } from "@aws-sdk/client-sns";
import createProduct from "./../handlers/createProduct.js";

jest.mock(`@aws-sdk/client-sns`);

jest.mock("./../handlers/createProduct.js", () =>
  jest.fn(() => Promise.resolve())
);

SNSClient.mockImplementation(() => {
  return "SNSClient";
});

PublishCommand.mockImplementation(() => {
  return "PublishCommand";
});
const event = {
  Records: [
    {
      body: {
        title: "test-title1",
      },
    },
    {
      body: {
        title: "test-title2",
      },
    },
  ],
};

describe("catalogBatchProcess", () => {
  const originalEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {};
    process.env = {
      region: "region",
      SNS_ARN: "SNS_ARN",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  it("Should call createProduct function", async () => {
    await catalogBatchProcess(event);

    expect(createProduct).toHaveBeenCalledTimes(2);
    expect(createProduct).toHaveBeenCalledWith({
      title: "test-title1",
    });
    expect(createProduct).toHaveBeenCalledWith({
      title: "test-title2",
    });
  });
  it("Should send products to SNS", async () => {
    await catalogBatchProcess(event);

    expect(PublishCommand).toHaveBeenCalledWith({
      Message: [
        {
          title: "test-title1",
        },
        {
          title: "test-title2",
        },
      ],
      TopicArn: "SNS_ARN",
    });
  });
  it("Should log en error if sending products to SNS results in error", async () => {
    PublishCommand.mockImplementationOnce(() => {
      throw new Error("Test error");
    });
    jest.spyOn(console, "error");
    await catalogBatchProcess(event);
    expect(console.error).toHaveBeenCalledWith("Test error");

    jest.restoreAllMocks();
  });
});
