const {isTokenValid} = require('../auth');
const {connectToDatabase, getRecipeRepository} = require('../db');
const {fromRecipeDto} = require('../recipe-dto');
const corsHeaders = require('../cors-headers');

const createRecipeId = recipeName => {
    return recipeName
        .toLowerCase()
        .replace(/[^A-Za-z0-9\s]/g, '')
        .replace(/\s/g, '-');
};

module.exports.handler = async event => {
    const recipeRepository = getRecipeRepository(await connectToDatabase());

    const token = await isTokenValid(event.headers.Authorization);
    if (!token) {
        return {
            statusCode: 401,
            headers: corsHeaders
        };
    }

    const recipe = fromRecipeDto(JSON.parse(event.body));

    const createdAt = new Date();
    const recipeId = `${createRecipeId(recipe.name)}-${createdAt.getTime()}`;

    const newRecipe = {
        ...recipe,
        id: recipeId,
        createdAt: createdAt,
        createdBy: token.email,
    };

    await recipeRepository.save(newRecipe);

    return {
        statusCode: 201,
        headers: {
            'Location': `/recipes/${recipeId}`,
            ...corsHeaders
        }
    };
};
