const { toRecipeDto } = require("./recipe-dto");

describe("recipe-dto", () => {
  describe("toRecipeDto", () => {
    it("should remove createdBy", () => {
      const token = false;
      const recipe = { createdBy: "user@domain.com" };

      const recipeDto = toRecipeDto(token)(recipe);

      expect(recipeDto).toEqual({});
    });

    it("should set isEditable if logged in user is admin", () => {
      const token = { id: "id1", isAdmin: true };
      const recipe = { createdBy: "id2" };

      const recipeDto = toRecipeDto(token)(recipe);

      expect(recipeDto).toEqual({ isEditable: true });
    });

    it("should set isEditable if recipe is owned by logged in user", () => {
      const token = { id: "id1" };
      const recipe = { createdBy: "id1" };

      const recipeDto = toRecipeDto(token)(recipe);

      expect(recipeDto).toEqual({ isEditable: true });
    });

    it("should unset isEditable if recipe is not owned by logged in user", () => {
      const token = { id: "id1" };
      const recipe = { createdBy: "id2" };

      const recipeDto = toRecipeDto(token)(recipe);

      expect(recipeDto).toEqual({});
    });
  });
});
