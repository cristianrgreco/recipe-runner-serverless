const { isTokenValid } = require("../auth");
const { handler: createRecipeHandler } = require("./create-recipe");
const { handler } = require("./delete-recipe");

describe("deleteRecipe", () => {
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

  it("should return not found when delete recipe that does not exist", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });

    const response = await handler({
      headers: { Authorization: "Bearer VALID" },
      pathParameters: {
        recipeId: "non-existent",
      },
    });

    expect(response).toEqual({
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Location",
      },
    });
  });

  it("should return forbidden when delete recipe that is not owned by user", async () => {
    isTokenValid.mockResolvedValue({ email: "another-user@domain.com" });
    const {
      headers: { Location: createRecipeLocation },
    } = await createRecipeHandler({
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

    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const response = await handler({
      headers: { Authorization: "Bearer VALID" },
      pathParameters: {
        recipeId: createRecipeLocation.split("/").pop(),
      },
    });

    expect(response).toEqual({
      statusCode: 403,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Location",
      },
    });
  });

  it("should return no content", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const {
      headers: { Location: createRecipeLocation },
    } = await createRecipeHandler({
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

    const response = await handler({
      headers: { Authorization: "Bearer VALID" },
      pathParameters: {
        recipeId: createRecipeLocation.split("/").pop(),
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Location",
      },
    });
  });
});
