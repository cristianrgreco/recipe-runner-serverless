const { isTokenValid } = require("../auth");
const { handler: createRecipeHandler } = require("./create-recipe");
const { handler } = require("./fetch-recipe");

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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Location",
      },
    });
  });

  it("should return ok and and not editable when recipe not owned by user", async () => {
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
      headers: {
        Authorization: undefined,
      },
      pathParameters: {
        recipeId: createRecipeLocation.split("/").pop(),
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Expose-Headers": "Location",
    });
    expect(JSON.parse(response.body)).toEqual({
      id: expect.stringMatching("name-[0-9]+"),
      name: "Name",
      image: "Image",
      description: "Description",
      serves: 4,
      duration: 10000,
      equipment: [],
      ingredients: [],
      method: [],
    });
  });

  it("should return ok and and editable when recipe owned by user", async () => {
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
      headers: {
        Authorization: undefined,
      },
      pathParameters: {
        recipeId: createRecipeLocation.split("/").pop(),
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Expose-Headers": "Location",
    });
    expect(JSON.parse(response.body)).toEqual({
      id: expect.stringMatching("name-[0-9]+"),
      name: "Name",
      image: "Image",
      description: "Description",
      serves: 4,
      duration: 10000,
      equipment: [],
      ingredients: [],
      method: [],
      isEditable: true,
    });
  });
});
