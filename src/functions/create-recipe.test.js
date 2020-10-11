const { isTokenValid } = require("../auth");
const { handler } = require("./create-recipe");
const { aRecipe, corsHeaders } = require("../test-helper");

describe("createRecipe", () => {
  it("should return unauthorised when token is invalid", async () => {
    isTokenValid.mockResolvedValue(false);

    const response = await handler({
      headers: { Authorization: "Bearer INVALID" },
    });

    expect(response).toEqual({
      statusCode: 401,
      headers: corsHeaders(),
    });
  });

  it("should return created", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });

    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      body: JSON.stringify(aRecipe()),
    });

    expect(response).toEqual({
      statusCode: 201,
      headers: {
        ...corsHeaders(),
        Location: expect.stringMatching("/recipes/.+"),
      },
    });
  });
});
