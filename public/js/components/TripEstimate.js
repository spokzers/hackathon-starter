class TripEstimate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'size': 2,
      'markers': [],
      'serviceArea': {
        'displayName': ''
      },
      'estimates': [],
      'selectedLocations': [],
      'uncompletedRequests': []
    };
    this.locationselected = this.locationselected.bind(this);
    this.calculateTripEstimate = this.calculateTripEstimate.bind(this);
    this.update = this.update.bind(this);
  }

  setServiceArea(serviceArea) {
    var setState = this.setState.bind(this);

    dotCMSService.getCarTypeImages(function (carTypeImageMap) {
      if (carTypeImageMap) {
        serviceArea.customerCarTypeModels = serviceArea.customerCarTypeModels.filter(function (carType) {
          var hasImage = carTypeImageMap[carType.id];
          return carType.displayOnWeb && hasImage;
        });
      }
      //setState({ serviceArea: serviceArea });
      setState({
        serviceArea: serviceArea,
        estimates: [],
        selectedLocations: [],
        markers: []
      });
    });

    var locationSearchList = this.locationSearchList;
    if (locationSearchList) {
      locationSearchList.forEach(function (locationSearch) {
        if (locationSearch && locationSearch.clear) {
          locationSearch.clear();
        }
      });
    }
  }

  update(sArea) {
    this.setServiceArea(sArea);

    var googlemap = new google.maps.Map(document.getElementById('gmap'), {
      zoom: 12,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: googleMapConfig.style.nov2017,
      center: {
        lat: sArea.centralCoordinate.latitude,
        lng: sArea.centralCoordinate.longitude
      },
    });

    document.getElementById("gmap").classList.add('fare-estimate-landing');

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true
    });
    directionsDisplay.setMap(googlemap);

    this.setState({
      googlemap: googlemap,
      directionsService: directionsService,
      directionsDisplay: directionsDisplay
    });

  }

  calculateTripEstimate(plocation, dlocation, time, distance) {
    var d = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var pTime = months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " " + d.getHours() + ":" + (d.getMinutes() + 15);
    var psTime = months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();

    var tripEstimateDto = {
      pickup: {
        careemLocationId: plocation.id,
        googleLocationId: "",
        type98LocationDescription: "",
        coordinate: {
          latitude: plocation.lat,
          longitude: plocation.lng
        },
        moreDetails: "",
        saveAs: "",
        googleLocation: {
          placeId: ""
        },
        sourceUuid: plocation.sourceUuid,
        locationSourceType: plocation.locationSourceType
      },

      dropoff: {
        careemLocationId: dlocation.id,
        googleLocationId: "",
        type98LocationDescription: "",
        coordinate: {
          latitude: dlocation.lat,
          longitude: dlocation.lng
        },
        moreDetails: "",
        saveAs: "",
        googleLocation: {
          placeId: ""
        },
        sourceUuid: dlocation.sourceUuid,
        locationSourceType: dlocation.locationSourceType
      },

      durationInSeconds: time,
      distanceInMeters: distance,
      bookingType: "NORMAL",
      customerCarTypeId: "1",
      pickupTime: pTime,
      pickupTimeStart: psTime
    };

    /*
    var carIdToCarTypeMap = [];
 
    for (var iterateCars = 0; iterateCars < customerCarTypeModels.length; iterateCars++) {
      carIdToCarTypeMap[customerCarTypeModels[iterateCars].id] = customerCarTypeModels[iterateCars];
    }
 
    carEstimates = carIdToCarTypeMap.map(function (a) {
      a.estimates = {};
      return a;
    });
    
    for(var iterateCars = 0; iterateCars < this.state.serviceArea.length; iterateCars++){
        carIdToCarTypeMap[this.state.serviceArea[iterateCars].id] = this.state.serviceArea[iterateCars];
    }
    */

    var state = this.state,
      setState = this.setState.bind(this),
      //??When will this be updated to the state??
      uncompletedRequests = state.uncompletedRequests = [],
      customerCarTypeModels = state.serviceArea.customerCarTypeModels;

    //??Purpose??
    state.estimates = [];

    let promise = new Promise((resolve, reject) => {
      var result = [],
        tripEstimateService = new TripEstimateService(),
        responseCount = 0;

      customerCarTypeModels.forEach(function (carModel) {
        tripEstimateDto.customerCarTypeId = carModel.id;
        var request = tripEstimateService.getEstimate(tripEstimateDto).end((err, res) => {
          responseCount++;
          uncompletedRequests.splice(uncompletedRequests.indexOf(res.req), 1);
          if (err || res == null || res.body == null) {
            //?? No better way ??
            if (!err.message.startsWith('Request has been terminated')) {
              console.error('Estimate call failed.');
            }
            return;
          }

          result.push({
            'carType': carModel,
            'tripEstimate': res.body.rows[0]
          });

          if (responseCount === customerCarTypeModels.length) {
            resolve(result);
          }
        });
        uncompletedRequests.push(request);
      });
    });

    promise.then((estimatesList) => {
      setState({
        'estimates': estimatesList
      });
    });
  }

  makeMarker(position, icon, title) {
    this.state.markers.push(new google.maps.Marker({
      position: position,
      map: this.state.googlemap,
      icon: icon,
      title: title
    }));
  }
  locationselected(index, location) {
    if (!location) {
      location = {
        'type': 'type98',
        name: ''
      };
    }

    var instance = this,
      state = instance.state,
      props = instance.props,
      googlemap = state.googlemap;

    location = location || {};
    var selectedLocations = this.state.selectedLocations;
    var directionsService = this.state.directionsService;
    var directionsDisplay = this.state.directionsDisplay;


    var point2LatLng = function (map, point, bounds) {
        var projection = map.getProjection(),
          isRTL = document.dir == "rtl",
          topRight = projection.fromLatLngToPoint(bounds.getNorthEast()),
          bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest()),
          scale = Math.pow(2, map.getZoom()),
          worldPoint = new google.maps.Point(
            isRTL ? (topRight.x + point.x / scale) : (bottomLeft.x - point.x / scale),
            topRight.y + point.y / scale
          );
        return projection.fromPointToLatLng(worldPoint);
      },

      adjustMapOffset = function (map, offset, routeBounds) {
        var isRTL = document.dir == "rtl";
        if (!routeBounds.extend) {
          //Point taken. :D pun intended.
          map.panBy(offset.x / (isRTL ? 2 : -2), offset.y / 2);

        } else {
          var offsetPoint = point2LatLng(map, offset, routeBounds);
          routeBounds.extend(offsetPoint);
          map.fitBounds(routeBounds);
        }
      },

      scheduleBoundAdjust = function (map, offset, bounds) {
        var listener = map.addListener('center_changed', function () {
          google.maps.event.removeListener(listener);
          setTimeout(function () {
            adjustMapOffset(map, offset, bounds);
          }, 0);
        });
      };

    selectedLocations[index] = location;
    if (location.type == 'type98') {
      if (directionsDisplay) {
        directionsDisplay.setMap(null);
        if (!!this.state.markers[index]) this.state.markers[index].setMap(null);
        for (var i = 0; i < this.state.uncompletedRequests.length; i++)
          this.state.uncompletedRequests[i].xhr.abort();
        this.setState({
          estimates: []
        });
      }
      return;
    }

    var imagesRoot = '/images/',
      iconPickup = imagesRoot + 'Pickup_noETA.png',
      iconDropoff = imagesRoot + 'Dropoff.png';

    var icons = {
      start: {
        url: iconPickup,
        scaledSize: new google.maps.Size(40, 40)
      },

      end: {
        url: iconDropoff,
        scaledSize: new google.maps.Size(40, 40)
      },
    };

    if (location.type != 'type98') {
      var bounds = new google.maps.LatLngBounds();
      var locations = [];
      for (var i = 0; i < selectedLocations.length; i++)
        if (selectedLocations[i] != null && selectedLocations[i] != undefined) {
          locations.push(selectedLocations[i]);
          if (selectedLocations[i].type != 'type98') {
            /*
            var marker = new google.maps.Marker({
                map: this.state.googlemap,
                position: new google.maps.LatLng(location.lat, location.lng)
            });
            this.state.markers[index]= marker;
            */
            bounds.extend(new google.maps.LatLng(selectedLocations[i].lat, selectedLocations[i].lng));
          }
        }

      if (locations.filter(function (x) {
          return x.type != 'type98'
        }).length == 1) {
        var location = locations.find((l) => {
          return l.type != 'type98'
        });
        var marker = new google.maps.Marker({
          map: this.state.googlemap,
          position: new google.maps.LatLng(location.lat, location.lng),
          icon: index == 1 ? icons.end : icons.start,
        });
        this.state.markers[index] = marker;
        bounds.extend(new google.maps.LatLng(location.lat, location.lng));
      }

      if (props.mapOffset) {
        scheduleBoundAdjust(googlemap, props.mapOffset, bounds.getCenter());
      }

      if (this.state.googlemap) {
        this.state.googlemap.fitBounds(bounds);
      }
    }

    if (locations.filter(function (x) {
        return x.type != 'type98'
      }).length > 1) {



      this.state.markers.forEach(function (m) {
        if (m != null) m.setMap(null);
      });
      this.setState({
        markers: [null, null]
      });

      var start = new google.maps.LatLng(locations[0].lat, locations[0].lng);
      var end = new google.maps.LatLng(locations[locations.length - 1].lat, locations[locations.length - 1].lng);

      var _waypoints = [];
      for (var i = 1; i < locations.length - 1; i++)
        _waypoints.push({
          location: new google.maps.LatLng(locations[i].lat, locations[i].lng),
          stopover: true
        });

      var request = {
        origin: start,
        destination: end,
        waypoints: _waypoints,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      };
      var vLegs = null;

      if (directionsService) directionsService.route(request, function (response, status) {
        if (status == 'OK') {
          vLegs = response.routes[0].legs[0];
          if (vLegs != null) {
            this.calculateTripEstimate(locations[0], locations[locations.length - 1], vLegs.duration.value, vLegs.distance.value);
          }

          if (props.mapOffset) {
            scheduleBoundAdjust(googlemap, props.mapOffset, response.routes[0].bounds);
          }

          directionsDisplay.setDirections(response);
          this.state.markers = [];
          this.makeMarker(vLegs.start_location, icons.start, '');
          this.makeMarker(vLegs.end_location, icons.end, '');
        }
      }.bind(this));

      if (directionsDisplay) directionsDisplay.setMap(this.state.googlemap);

    } else {
      if (directionsDisplay) directionsDisplay.setMap(null);
      if (this.state.googlemap) {
        this.state.googlemap.setZoom(10);
        locations.forEach(function (l) {
          if (l.type != 'type98') {
            /* var marker = new google.maps.Marker({
            map: state.googlemap,
            position: new google.maps.LatLng(l.lat, l.lng),
            })
            state.markers[index]= marker;*/

            var selectedLocation = selectedLocations[i];
            if (selectedLocation) {
              bounds.extend(new google.maps.LatLng(selectedLocation.lat, selectedLocation.lng));
            }
          }
        });
      }
    }
  }

  render() {
    var instance = this,
      props = instance.props,
      state = instance.state,
      msgs = props.messages || {},
      locationSearchList = this.locationSearchList = [];

    var messages = {
      'rideNow': msgs.rideNow || 'Ride Now',
      'rideLater': msgs.rideLater || 'Ride Later'
    };

    if (state.serviceArea == null) return [];

    var estimates = state.estimates,
      estimateCountLimit = 5,
      estimateListUI = {},
      estimateInfo = {
        'now': [],
        'later': []
      },

      estimateSortFn = function (v1, v2) {
        return v1.amount - v2.amount;
      },

      getEstimateRow = function (name, currency, amount) {
        return React.createElement('li', null,
          React.createElement('label', {
            'className': 'fare-car'
          }, name),
          React.createElement('span', {
              'className': 'fare-consume'
            },
            React.createElement('label', {
              'className': 'fare-currency'
            }, currency),
            React.createElement('label', {
              'className': 'fare-amount'
            }, amount)
          )
        );
      };

    estimates.forEach(function (estimate) {
      var carType = estimate.carType,
        allowedForNow = carType.allowedForNow,
        allowedForLater = carType.allowedForLater,
        tripEstimate = estimate.tripEstimate;

      if (allowedForNow) {
        estimateInfo.now.push({
          'name': carType.displayName,
          'currency': tripEstimate.country.currencyModel.displayCode,
          'amount': tripEstimate.estimatedPriceForNow
        });
      }

      if (allowedForLater) {
        estimateInfo.later.push({
          'name': carType.displayName,
          'currency': tripEstimate.country.currencyModel.displayCode,
          'amount': tripEstimate.estimatedPriceForLater
        });
      }
    });

    for (var key in estimateInfo) {
      estimateListUI[key] = estimateInfo[key]
        .sort(estimateSortFn)
        .slice(0, estimateCountLimit)
        .map(function (item) {
          return getEstimateRow(item.name, item.currency, item.amount);
        });
    }

    if (this.props.uiType == 1) { //For landing page
      var fareEstimator = [];
      for (var i = 0; i < this.state.size; i++) {
        if (i == 0)
          fareEstimator.push(React.createElement('div', {
            'className': 'small-1 columns cb'
          }, React.createElement('span', {
            'className': 'pickup-marker'
          })));
        if (i == this.state.size - 1)
          fareEstimator.push(React.createElement('div', {
            'className': 'small-1 columns cb'
          }, React.createElement('span', {
            'className': 'dropoff-marker'
          })));

        var locationSearch = React.createElement(LocationSearch, {
          ulID: i == 0 ? 'pickupUL' : 'dropOffField',
          id: i == 0 ? 'pickupField' : 'dropOffUL',
          index: i,
          selectLocationCallback: this.locationselected,
          placeholder: i == 0 ? this.props.pickUpPlaceholder : (i == this.state.size - 1 ? this.props.dropoffPlaceholder : 'enter multi stop location'),
          locationType: i == 0 ? 1 : (i == this.state.size - 1 ? 2 : 3),
          'serviceAreaId': this.state.serviceArea.id,
          'ref': function (locationSearch) {
            locationSearchList.push(locationSearch);
          }
        });
        fareEstimator.push(locationSearch);


        if (i != this.state.size - 1)
          fareEstimator.push(React.createElement('div', {
            'className': 'trail'
          }));
      }
      fareEstimator = [React.createElement('div', {
        'className': 'row fare-calculator'
      }, fareEstimator)];

      // For landing page
      var tabItem1 = React.createElement('li', {
          'className': 'tabs-title is-active'
        },
        React.createElement('a', {
          'href': '#panel1',
          'aria-selected': true
        }, messages.rideNow));

      var tabItem2 = React.createElement('li', {
          'className': 'tabs-title'
        },
        React.createElement('a', {
          'href': '#panel2'
        }, messages.rideLater));
      var tabHeader = React.createElement('ul', {
        'className': 'tabs',
        'data-tabs': '',
        'id': 'estimator-tabs',
        'ref': function (ref) {
          instance.estimateTabHandle = ref;
        }
      }, tabItem1, tabItem2);

      var result = React.createElement('div', {
          'className': 'fare-results'
        },

        React.createElement('div', {
            'className': 'results-tabs'
          },
          tabHeader,
          React.createElement('div', {
              'className': 'tabs-content',
              'data-tabs-content': 'estimator-tabs'
            },
            React.createElement('div', {
                'className': 'tabs-panel is-active',
                'id': 'panel1'
              },
              React.createElement('div', {
                  'className': 'result'
                },

                React.createElement('ul', {
                  'className': 'row fare-list'
                }, estimateListUI.now))),

            React.createElement('div', {
                'className': 'tabs-panel',
                'id': 'panel2'
              },
              React.createElement('div', {
                  'className': 'result'
                },
                React.createElement('ul', {
                  'className': 'row fare-list'
                }, estimateListUI.later))))));

      var lang = window.location.pathname.substr(1);
      lang = lang.split("-")[0].replace("/", "");
      var signupAndRide = React.createElement('div', {
          'className': 'small-12 columns brick end next-link-holder'
        },
        React.createElement('a', {
            'className': 'next-link',
            'href': this.props.signUpRideUrl.replace("{lang}", lang)
          },
          this.props.signUpRideText,
          React.createElement('img', {
            'className': 'reverse-forward',
            'src': '/images/farward-ico.svg'
          })));


      var headings = [];
      if (this.props.fareEstimatorHeading && this.props.fareEstimatorHeading != '') {
        headings.push(React.createElement('h1', {
          className: 'h1'
        }, this.props.fareEstimatorHeading));
      }
      if (this.props.fairEstimateText && this.props.fairEstimateText != '') {
        headings.push(React.createElement('div', {
          className: 'text cell'
        }, this.props.fairEstimateText + " " + this.state.serviceArea.displayName));
      }
      var renderReturn = [];

      if (headings.length) {
        renderReturn.push(headings);
      }

      renderReturn.push(fareEstimator);

      if (estimates.length != 0) {
        renderReturn.push(result);
        renderReturn.push(signupAndRide);
      }
      return renderReturn;

      //for city details page

    } else if (this.props.uiType == 2) {
      var fareEstimator = [];
      for (var i = 0; i < this.state.size; i++) {
        if (i == 0)
          fareEstimator.push(React.createElement('div', {
            'className': 'small-1 columns cb'
          }, React.createElement('span', {
            'className': 'pickup-marker'
          })));
        if (i == this.state.size - 1)
          fareEstimator.push(React.createElement('div', {
            'className': 'small-1 columns cb'
          }, React.createElement('span', {
            'className': 'dropoff-marker'
          })));

        var locationSearch = React.createElement(LocationSearch, {
          ulID: i == 0 ? 'pickupUL' : 'dropOffField',
          id: i == 0 ? 'pickupField' : 'dropOffUL',
          index: i,
          selectLocationCallback: this.locationselected,
          placeholder: i == 0 ? this.props.pickUpPlaceholder : (i == this.state.size - 1 ? this.props.dropoffPlaceholder : 'enter multi stop location'),
          locationType: i == 0 ? 1 : (i == this.state.size - 1 ? 2 : 3),
          'serviceAreaId': this.state.serviceArea.id,
          'ref': function (locationSearch) {
            locationSearchList.push(locationSearch);
          }
        });
        fareEstimator.push(locationSearch);

        if (i != this.state.size - 1)
          fareEstimator.push(React.createElement('div', {
            'className': 'trail'
          }));
      }
      fareEstimator = [React.createElement('div', {
        'className': 'row fare-calculator'
      }, fareEstimator)];

      var tabItem1 = React.createElement('li', {
          'className': 'tabs-title is-active'
        },
        React.createElement('a', {
          'href': '#panel1',
          'aria-selected': true
        }, messages.rideNow));

      var tabItem2 = React.createElement('li', {
          'className': 'tabs-title'
        },
        React.createElement('a', {
          'href': '#panel2'
        }, messages.rideLater));
      var tabHeader = React.createElement('ul', {
        'className': 'tabs',
        'data-tabs': '',
        'id': 'estimator-tabs',
        'ref': function (ref) {
          instance.estimateTabHandle = ref;
        }
      }, tabItem1, tabItem2);

      var result = React.createElement('div', {
          'className': 'fare-results'
        },

        React.createElement('div', {
            'className': 'results-tabs'
          },
          tabHeader,
          React.createElement('div', {
              'className': 'tabs-content',
              'data-tabs-content': 'estimator-tabs'
            },
            React.createElement('div', {
                'className': 'tabs-panel is-active',
                'id': 'panel1'
              },
              React.createElement('div', {
                  'className': 'result'
                },

                React.createElement('ul', {
                  'className': 'row'
                }, estimateListUI.now))),

            React.createElement('div', {
                'className': 'tabs-panel',
                'id': 'panel2'
              },
              React.createElement('div', {
                  'className': 'result'
                },
                React.createElement('ul', {
                  'className': 'row'
                }, estimateListUI.later))))));

      var signupAndRide = React.createElement('div', {
          'className': 'small-12 columns brick end'
        },
        React.createElement('a', {
            'className': 'next-link',
            'href': this.props.signUpRideUrl
          },
          this.props.signUpRideText,
          React.createElement('img', {
            'className': 'reverse-forward',
            'src': '/images/farward-ico.svg'
          })));

      var headings = [];
      if (this.props.fareEstimatorHeading && this.props.fareEstimatorHeading != '') {
        headings.push(React.createElement('h1', {
          className: 'h1'
        }, this.props.fareEstimatorHeading));
      }
      if (this.props.fairEstimateText && this.props.fairEstimateText != '') {
        headings.push(React.createElement('div', {
          className: 'text cell'
        }, this.props.fairEstimateText + " " + this.state.serviceArea.displayName));
      }
      var renderReturn = [];

      if (headings.length) {
        renderReturn.push(headings);
      }

      renderReturn.push(fareEstimator);

      if (estimates.length != 0) {
        renderReturn.push(result);
        //renderReturn.push(signupAndRide);
      }
      return renderReturn;

    } else if (this.props.uiType == 'fair-estimate') {
      var headings = [];
      headings.push(React.createElement('h1', {
        className: 'h1'
      }, this.props.fareEstimatorHeading));
      if (this.props.fairEstimateText != '') headings.push(React.createElement('div', {
        className: 'text cell'
      }, this.props.fairEstimateText + " " + this.state.serviceArea.displayName));

      var fareEstimator = [];
      for (var i = 0; i < this.state.size; i++) {
        if (i == 0)
          fareEstimator.push(React.createElement('div', {
            'className': 'small-1 columns cb'
          }, React.createElement('span', {
            'className': 'pickup-marker'
          })));
        if (i == this.state.size - 1)
          fareEstimator.push(React.createElement('div', {
            'className': 'small-1 columns cb'
          }, React.createElement('span', {
            'className': 'dropoff-marker'
          })));

        var locationSearch = React.createElement(LocationSearch, {
          id: i == 0 ? 'pickupField' : 'dropOffField',
          index: i,
          selectLocationCallback: this.locationselected,
          placeholder: i == 0 ? this.props.pickUpPlaceholder : (i == this.state.size - 1 ? this.props.dropoffPlaceholder : 'enter multi stop location'),
          locationType: i == 0 ? 1 : (i == this.state.size - 1 ? 2 : 3),
          'serviceAreaId': this.state.serviceArea.id,
          'ref': function (locationSearch) {
            locationSearchList.push(locationSearch);
          }
        });
        fareEstimator.push(locationSearch);

        if (i != this.state.size - 1)
          fareEstimator.push(React.createElement('div', {
            'className': 'trail'
          }));
      }
      fareEstimator = React.createElement('div', {
        'className': 'row fare-calculator'
      }, fareEstimator);

      var estimatesList = [];
      var estimates = this.state.estimates;
      for (var i = 0; i < estimates.length; i++)
        estimatesList.push(React.createElement('li', null,
          React.createElement('label', {
            'className': 'fare-car'
          }, estimates[i].carType.displayName),
          React.createElement('span', {
              'className': 'fare-consume'
            },
            React.createElement('label', {
              'className': 'fare-currency'
            }, estimates[i].tripEstimate.country.currencyModel.displayCode),
            React.createElement('label', {
              'className': 'fare-amount'
            }, estimates[i].tripEstimate.estimatedPriceForNow))));

      // For fare estimator page
      var result = React.createElement('div', {
          'className': 'fare-results'
        },
        React.createElement('div', {
            'className': 'result results-flow'
          },
          React.createElement('ul', {
            'className': 'row'
          }, estimatesList)));

      // var map = React.createElement('div', {id: 'map', 'className': '', style: {width: 'auto', height: '500px', 'backgroundSize': 'cover'}});

      // return [headings, fareEstimator, result, map];
      return [headings, fareEstimator, result];
    }
    return [];
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.estimateTabHandle) {
      new Foundation.Tabs(jQuery(this.estimateTabHandle));
    }
    google.maps.event.trigger(gmap, 'resize');
  }
}