const { isTokenValid } = require("../auth");
const { handler: createRecipeHandler } = require("./create-recipe");
const { handler } = require("./fetch-recipes");

describe("fetchRecipes", () => {
  it("should return ok and and not editable when recipes not owned by user", async () => {
    const recipe = {
      name: "Name",
      image: "Image",
      description: "Description",
      serves: 4,
      duration: 10000,
      equipment: [],
      ingredients: [],
      method: [],
    };
    isTokenValid.mockResolvedValue({ email: "another-user@domain.com" });
    await createRecipeHandler({ headers: { Authorization: "Bearer VALID" }, body: JSON.stringify(recipe) });

    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    const response = await handler({ headers: { Authorization: "Bearer VALID" } });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Expose-Headers": "Location",
    });
    expect(JSON.parse(response.body)).toEqual([
      {
        ...recipe,
        id: expect.stringMatching("name-[0-9]+"),
      },
    ]);
  });

  it("should return ok and and editable when recipes owned by user", async () => {
    const recipe = {
      name: "Name",
      image: "Image",
      description: "Description",
      serves: 4,
      duration: 10000,
      equipment: [],
      ingredients: [],
      method: [],
    };
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    await createRecipeHandler({
      headers: {
        Authorization: "Bearer VALID",
      },
      body: JSON.stringify(recipe),
    });

    const response = await handler({ headers: { Authorization: "Bearer VALID" } });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Expose-Headers": "Location",
    });
    expect(JSON.parse(response.body)).toEqual([
      {
        ...recipe,
        id: expect.stringMatching("name-[0-9]+"),
        isEditable: true,
      },
    ]);
  });
});
