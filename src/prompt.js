const addBookPrompt = () => {
  return [
    {
      type: 'input',
      name: 'isbn',
      message: 'ISBN:  ',
    },
    {
      type: 'input',
      name: 'title',
      message: 'Title:  ',
    },
    {
      type: 'input',
      name: 'category',
      message: 'Category:  ',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:  ',
    },
    {
      type: 'input',
      name: 'publisher',
      message: 'Publisher:  ',
    },
    {
      type: 'input',
      name: 'copies',
      message: 'Copies:  ',
    },
  ];
};

module.exports = {addBookPrompt};
