const { isTokenValid } = require("../auth");
const { handler } = require("./delete-recipe");
const { corsHeaders, createRecipe } = require("../test-helper");

describe("deleteRecipe", () => {
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
      headers: corsHeaders(),
    });
  });

  it("should return forbidden when delete recipe that is not owned by user", async () => {
    isTokenValid.mockResolvedValue({ email: "another-user@domain.com" });
    const createdRecipeId = await createRecipe();

    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const response = await handler({
      headers: { Authorization: "Bearer VALID" },
      pathParameters: {
        recipeId: createdRecipeId,
      },
    });

    expect(response).toEqual({
      statusCode: 403,
      headers: corsHeaders(),
    });
  });

  it("should return no content", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const createdRecipeId = await createRecipe();

    const response = await handler({
      headers: { Authorization: "Bearer VALID" },
      pathParameters: {
        recipeId: createdRecipeId,
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      headers: corsHeaders(),
    });
  });
});
