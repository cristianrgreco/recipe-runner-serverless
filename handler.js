const {MongoClient} = require('mongodb');
const {isTokenValid} = require('./auth');
const RecipeRepository = require('./RecipeRepository');

const getDb = async () => {
    const hostname = process.env['DB_HOSTNAME'];
    const username = process.env['DB_USERNAME'];
    const password = process.env['DB_PASSWORD'];
    const database = process.env['DB_DATABASE'];

    const url = `mongodb+srv://${username}:${password}@${hostname}/test?retryWrites=true&w=majority`;

    const client = new MongoClient(url, {useUnifiedTopology: true});
    await client.connect();

    return client.db(database);
};

const toRecipeDto = token => recipe => ({
    ...recipe,
    createdBy: undefined,
    isEditable: (token && token.email === recipe.createdBy) || undefined
});

const fetchRecipe = async event => {
    const db = await getDb();
    const collection = db.collection('recipes');
    const recipeRepository = new RecipeRepository(collection);

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
    const db = await getDb();
    const collection = db.collection('recipes');
    const recipeRepository = new RecipeRepository(collection);

    const token = await isTokenValid(event.headers.Authorization);

    const recipes = await recipeRepository.findAll();
    const recipeDtos = recipes.map(toRecipeDto(token));

    return {
        statusCode: 200,
        body: JSON.stringify(recipeDtos)
    };
};

const deleteRecipe = async event => {
    const db = await getDb();
    const collection = db.collection('recipes');
    const recipeRepository = new RecipeRepository(collection);

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
