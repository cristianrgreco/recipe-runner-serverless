const { S3 } = require("aws-sdk");
const { isTokenValid } = require("../auth");
const { handler } = require("./get-upload-url");

describe("getUploadUrl", () => {
  it("should return unauthorised when token is invalid", async () => {
    isTokenValid.mockResolvedValue(false);

    const response = await handler({
      headers: { Authorization: "Bearer INVALID" },
    });

    expect(response).toEqual({
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Location",
      },
    });
  });

  it("should return ok and the upload url and filename", async () => {
    S3.prototype.getSignedUrl.mockReturnValue("http://upload-url.com");
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });

    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      queryStringParameters: {
        contentType: "image/png",
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Expose-Headers": "Location",
    });
    expect(JSON.parse(response.body)).toEqual({
      uploadUrl: "http://upload-url.com",
      filename: expect.stringMatching(".+.png"),
    });
  });
});
