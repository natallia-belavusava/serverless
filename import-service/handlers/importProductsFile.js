import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const bucket = process.env.BUCKET;
const region = process.env.REGION;

const createPresignedUrl = async ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};
const importProductsFile = async (fileName) => {
  try {
    const presignedUrl = await createPresignedUrl({
      region,
      bucket,
      key: `uploaded/${fileName}`,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(presignedUrl),
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
  const fileName = event.queryStringParameters.name;
  return await importProductsFile(fileName);
};
