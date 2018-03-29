//Cookie Util
window.cookie = function (key, value) {
  if (value === undefined) {
    document.cookie.split(/;\s?/).some(function (cookieCrumb) {
      var segments = cookieCrumb.split('=');
      if (key == segments[0]) {
        value = segments[1];
        return true;
      }
    });

  } else {
    document.cookie = key + '=' + value + '; path=/';
  }

  return value;
};

var LocalStorageFetch = function (options) {
  var instance = this;
  instance.options = options;
};

LocalStorageFetch.NOT_FOUND = {
  "error": "Either no localStorage or not found in localStorage."
};

LocalStorageFetch.prototype.end = function (callback) {
  if (!callback) {
    return;
  }

  var options = this.options,
    key = options.key,
    request = options.request;

  var fallback = function () {
    if (!request) {
      return callback(LocalStorageFetch.NOT_FOUND);
    }

    request.end(function (error, response) {
      if (!error) {
        if (window.localStorage) {
          localStorage.setItem(key, JSON.stringify(response.body));
        }
      }
      callback(error, response);
    });
  };

  if (!window.localStorage || !key) {
    return fallback();
  }

  var item = localStorage.getItem(key);

  if (!item) {
    return fallback();
  }

  try {
    item = JSON.parse(item);
  } catch (e) {
    console.error('Unable to pase JSON');
  }

  callback(undefined, {
    "body": item
  });
};

var StoryVideoPlayer = function (options) {
  var instance = this;
  instance.options = options;
};

StoryVideoPlayer.prototype.getYouTubeURLTemplate = function (id, lang) {
  var url = `//www.youtube.com/embed/{id}?
    hl={lang}&
    hd=1&
    modestbranding=1&
    autohide=1&
    showinfo=0&
    color=white&
    autoplay=1&
    rel=0`;

  return url
    .replace(/\n\s+/g, '')
    .replace('{id}', id)
    .replace('{lang}', lang || '');
};

StoryVideoPlayer.prototype.getCloseButtonTemplate = function () {
  var closeButtonTemplate = `<div class='btn-story-video-player-stop'>×</div>`;
  return closeButtonTemplate;
};

StoryVideoPlayer.prototype.getIframeTemplate = function (url) {
  var frameTemplate =
    `<iframe src='{url}'
    frameborder='0'
    gesture='media'
    allow='encrypted-media'
    allowfullscreen
  ></iframe>`;
  return frameTemplate.replace('{url}', url);
};

StoryVideoPlayer.prototype.stop = function () {
  var options = this.options,
    container = document.querySelector(options.container);
  container.innerHTML = '';
  container.classList.add('collapsed');
};

StoryVideoPlayer.prototype.play = function (url) {
  var instance = this,
    options = instance.options,
    container = document.querySelector(options.container),
    iFrame = container.querySelector('iframe');

  if (iFrame) {
    var nowPlaying = iFrame.src.replace(/^https?:/, '');
    if (nowPlaying != url) {
      // Needed for a show of immdediate response.
      iFrame.src = '';
      window.setTimeout(function () {
        iFrame.src = url;
      }, 0);
    }
    return;
  }

  var template = this.getIframeTemplate(url) + this.getCloseButtonTemplate();
  container.classList.remove('collapsed');
  container.innerHTML = template;
  var stopButton = container.querySelector('.btn-story-video-player-stop');
  if (stopButton) {
    stopButton.onclick = function () {
      instance.stop();
    }
  }
};

StoryVideoPlayer.prototype.playYouTube = function (id) {
  var instance = this,
    options = instance.options;
  instance.play(instance.getYouTubeURLTemplate(id, options.lang));
};

var FetchUtil = {};

FetchUtil.multiFetch = function (callback, requestMap) {
  var errorMap = {},
    responseMap = {},
    requestCount = 0,
    responseCount = 0;

  var sendRequest = function (key, request) {
    request.end(function (error, response) {
      responseCount++;
      errorMap[key] = error;
      responseMap[key] = response;
      if (responseCount === requestCount) {
        callback(responseMap, errorMap);
      }
    });
  };

  for (var key in requestMap) {
    requestCount++;
    var request = requestMap[key];
    sendRequest(key, request);
  }
};

////////////////////////////////////////////////////

var dotCMSService = {
  'URL': {
    'content': '/api/content',
    'contentRelationships': '/api/v1/contentRelationships',
    'jsonQuery': '/type/json/query'
  }
};

dotCMSService.objectToQueryURL = function (query) {
  var url = '',
    orderBy,
    limit;

  for (var key in query) {
    var value = query[key];
    if (key === '_orderBy') {
      orderBy = value;

    } else if (key === '_limit') {
      limit = value;

    } else {
      url += ' +' + key + ':' + value;
    }
  }

  if (orderBy) {
    url += '/orderby/' + orderBy
  }

  if (limit) {
    url += '/limit/' + limit
  }

  return url;
};

dotCMSService.objectToRequest = function (url, query) {
  url = url + dotCMSService.URL.jsonQuery + '/' + dotCMSService.objectToQueryURL(query);
  return superagent.get(url);
};

