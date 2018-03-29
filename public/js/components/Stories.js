class Stories extends React.Component {

  constructor() {
    super();
    this.state = { stories: [] };
    this.update = this.update.bind(this);
  }

  update(serviceArea) {
    var countryCode = serviceArea.serviceProviderAvailableCountryModel.countryModel.twoCharCode,
      countryStoryList;

    if(this.state.countryCode == countryCode) {
      return;
    }
    
    try {
      $('#stories').flickity('destroy');
    } catch(e) {
      //Nothing to do.
    }

    countryStoryList = countryStoryMap[countryCode].stories;
    if(!countryStoryList.length) {
      countryCode = 'AE';//UAE is the default.
      countryStoryList = countryStoryMap[countryCode].stories;
    }

    this.setState({
      'countryCode' : countryCode,
      'stories' : countryStoryList
    });
  }

  render() {
    if (this.state.stories == null) return [];
    
    var list = [];
    for (var i = 0; i < this.state.stories.length; i++) {
      var story = this.state.stories[i];
      list.push(React.createElement('div', { 'class': 'carousel-cell', 'key': i },
        React.createElement('div', {
          'class' : 'carousel-cell-container',
          'data-youtube-id' : story.youtubeVideoId,
          'style' : {
            'backgroundImage' : 'url("' + story.image + '")'
          }
        },
        React.createElement('div', { 'class': 'carousel-overlay' },
          React.createElement('hr', { 'class': 'carousel-divider' }),
          React.createElement('div', { 'class': 'carousel-text' },
            React.createElement('div', { 'class': 'story-name' }, story.title),
            React.createElement('div', { 'class': '' }, story.text)
          ),
        )
      )));
    }
    return list;
  }

  componentDidUpdate() {
    $('#stories').flickity({
      'cellalign': 'left',
      'contain': true,
      'prevNextButtons': false,
      'pageDots': false
    });
  }
}