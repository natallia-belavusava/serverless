import { S3 } from "@aws-sdk/client-s3";
import csv from "csv-parser";

const importedFileTransformer = async (event) => {
  try {
    const s3 = new S3({ region: process.env.REGION });
    const results = [];
    for (const record of event.Records) {
      const Bucket = record.s3.bucket.name;
      const Key = record.s3.object.key;
      const newKey = record.s3.object.key.replace("uploaded", "parsed");
      await s3.copyObject({
        Bucket,
        Key: newKey,
        CopySource: Bucket + "/" + Key,
      });

      await s3.deleteObject({
        Bucket,
        Key: Key,
      });

      const params = { Bucket, Key: newKey };
      const stream = await s3.getObject(params);
      stream.Body.pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          console.log("results", results);
        });
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(results),
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
