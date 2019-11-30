const {isTokenValid} = require('./auth');
const {getDb, getRecipeRepository} = require('./db');

const toRecipeDto = token => recipe => ({
    ...recipe,
    createdBy: undefined,
    isEditable: (token && token.email === recipe.createdBy) || undefined
});

const fetchRecipe = async event => {
    const recipeRepository = getRecipeRepository(await getDb());
    const token = await isTokenValid(event.headers.Authorization);

    const recipeId = event.pathParameters.recipeId;
    const recipe = await recipeRepository.find(recipeId);
    const recipeDto = toRecipeDto(token)(recipe);

    return {
        statusCode: 200,
        body: JSON.stringify(recipeDto)
    };
};

const fetchRecipes = async event => {
    const recipeRepository = getRecipeRepository(await getDb());
    const token = await isTokenValid(event.headers.Authorization);

    const recipes = await recipeRepository.findAll();
    const recipeDtos = recipes.map(toRecipeDto(token));

    return {
        statusCode: 200,
        body: JSON.stringify(recipeDtos)
    };
};

const deleteRecipe = async event => {
    const recipeRepository = getRecipeRepository(await getDb());

    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401
        };
    }

    const recipeId = event.pathParameters.recipeId;

    const recipe = await recipeRepository.find(recipeId);
    if (token.email !== recipe.createdBy) {
        return {
            statusCode: 403
        };
    }

    await recipeRepository.delete(recipeId);
    return {
        statusCode: 204
    };
};

module.exports = {
    fetchRecipe,
    fetchRecipes,
    deleteRecipe
};
