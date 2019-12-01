const toRecipeDto = token => recipe => ({
    ...recipe,
    createdBy: undefined,
    isEditable: (token && token.email === recipe.createdBy) || undefined
});

module.exports = {
    toRecipeDto
};
