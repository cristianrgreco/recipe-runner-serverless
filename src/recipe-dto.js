const toRecipeDto = (token) => (recipe) => ({
  id: recipe.id,
  name: recipe.name,
  image: recipe.image,
  imageThumbnail: recipe.imageThumbnail,
  description: recipe.description,
  serves: recipe.serves,
  duration: recipe.duration,
  equipment: recipe.equipment,
  ingredients: recipe.ingredients,
  method: recipe.method,
  createdBy: undefined,
  isEditable: (token && (token.isAdmin || token.id === recipe.createdBy)) || undefined,
});

const fromRecipeDto = (recipeDto) => ({
  id: recipeDto.id,
  name: recipeDto.name,
  image: recipeDto.image,
  imageThumbnail: recipeDto.imageThumbnail,
  description: recipeDto.description,
  serves: recipeDto.serves,
  duration: recipeDto.duration,
  equipment: recipeDto.equipment,
  ingredients: recipeDto.ingredients,
  method: recipeDto.method,
  createdAt: recipeDto.createdAt,
});

module.exports = {
  toRecipeDto,
  fromRecipeDto,
};