dotCMSService.objectToContentRequest = function (query) {
  return dotCMSService.objectToRequest(dotCMSService.URL.content, query);
};

dotCMSService.objectToRelatedContentRequest = function (query) {
  return dotCMSService.objectToRequest(dotCMSService.URL.contentRelationships, query);
};

dotCMSService.responseToObject = function (response) {
  return response ?
    (response.body ? response.body.contentlets : undefined) :
    undefined;
};

dotCMSService.getContent = function (callback, query) {
  dotCMSService.objectToContentRequest(query).end(function (err, response) {
    callback(dotCMSService.responseToObject(response),
      response, err
    );
  });
};

dotCMSService.getRelatedContent = function (callback, query) {
  dotCMSService.objectToRelatedContentRequest(query).end(function (err, response) {
    callback(dotCMSService.responseToObject(response),
      response, err
    );
  });
};

dotCMSService.multiFetch = function (callback, requestMap) {
  for (var key in requestMap) {
    requestMap[key] = dotCMSService.objectToContentRequest(requestMap[key]);
  }

  FetchUtil.multiFetch(function (responseMap, errorMap) {
    var key,
      response;

    for (key in responseMap) {
      response = dotCMSService.responseToObject(responseMap[key]);
      responseMap[key] = response;
    }
    callback(responseMap);
  }, requestMap);
};

dotCMSService.fetchMultiLingual = function (callback, req, languageId) {
  var reqMap = {
    1: JSON.parse(JSON.stringify(req))
  };

  req.languageId = languageId;
  reqMap['1'].languageId = 1;
  reqMap[languageId] = req;
  dotCMSService.multiFetch(callback, reqMap);
};

dotCMSService.fetchMultiLingualGroup = function (callback, req, languageId) {
  dotCMSService.fetchMultiLingual(function (responseMap) {
    var grouping = {};
    for (var langId in responseMap) {
      var list = responseMap[langId];
      if (list) {
        list.forEach(function (item, index) {
          var id = item.identifier;
          var data = grouping[id];
          if (!data) {
            data = grouping[id] = {};
          }
          data[langId] = item;
        });
      }
    }

    for (var identifier in grouping) {
      var item = grouping[identifier];
      callback(item[1], item[languageId]);
    }

    callback();

  }, req, languageId);
};

dotCMSService.getchMultiLingualGroupBy = function (callback, req, langId, groupByKey) {
  var result = {};
  dotCMSService.fetchMultiLingualGroup(function (key, value) {
    if (key) {
      key = key[groupByKey];
      value = value ? value[groupByKey] : undefined;
      if (value) {
        result[key] = value;
      }

    } else {
      callback(result);
    }
  }, req, langId);
};

dotCMSService.getNonPublicCarTypes = function (callback) {
  dotCMSService.getContent(function (data) {
    if (!data) {
      return callback();
    }

    callback(data.filter(function (item) {
      return !/public/.exec(item.checkList);
    }));

  }, {
    'contentType': 'Car',
    'languageId': 1
  });
};

dotCMSService.getCarTypeImages = function (callback) {
  dotCMSService.getContent(function (carTypeImageList) {
    if (!carTypeImageList) {
      return;
    }

    var result = {};

    carTypeImageList.forEach(function (carTypeImage) {
      var ids = carTypeImage.carTypeIdCsv;
      if (!ids) {
        return;
      }
      var image = carTypeImage.image;
      ids.split(',').forEach(function (id) {
        result[id] = image;
      });
    });

    callback(result);

  }, {
    'contentType': 'CarTypeImage',
    'languageId': 1,
    '_limit': 20
  });
};

dotCMSService.getCountryNames = function (callback, languageId) {
  dotCMSService.getchMultiLingualGroupBy(
    callback, {
      'contentType': 'Country',
      '_limit': 200
    },
    languageId,
    'name'
  );
};

dotCMSService.getCityNames = function (callback, languageId) {
  dotCMSService.getchMultiLingualGroupBy(
    callback, {
      'contentType': 'City',
      '_limit': 5000
    },
    languageId,
    'name'
  );
};

dotCMSService.translateCityName = function (callback, cityName, languageId) {
  dotCMSService.getContent(function (response) {
    if (response && response.length) {
      dotCMSService.getContent(function (response) {
        callback(response ? (response[0] ? response[0].name : cityName) : cityName);

      }, {
        'contentType': 'City',
        'languageId': languageId,
        'identifier': response[0].identifier
      });

    } else {
      callback(cityName);
    }
  }, {
    'contentType': 'City',
    'languageId': 1,
    'City.name': '"' + cityName + '"'
  });
};

