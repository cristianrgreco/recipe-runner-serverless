const { isTokenValid } = require("../auth");
const { handler: createRecipeHandler } = require("./create-recipe");
const { handler } = require("./fetch-recipes");

describe("fetchRecipe", () => {
  it("should return ok and and not editable when recipes not owned by user", async () => {
    isTokenValid.mockResolvedValue({ email: "another-user@domain.com" });
    await createRecipeHandler({
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
    const response = await handler({ headers: { Authorization: "Bearer VALID" } });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Expose-Headers": "Location",
    });
    expect(JSON.parse(response.body)).toEqual([
      {
        id: expect.stringMatching("name-[0-9]+"),
        name: "Name",
        image: "Image",
        description: "Description",
        serves: 4,
        duration: 10000,
        equipment: [],
        ingredients: [],
        method: [],
      },
    ]);
  });

  it("should return ok and and editable when recipes owned by user", async () => {
    isTokenValid.mockResolvedValue({ email: "user@domain.com" });
    await createRecipeHandler({
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

    const response = await handler({ headers: { Authorization: "Bearer VALID" } });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Expose-Headers": "Location",
    });
    expect(JSON.parse(response.body)).toEqual([
      {
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
      },
    ]);
  });
});
