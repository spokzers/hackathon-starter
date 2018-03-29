var citySearchRender = ReactDOM.render(
  React.createElement(CitySearch, {
    'uiType': "citylist_page",
    'citySearchPlaceholder': citySearchPlaceholder,
    'searchUrl': searchUrl,
    'onSelect' : function(serviceArea) {
      var cityName = serviceArea.name;
      cityName = cityName.replace(/ /g, '-').toLowerCase();
      window.location.href = '/' + language_code + '-' + country_code + '/cities/' + cityName + '/';
    }
  }),
  document.getElementById('citysearch')
);

var serviceAreaRender = ReactDOM.render(React.createElement(ServiceAreas, { 'searchUrl': searchUrl }), document.getElementById('service-areas'));

ServiceAreaProvider.get(function (serviceArea, serviceAreaList) {
  $("#newcitysearch").attr("placeholder", citySearchPlaceholder);
  
  serviceAreaRender.update(serviceAreaList);
  citySearchRender.update(serviceAreaList);

  /*
  $("#newcitysearch").keypress(function (e) {
    if (e.which == 13) {
      var selectedServiceArea = isServiceAreaExists(serviceAreaList, $("#newcitysearch").val());
      if ($("#newcitysearch").val() != "" && selectedServiceArea != null) {
        var cityName = $("#newcitysearch").attr('key');
        if(!cityName) {
          cityName = $("#newcitysearch").val();
        }
        cityName = cityName.replace(/ /g, '-').toLowerCase() + '/';
        window.location.href = '/' + language_code + '-' + selectedServiceArea.serviceProviderAvailableCountryModel.countryModel.twoCharCode.toLowerCase() + '/cities/' + cityName;
      
      } else {
        window.location.href = 'javascript:void(0)';
      }
    }
  });
  */

  $('#search-button').click(function (e) {
    citySearchRender.selectServiceArea();    
    /*
    var selectedServiceArea = isServiceAreaExists(serviceAreaList, $("#newcitysearch").val());
    if ($("#newcitysearch").val() != "" && selectedServiceArea != null) {
      var cityName = $("#newcitysearch").attr('key');
      if(!cityName) {
        cityName = $("#newcitysearch").val();
      }
      cityName = cityName.replace(/ /g, '-').toLowerCase() + '/';
      window.location.href = '/' + language_code + '-' + selectedServiceArea.serviceProviderAvailableCountryModel.countryModel.twoCharCode.toLowerCase() + '/cities/' + cityName;
    
    } else {
      window.location.href = 'javascript:void(0)';
    }
    */
  });

  /*
  var liSelected = undefined;
  var tempListOnMouseClick = undefined
  $(document).on('click', '.drop-list .city-search-dropdown li', function (event) {
    event.preventDefault();
    liSelected = event.currentTarget;
    tempListOnMouseClick = $(".drop-list .city-search-dropdown li");
    $("#citylistservicearealist").addClass("hide");

  });

  $('#citysearch').bind("DOMNodeInserted", function () {
    var li = $('.drop-list .city-search-dropdown li');
    var index = 0;
    var dIndex = 0;

    liSelected = undefined;
    $("#newcitysearch").keydown(function (e) {

      if (e.which === 13) {
        //click on anchor tag button
      } else {


        li = $('.drop-list .city-search-dropdown li');

        var menu = $('.drop-list .city-search-dropdown');
        var active;
        var height;
        var top = menu.length > 0 ? menu.scrollTop() : 0;
        var menuHeight = menu.length > 0 ? menu[0].scrollHeight : 0;
        var menuVisibleHeight = menu.length > 0 ? menu[0].clientHeight : 0;

        if (e.which === 40) {
          if (liSelected) {
            liSelected.removeClass('selected');
            next = liSelected.next();
            index++;
            if (next.length > 0) {
              liSelected = next.addClass('selected');
            } else {
              liSelected = li.eq(0).addClass('selected');
              menu.scrollTop(0);
              index = 1;
            }
          } else {
            liSelected = li.eq(0).addClass('selected');
            menu.scrollTop(0);
            index = 1;
          }

          $("#newcitysearch")
            .val(liSelected.text())
            .attr('key', liSelected.attr('value'));
            
          active = menu.find('.selected');
          height = active.outerHeight();
          top = index * height;
          var nextHeight = top + height;
          var maxHeight = menuHeight - height;

          if (nextHeight - 2 * height >= maxHeight) {
            //Bottom item - go to top of menu
            menu.scrollTop(0);
            liSelected.removeClass('selected');
            liSelected = li.eq(0).addClass('selected');
            index = 1;
          } else if ((index % 5) == 0) {
            //All but bottom item goes down
            menu.scrollTop(top - height);
          }
        }
        else if (e.which === 38) {
          if (top == 0)
            dIndex = 0;
          dIndex++;
          if (liSelected) {
            liSelected.removeClass('selected');
            next = liSelected.prev();


            if (next.length > 0) {
              liSelected = next.addClass('selected');
            } else {
              liSelected = li.last().addClass('selected');
            }
          } else {
            liSelected = li.last().addClass('selected');
          }

          $("#newcitysearch")
            .val(liSelected.text())
            .attr('key', liSelected.attr('value'));
          
          active = menu.find('.selected');
          height = active.outerHeight();

          if (top == 0) {
            menu.scrollTop(menuHeight);
          } else {
            menu.scrollTop(top - (dIndex > 1 ? (index - 1) * height : index * height));
          }
        }
      }
      e.which = undefined;
    });
  });// end of DOMNodeInserted
  */
  
});