dotCMSService.areaTranslationProvider = {
  'callbacks': [],

  'resolve': function () {
    var provider = dotCMSService.areaTranslationProvider;
    if (
      provider.cities !== undefined &&
      provider.countries !== undefined
    ) {
      provider.done = true;
      provider.working = false;

      var callback;
      while (callback = provider.callbacks.pop()) {
        provider.resolveCallback(callback);
      }
    }
  },

  'resolveCallback': function (callback) {
    var provider = dotCMSService.areaTranslationProvider;
    callback(provider.countries, provider.cities);
  },

  'get': function (callback, languageId) {
    var provider = dotCMSService.areaTranslationProvider;

    if (provider.done) {
      if (callback) {
        provider.resolveCallback(callback);
      }
      return;
    }

    if (callback) {
      provider.callbacks.push(callback);
    }

    if (provider.working) {
      return;
    }

    provider.working = true;

    dotCMSService.getCountryNames(function (response) {
      provider.countries = response;
      provider.resolve();
    }, languageId);

    dotCMSService.getCityNames(function (response) {
      provider.cities = response;
      provider.resolve();
    }, languageId);
  }
};

////////////////////////////////////////////////////

var ServiceAreaProvider = {
  'serviceArea': undefined,
  'serviceAreaList': undefined,
  'serviceAreaMap': undefined,
  'callbackList': [],

  'find' : function(name) {
    return ServiceAreaProvider.serviceAreaMap[name.replace(/-/g, ' ').toLowerCase()];
  },

  'resolveCallback': function (callback) {
    callback(ServiceAreaProvider.serviceArea, ServiceAreaProvider.serviceAreaList);
  },

  'resolve': function () {
    var callback;
    while (callback = ServiceAreaProvider.callbackList.pop()) {
      ServiceAreaProvider.resolveCallback(callback);
    }
  },

  'get': function (callback) {
    if (ServiceAreaProvider.serviceArea) {
      ServiceAreaProvider.resolveCallback(callback);
      return;
    }

    ServiceAreaProvider.callbackList.push(callback);

    if (ServiceAreaProvider.working) {
      return;
    }

    ServiceAreaProvider.working = true;

    var cityNameFromCookie = cookie('careem_selected_city'),
      requestMap = {
        'serviceArea': (new ServiceAreaService()).getServiceAreas()
      };
    
    //TODO testing.
    requestMap.serviceArea = new LocalStorageFetch({
      "key": "serviceAreaList",
      "request": (new ServiceAreaService()).getServiceAreas()
    });

    if (!cityNameFromCookie) {
      requestMap.ipInfo = (new IpInfoService()).getIpInfo();
    }

    var translationsRequested;

    //TODO find-out a way to get this from outside.
    if (language_id != 1) {
      translationsRequested = true;
      //Pre-fetching translations.
      dotCMSService.areaTranslationProvider.get(undefined, language_id);
    }

    FetchUtil.multiFetch(function (responseMap, errorMap) {
      var ipInfo = responseMap.ipInfo;
      var serviceAreaList = responseMap.serviceArea;

      if (ipInfo) {
        ipInfo = ipInfo.body.data;
      }

      if (serviceAreaList) {
        serviceAreaList = serviceAreaList.body.rows;
      }

      var cityName = ipInfo ? (ipInfo ? ipInfo.cityName : undefined) : cityNameFromCookie;

      var serviceArea;
      if (cityName) {
        var compareTerm = cityName.toLowerCase().replace(/-/g, ' '),
          searchServiceArea = function (countries, cities) {
            serviceAreaList.forEach(function (serviceArea) {
              var translatedCityName;
              if (cities) {
                translatedCityName = cities[serviceArea.name];
                if (translatedCityName) {
                  serviceArea.displayName = translatedCityName;
                }
              }

              if (countries) {
                var countryModel = serviceArea.serviceProviderAvailableCountryModel;
                if (countryModel) {
                  countryModel = countryModel.countryModel;
                  if (countryModel) {
                    var name = countryModel.name,
                      newName = countries[name];
                    if (newName) {
                      countryModel.displayName = newName;
                    }
                  }
                }
              }

              // Is startsWith a good option here?
              if (serviceArea.name.toLowerCase().startsWith(compareTerm)) {
                ServiceAreaProvider.serviceArea = serviceArea;
                return true;
              }
            });

            if (!ServiceAreaProvider.serviceArea) {
              ServiceAreaProvider.serviceArea = serviceAreaList[0];
            }

            var serviceAreaCheckMap = ServiceAreaProvider.serviceAreaMap = {};
            serviceAreaList = serviceAreaList.filter(function (serviceArea) {
              var name = serviceArea.name.toLowerCase(),
                exists = serviceAreaCheckMap[name];
              if(!exists) {
                serviceAreaCheckMap[name] = serviceArea;
              }
              return !exists;
            });

            ServiceAreaProvider.serviceAreaList = serviceAreaList;

            

            ServiceAreaProvider.serviceAreaList


            ServiceAreaProvider.working = false;

            ServiceAreaProvider.resolve();
          };

        if (translationsRequested) {
          dotCMSService.areaTranslationProvider.get(function (countries, cities) {
            searchServiceArea(countries, cities);
          }, language_id);

        } else {
          searchServiceArea();
        }
      }

    }, requestMap);
  }
};