const { isTokenValid } = require("../auth");
const { handler } = require("./fetch-recipes");
const { aRecipe, corsHeaders, createRecipe } = require("../test-helper");

describe("fetchRecipes", () => {
  it("should return ok and and not editable when recipes not owned by user", async () => {
    isTokenValid.mockResolvedValue({ id: "id2" });
    await createRecipe();

    isTokenValid.mockResolvedValue({ id: "id1" });
    const response = await handler({ headers: { Authorization: "Bearer VALID" } });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual(corsHeaders());
    expect(JSON.parse(response.body)).toEqual([
      {
        ...aRecipe(),
        id: expect.stringMatching("name-[0-9]+"),
      },
    ]);
  });

  it("should return ok and and editable when recipes owned by user", async () => {
    isTokenValid.mockResolvedValue({ id: "id1" });
    await createRecipe();

    const response = await handler({ headers: { Authorization: "Bearer VALID" } });

    expect(response.statusCode).toEqual(200);
    expect(response.headers).toEqual(corsHeaders());
    expect(JSON.parse(response.body)).toEqual([
      {
        ...aRecipe(),
        id: expect.stringMatching("name-[0-9]+"),
        isEditable: true,
      },
    ]);
  });
});
