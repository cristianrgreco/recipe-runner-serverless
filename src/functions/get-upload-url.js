const { S3 } = require("aws-sdk");
const { v1: uuid } = require("uuid");
const mime = require("mime-types");
const { isTokenValid } = require("../auth");
const corsHeaders = require("../cors-headers");

const s3 = new S3();

module.exports.handler = async (event) => {
  console.log("Get upload URL");
  const token = await isTokenValid(event.headers.Authorization);
  if (!token) {
    console.log("Unauthorised");
    return {
      statusCode: 401,
      headers: corsHeaders,
    };
  }

  const contentType = event.queryStringParameters.contentType;
  const filename = `${uuid()}.${mime.extension(contentType)}`;

  const params = {
    Bucket: "recipe-runner-uploads",
    Key: filename,
    ContentType: contentType,
  };

  console.log("Creating upload URL");
  const uploadUrl = s3.getSignedUrl("putObject", params);
  console.log("Created upload URL");

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ uploadUrl, filename }),
  };
};
