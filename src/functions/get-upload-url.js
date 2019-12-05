const {S3} = require('aws-sdk');
const uuid = require('uuid/v1');
const mime = require('mime-types');
const {isTokenValid} = require('../auth');
const corsHeaders = require('../cors-headers');

const s3 = new S3();

module.exports.handler = async event => {
    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401,
            headers: corsHeaders
        };
    }

    const contentType = event.queryStringParameters.contentType;
    const filename = `${uuid()}.${mime.extension(contentType)}`;

    const params = {
        Bucket: 'recipe-runner-uploads',
        Key: filename,
        ContentType: contentType
    };

    const uploadUrl = s3.getSignedUrl('putObject', params);

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({uploadUrl, filename})
    };
};
