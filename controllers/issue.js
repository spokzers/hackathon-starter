exports.creation = (req, res) => {
  res.render('issues/creation', {
    title: 'Issue Creation'
  });
};

exports.index = (req, res) => {
	res.render('issues/index', {
		title: 'Issue Listing',
		issues: [{
			title: "your disc",
			posted_by: "spokzers",
			posted_on: "2018-03-28 20:34",
			tags: ["container", "asdasdasd"]
		},{
			title: "your disc",
			posted_by: "spokzers",
			posted_on: "2018-03-28 20:34",
			tags: ["container", "asdasdasd"]
		},{
			title: "your disc",
			posted_by: "spokzers",
			posted_on: "2018-03-28 20:34",
			tags: ["container", "asdasdasd"]
		},{
			title: "your disc",
			posted_by: "spokzers",
			posted_on: "2018-03-28 20:34",
			tags: ["container", "asdasdasd"]
		}]
	});
};