const Issue = require('../models/Issue');

/**
 * GET /issues/view/:id
 * Issue Detail page
 */

exports.getDetail = (req, res) => {
  Issue
    .findOne({ issue_no: req.params.issue_no })
    .populate('owner')
    .then(issue => {
      console.log(issue)
      let date = new Date(issue.createdAt);
      issue.date = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear()
      res.render('issues/view', {
        issue: issue,
        title: "View Issue"
      })
    })
    .catch(err => {
      res.json({"error": err})
    })
}

exports.postComment = (req, res) => {
  const comment = {
    author: req.user.id,
    date: new Date(),
    description: req.body.description
  }

  Issue
    .findOne({issue_no: req.params.issue_no})
    .then(issue => {
      issue.comments.push(comment)
      console.log(issue)
      issue.save()
      res.redirect('/issues/' + req.params.issue_no)
    })

}

/**
 * GET /issues/create
 * Issue Create page
 */

exports.getCreate = (req, res) => {
  res.render('issues/create', {
    title: 'Create Issue'
  })
}

/**
 * POST /issues/create
 * Issue Create page
 */

exports.postCreate = (req, res) => {

  const issue = new Issue({
    issue_no: Math.floor(Math.random() * 10000),
    tags: req.body.tags || ["Untagged"],
    title: req.body.title,
    description: req.body.description,
    owner: req.user.id,
    status: "open"
  })

  issue.save((err) => {
    if (err) { return next(err); }
    res.redirect('/issues')
  })
}
