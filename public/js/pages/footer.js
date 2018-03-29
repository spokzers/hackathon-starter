window.UILib.renderFooter = function(props) {
    ReactDOM.render(
        React.createElement(UILib.Footer.default, props),
        document.getElementById('footer-container')
    );
};

window.UILib.renderFooter(window.UILib.footerProps);

var footerCitySearchRender = ReactDOM.render(React.createElement(CitySearch, {
  'uiType': 'footer',
  'citySearchPlaceholder': citySearchPlaceholder,
  'findCityButtonText': findCityButtonText,
  'searchUrl': searchUrl,
  'onSelect': function (serviceArea) {
    updateServiceArea(serviceArea);

    if (window.tripEstimateRender && !window.cityName) {//Doesn't change on city details page.
      tripEstimateRender.update(serviceArea);
    }

    if (window.storiesRender) {
      storiesRender.update(serviceArea);
    }

    //FIXME is the id not to generic??
    $("#close-button").trigger('click');

    //footerCitySearchRender.update(serviceAreaList);
    //tempListOnMouseClick = undefined;
    //citySearchRender.update(allServiceAreas);
    //storiesRender.update(serviceArea);
  }

}), document.getElementById('footercitysearch'));

var updateFooterLocationLink = function (serviceArea) {
  window.UILib.footerProps.listUnderLogo[0].text = serviceArea.displayName;
  window.UILib.footerProps.listUnderLogo[0].url = '/' + language_code + '-' +
    serviceArea.serviceProviderAvailableCountryModel.countryModel.twoCharCode.toLowerCase() +
    '/cities/' + serviceArea.name.toLowerCase() + '/';

  window.UILib.renderFooter(window.UILib.footerProps);
};

function replaceUrlCountryCode(href, countryCode) {
  var localePattern = /\/[a-z]{2}-[a-z]{2}\//,
    langPattern = /[a-z]{2}/;

  var match = localePattern.exec(href);

  if (match) {
    var matchValue = match[0];
    match = langPattern.exec(matchValue);
    if (match) {
      var languageCode = match[0];
      return href.replace(localePattern, '/' + languageCode + '-' + countryCode + '/');
    }
  }

  return href;
}

var updateCountryRewriteURLs = (function() {
  function processClickableItem(item, countryCode) {
    item.url = replaceUrlCountryCode(item.url, countryCode);
    return item;
  }

  function processLanguageObj(languageObj, countryCode) {
    return processClickableItem(languageObj, countryCode);
  }

  function processSection(section, countryCode) {
    section.list = section.list.map(
      function(item) {
        return processClickableItem(item, countryCode);
      }
    );
    return section;
  }

  return function (countryCode) {
    document
      .querySelectorAll("a[href]")
      .forEach(function (link) {
        link.href = replaceUrlCountryCode(link.href, countryCode);
      });

    window.UILib.footerProps.sections = window.UILib.footerProps.sections.map(
      function(section) {
        return processSection(section, countryCode);
      }
    );

    window.UILib.headerProps.sectionsAndItems = window.UILib.headerProps.sectionsAndItems.map(
      function(sectionOrItem) {
        if (sectionOrItem.caption != null) {
          return processSection(sectionOrItem, countryCode);
        } else {
          return processClickableItem(sectionOrItem, countryCode);
        }
      }
    );

    window.UILib.footerProps.languageUrls = window.UILib.footerProps.languageUrls.map(
      function(languageObj) {
        return processLanguageObj(languageObj, countryCode);
      }
    );

    window.UILib.headerProps.languageUrls = window.UILib.headerProps.languageUrls.map(
      function(languageObj) {
        return processLanguageObj(languageObj, countryCode);
      }
    );

    window.UILib.footerProps.terms = processClickableItem(
      window.UILib.footerProps.terms,
      countryCode
    );

    window.UILib.footerProps.privacy = processClickableItem(
      window.UILib.footerProps.privacy,
      countryCode
    );

    window.UILib.headerProps.logoLink = processClickableItem(
      window.UILib.headerProps.logoLink,
      countryCode
    );
  };
} ());

var updateURLCountry = function (serviceArea) {
  var currentPath = window.location.pathname,
    segments = currentPath.split('/').filter(function (value) { return value; }),
    newCountryCode = serviceArea.serviceProviderAvailableCountryModel.countryModel.twoCharCode.toLowerCase(),
    newCityName = serviceArea.name.toLowerCase().replace(/\s+/g, '-'),
    languageCode = language_code,
    countryCode,
    cityName;

  if (segments.length) {
    var localePattern = /^([a-z]{2})-([a-z]{2})$/,
      locale = localePattern.exec(segments[0]);
    if (locale) {
      languageCode = locale[1];
      countryCode = locale[2];
      cityName = (segments[1] == 'cities') ? segments[2] : undefined;

    } else {
      segments.unshift('');//Will be filled below.
    }
  }

  var countryChanged = newCountryCode != countryCode,
    cityChanged = cityName != newCityName;

  countryCode = newCountryCode;
  segments[0] = languageCode + '-' + countryCode;

  if (countryChanged) {
    history.replaceState({}, document.title, '/' + segments.join('/') + '/');
    updateCountryRewriteURLs(countryCode);
  }
};

var updateServiceArea = function (serviceArea) {
  cookie('careem_selected_city', serviceArea.name);
  if (!window.disableUpdateURLCountryFlag) {
    updateURLCountry(serviceArea);
  }
  updateFooterLocationLink(serviceArea);
  var mediaUrls = citiesSocialMediaUrls[serviceArea.name.toLowerCase()];
  if (mediaUrls != undefined) {
    window.UILib.footerProps.facebook = mediaUrls.facebook;
    window.UILib.footerProps.twitter = mediaUrls.twitter;
    window.UILib.footerProps.instagram = mediaUrls.instagram;

    window.UILib.renderFooter(window.UILib.footerProps);
  }
};

ServiceAreaProvider.get(function (serviceArea, serviceAreaList) {
  updateServiceArea(serviceArea);
  footerCitySearchRender.update(serviceAreaList);
});

function openFooterCitySearchModal() {
  $('#search-modal').toggleClass("closed");
  $('#modal-overlay').toggleClass("closed");
  $("#footernewcitysearch").val('');
  $('body').addClass("no-scroll");
}

$(document).on('click', '.open-default', function (event) {
  event.preventDefault();
  openFooterCitySearchModal();
});

$(document).on('click', '#modal-overlay', function (event) {
  var target = event.target;
  $("#close-button").trigger('click');
});

//Clicking outside.
$(document).on('click', function (event) {
  var target = jQuery(event.target);
  if(!target.is('.deck-link')) {
    $('ul.show-deck').removeClass('show-deck');
  }
});

$(document).on('click', '#footer-search-button', function (event) {
  event.preventDefault();
  footerCitySearchRender.selectServiceArea();
});

$(document).on('click', '#close-button', function (event) {
  event.preventDefault();
  $('#search-modal').toggleClass("closed");
  $('#modal-overlay').toggleClass("closed");
  $('body').removeClass("no-scroll");
});
