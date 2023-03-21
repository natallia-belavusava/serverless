import { S3 } from "@aws-sdk/client-s3";
import AWS from "aws-sdk";
import csv from "csv-parser";

const sendToSQS = (data) => {
  const sqs = new AWS.SQS();

  sqs.sendMessage(
    {
      QueueUrl: process.env.SQS_URL,
      MessageBody: data,
    },
    () => console.log("Send message for: " + data)
  );
};
const importedFileTransformer = async (event) => {
  try {
    const s3 = new S3({ region: process.env.REGION });

    for (const record of event.Records) {
      const Bucket = record.s3.bucket.name;
      const Key = record.s3.object.key;
      const newKey = record.s3.object.key.replace("uploaded", "parsed");

      const params = { Bucket, Key };
      const stream = await s3.getObject(params);

      stream.Body.pipe(csv()).on("data", (data) => {
        const obj = {};
        for (let key in data) {
          const values = data[key].split(";");
          const keys = key.split(";");
          keys.forEach((k, index) => {
            obj[k] = values[index];
          });
        }
        sendToSQS(JSON.stringify(obj));
      });

      await s3.copyObject({
        Bucket,
        Key: newKey,
        CopySource: Bucket + "/" + Key,
      });

      await s3.deleteObject({
        Bucket,
        Key,
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "file parsed",
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
  return await importedFileTransformer(event);
};
