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

module.exports = {
  aRecipe,
  corsHeaders,
};
