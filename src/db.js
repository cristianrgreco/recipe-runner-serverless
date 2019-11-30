const {MongoClient} = require('mongodb');
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

const getRecipeRepository = db => {
    const collection = db.collection('recipes');
    return new RecipeRepository(collection);
};

module.exports = {
    getDb,
    getRecipeRepository
};
