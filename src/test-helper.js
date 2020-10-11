const { handler: createRecipeHandler } = require("./functions/create-recipe");

const aRecipe = () => ({
  name: "Name",
  image: "Image",
  description: "Description",
  serves: 4,
  duration: 10000,
  equipment: [],
  ingredients: [],
  method: [],
});

const corsHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Expose-Headers": "Location",
});

const createRecipe = async () => {
  const {
    headers: { Location: createRecipeLocation },
  } = await createRecipeHandler({
    headers: {
      Authorization: "Bearer VALID",
    },
    body: JSON.stringify(aRecipe()),
  });

  return createRecipeLocation.split("/").pop();
};

module.exports = {
  aRecipe,
  corsHeaders,
  createRecipe,
};
