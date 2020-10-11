const { MongoClient } = require("mongodb");
const { getDbUrl } = require("./db-url");
const RecipeRepository = require("./recipe-repository");

let cachedDatabase;
let cachedRecipeRepository;

const connectToDatabase = async () => {
  if (cachedDatabase) {
    console.log("Using cached database connection");
    return cachedDatabase;
  }

  console.log("Connecting to database");
  const { url, database } = getDbUrl();
  const client = new MongoClient(url, { useUnifiedTopology: true });
  await client.connect();
  console.log("Connected to database");

  cachedDatabase = client.db(database);
  return cachedDatabase;
};

const getRecipeRepository = async () => {
  if (cachedRecipeRepository) {
    console.log("Using cached recipe repository");
    return cachedRecipeRepository;
  }

  console.log("Creating recipe repository");
  const db = await connectToDatabase();
  const collection = db.collection("recipes");
  console.log("Created recipe repository");

  cachedRecipeRepository = new RecipeRepository(collection);
  return cachedRecipeRepository;
};

module.exports = { getRecipeRepository };
