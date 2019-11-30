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

module.exports.fetchRecipes = async event => {
    const db = await getDb();
    const collection = db.collection('recipes');
    const recipeRepository = new RecipeRepository(collection);

    const token = await isTokenValid(event.headers.Authorization);

    const recipes = await recipeRepository.findAll();
    const recipeDtos = recipes.map(recipe => ({
        ...recipe,
        createdBy: undefined,
        isEditable: (token && token.email === recipe.createdBy) || undefined
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(recipeDtos)
    };
};
