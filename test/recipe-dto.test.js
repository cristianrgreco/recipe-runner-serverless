const {toRecipeDto} = require('../src/recipe-dto');

describe('recipe-dto', () => {

   describe('toRecipeDto', () => {

       it('should remove createdBy', () => {
           const token = false;
           const recipe = {createdBy: 'user@domain.com'};

           const recipeDto = toRecipeDto(token)(recipe);

           expect(recipeDto).toEqual({});
       });

       it('should set isEditable if recipe is owned by logged in user', () => {
           const token = {email: 'user@domain.com'};
           const recipe = {createdBy: 'user@domain.com'};

           const recipeDto = toRecipeDto(token)(recipe);

           expect(recipeDto).toEqual({isEditable: true});
       });

       it('should unset isEditable if recipe is not owned by logged in user', () => {
           const token = {email: 'anotheruser@domain.com'};
           const recipe = {createdBy: 'user@domain.com'};

           const recipeDto = toRecipeDto(token)(recipe);

           expect(recipeDto).toEqual({});
       });
   });
});
