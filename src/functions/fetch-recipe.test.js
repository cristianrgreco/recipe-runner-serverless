const { isTokenValid } = require("../auth");
const { handler: createRecipeHandler } = require("./create-recipe");
const { handler } = require("./fetch-recipe");
const { aRecipe, corsHeaders } = require("../test-helper");

describe("fetchRecipe", () => {
  it("should return not found when recipe does not exist", async () => {
    isTokenValid.mockResolvedValue(false);

    const response = await handler({
      headers: {
        Authorization: undefined,
      },
      pathParameters: {
        recipeId: "non-existent",
      },
    });

    expect(response).toEqual({
      statusCode: 404,
      headers: corsHeaders(),
    });
  });

  it("should return ok and and not editable when recipe not owned by user", async () => {
    isTokenValid.mockResolvedValue({ email: "another-user@domain.com" });
    const {
      headers: { Location: createRecipeLocation },
    } = await createRecipeHandler({ headers: { Authorization: "Bearer VALID" }, body: JSON.stringify(aRecipe()) });

    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      pathParameters: {
        recipeId: createRecipeLocation.split("/").pop(),
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual(corsHeaders());
    expect(JSON.parse(response.body)).toEqual({
      ...aRecipe(),
      id: expect.stringMatching("name-[0-9]+"),
    });
  });

  it("should return ok and and editable when recipe owned by user", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const {
      headers: { Location: createRecipeLocation },
    } = await createRecipeHandler({ headers: { Authorization: "Bearer VALID" }, body: JSON.stringify(aRecipe()) });
    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      pathParameters: {
        recipeId: createRecipeLocation.split("/").pop(),
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual(corsHeaders());
    expect(JSON.parse(response.body)).toEqual({
      ...aRecipe(),
      id: expect.stringMatching("name-[0-9]+"),
      isEditable: true,
    });
  });
});
