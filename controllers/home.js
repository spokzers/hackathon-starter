/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('index', {
  // res.render('index_redo', {
    title: 'Home'
  });
};
