const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  issue_no: Number,
  tags: [{ type: String }],
  title: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String, // Closed, Pending, Open
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: String,
    description: String
  }]
}, { timestamps: true });

/**
 * Issue Number Incrementor middleware.
 */
/*issueSchema.pre('save', function save(next) {
  const issue = this;
  if (!issue.isModified('issue_no')) { return next(); }



  next();
});*/


const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
