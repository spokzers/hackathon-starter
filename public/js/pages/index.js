var citySearchRender = ReactDOM.render(React.createElement(CitySearch, {
  'uiType': "landing_page",
  'citySearchPlaceholder': citySearchPlaceholder,
  'findCityButtonText': findCityButtonText,
  'id': id,
  'searchUrl': searchUrl,
  'onSelect': function (serviceArea) {
    var cityName = serviceArea.name;
    cityName = cityName.replace(/ /g, '-').toLowerCase();
    window.location.href = '/' + language_code + '-' +
      serviceArea.serviceProviderAvailableCountryModel.countryModel.twoCharCode.toLowerCase() +
      '/cities/' + cityName + '/';
  }
}), document.getElementById('citysearch'));

var storiesRender = ReactDOM.render(React.createElement(Stories), document.getElementById('stories'));

var tripEstimateRender = ReactDOM.render(React.createElement(TripEstimate, {
    'pickUpPlaceholder': pickUpPlaceholder,
    'dropoffPlaceholder': dropoffPlaceholder,
    'fareEstimatorHeading': '',
    'uiType': 1,
    'signUpRideText': signUpRideText,
    'signUpRideUrl': signUpRideUrl
  }),
  document.getElementById('trip-estimate')
  );

ServiceAreaProvider.get(function (serviceArea, serviceAreaList) {
  $("#newcitysearch").attr("placeholder", citySearchPlaceholder);
  var serviceAreaCode = serviceArea.serviceProviderAvailableCountryModel.countryModel.twoCharCode.toLowerCase();
  var pathPrefix = "/" + language_code + "-" + serviceAreaCode + "/";
  if (!window.location.pathname.startsWith(pathPrefix)) {
    window.location.pathname = pathPrefix;
  }

  citySearchRender.update(serviceAreaList);
  tripEstimateRender.update(serviceArea);
  storiesRender.update(serviceArea);

  /*----------------------------------------------------------------------------------*/
  /*
  var cityInfo = null;
  var stories = '';
  for (var i = 0; i < citiesInfo.length && cityInfo == null; i++) {
    //if(citiesInfo[i].name.toLowerCase() == serviceArea.name.toLowerCase())
    cityInfo = citiesInfo[i];
    if (cityInfo != null) {
      stories = cityInfo.stories;
    }
  }
  
  var list = [];
  for (var i = 0; i < stories.length; i++) {
    var story = stories[i];
    var html = '<div class="carousel-cell"><div class="carousel-cell-container"><img src="{1}" class="carousel-image">            <div class="carousel-overlay"><div class="carousel-text"><div class="story-name">{2}</div><div class="story-content"><span class="captain">Customer</span> in <span class="serviceareaname">UAE</span></div></div></div></div></div>';
    html = html.replace(/\{0\}/g, story.url);
    html = html.replace(/\{1\}/g, story.image);
    html = html.replace(/\{2\}/g, story.text);
    
    list.push(html.trim());
  }
  $('.carousel').append(list);
  */

  /*---------------------------------------------------------------------------------------------*/
  /*
  var data = [];
  serviceAreaList.forEach(function (i) {
    data.push({
      label: i.name,
      id: i.id,
      country_code: i.serviceProviderAvailableCountryModel.countryModel.twoCharCode.toLowerCase()
    });
  });
  */
  
  var liSelected = undefined;
  var tempListOnMouseClick = undefined
  $(document).on('click', '.drop-list .common-search-dropdown.relative li', function (event) {
    event.preventDefault();
    liSelected = event.currentTarget;
    tempListOnMouseClick = $(".drop-list .common-search-dropdown.relative li");
    $("#newservicearealist").addClass("hide");

  });

  //Why is this inside this callback??
  $(document).ready(function () {
    $('#search-button').click(function (e) {
      citySearchRender.selectServiceArea();
    });
  }); //ready ended

}); // ServiceAreaProvider.get ended.