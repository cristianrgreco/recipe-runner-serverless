const { isTokenValid } = require("../auth");
const { handler } = require("./create-recipe");

describe("createRecipe", () => {
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

  it("should return created", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });

    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      body: JSON.stringify({
        name: "Name",
        image: "Image",
        description: "Description",
        serves: 4,
        duration: 10000,
        equipment: [],
        ingredients: [],
        method: [],
      }),
    });

    expect(response).toEqual({
      statusCode: 201,
      headers: {
        Location: expect.stringMatching("/recipes/.+"),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Location",
      },
    });
  });
});
