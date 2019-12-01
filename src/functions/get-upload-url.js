const {S3} = require('aws-sdk');
const uuid = require('uuid/v1');
const mime = require('mime-types');
const {isTokenValid} = require('../auth');

module.exports.handler = event => new Promise(async resolve => {
    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            }
        };
    }

    const contentType = event.queryStringParameters.contentType;
    const filename = `${uuid()}.${mime.extension(contentType)}`;

    const params = {
        Bucket: 'recipe-runner-uploads',
        Key: filename,
        ContentType: contentType
    };

    const uploadUrl = new S3().getSignedUrl('putObject', params);

    resolve({
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({uploadUrl, filename})
    })
});
