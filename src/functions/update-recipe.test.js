const { isTokenValid } = require("../auth");
const { handler: createRecipeHandler } = require("./create-recipe");
const { handler: fetchRecipeHandler } = require("./fetch-recipe");
const { handler } = require("./update-recipe");
const { aRecipe, corsHeaders } = require("../test-helper");

describe("updateRecipe", () => {
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

  it("should return not found when update recipe that does not exist", async () => {
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

  it("should return forbidden when update recipe that is not owned by user", async () => {
    isTokenValid.mockResolvedValue({ email: "another-user@domain.com" });
    const {
      headers: { Location: createRecipeLocation },
    } = await createRecipeHandler({
      headers: {
        Authorization: "Bearer VALID",
      },
      body: JSON.stringify(aRecipe()),
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
      headers: corsHeaders(),
    });
  });

  it("should return no content", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const {
      headers: { Location: createRecipeLocation },
    } = await createRecipeHandler({ headers: { Authorization: "Bearer VALID" }, body: JSON.stringify(aRecipe()) });

    const response = await handler({
      headers: { Authorization: "Bearer VALID" },
      pathParameters: { recipeId: createRecipeLocation.split("/").pop() },
      body: JSON.stringify({ ...aRecipe(), name: "Updated name" }),
    });

    expect(response).toEqual({
      statusCode: 204,
      headers: {
        ...corsHeaders(),
        Location: expect.stringMatching("/recipes/.+"),
      },
    });
    const { body: fetchRecipeResponseBody } = await fetchRecipeHandler({
      headers: {
        Authorization: "Bearer VALID",
      },
      pathParameters: {
        recipeId: createRecipeLocation.split("/").pop(),
      },
    });
    expect(JSON.parse(fetchRecipeResponseBody)).toEqual({
      ...aRecipe(),
      id: expect.stringMatching("name-[0-9]+"),
      name: "Updated name",
      isEditable: true,
    });
  });
});
