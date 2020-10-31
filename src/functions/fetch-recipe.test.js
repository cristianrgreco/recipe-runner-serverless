const { isTokenValid } = require("../auth");
const { handler } = require("./fetch-recipe");
const { aRecipe, createRecipe, corsHeaders } = require("../test-helper");

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

  it("should return ok and not editable when recipe not owned by user", async () => {
    isTokenValid.mockResolvedValue({ id: "id2" });
    const createdRecipeId = await createRecipe();

    isTokenValid.mockResolvedValue({ id: "id1" });
    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      pathParameters: {
        recipeId: createdRecipeId,
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual(corsHeaders());
    expect(JSON.parse(response.body)).toEqual({
      ...aRecipe(),
      id: expect.stringMatching("name-[0-9]+"),
    });
  });

  it("should return ok and editable when user is admin", async () => {
    isTokenValid.mockResolvedValue({ id: "id2" });
    const createdRecipeId = await createRecipe();

    isTokenValid.mockResolvedValue({ id: "id1", isAdmin: true });
    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      pathParameters: {
        recipeId: createdRecipeId,
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

  it("should return ok and editable when recipe owned by user", async () => {
    isTokenValid.mockResolvedValue({ id: "id1" });
    const createdRecipeId = await createRecipe();

    const response = await handler({
      headers: {
        Authorization: "Bearer VALID",
      },
      pathParameters: {
        recipeId: createdRecipeId,
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
