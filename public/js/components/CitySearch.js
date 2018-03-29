class CitySearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      'searchInput': '',
      'searchResults': [],
      'serviceAreas': undefined,
      'selectedIndex': undefined
    };

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.selectServiceArea = this.selectServiceArea.bind(this);
    this.clear = this.clear.bind(this);

    var instance = this;
    document.addEventListener('click', function (event) {
      var target = event.target,
        itemListDOM = instance.itemListDOM,
        renderTarget = ReactDOM.findDOMNode(instance),
        isRenderTarget = target == renderTarget;

      if (itemListDOM && !isRenderTarget && !itemListDOM.contains(target)) {
        instance.clear();
      }
    });
  }

  update(sAreas) {
    this.setState({ 'serviceAreas': sAreas });
  }

  handleSearchChange(event) {
    var newTerm = event.target.value,
      searchResults = this.getServiceAreasForTerm(newTerm);

    this.setState({
      'searchInput': newTerm,
      'searchResults': searchResults,
      'selectedIndex': searchResults.length ? 0 : undefined
    });
  }

  clear() {
    this.setState({
      'searchInput': '',
      'searchResults': [],
      'selectedIndex': undefined
    });
  }

  moveInSearchResultsBy(moveBy) {
    var state = this.state,
      searchResults = state.searchResults,
      selectedIndex = state.selectedIndex;

    if (!searchResults || !searchResults.length) {
      return;
    }

    var maxIndex = searchResults.length - 1;

    if (selectedIndex == undefined) {
      selectedIndex = (moveBy == 1) ? 0 : maxIndex;

    } else {
      selectedIndex += moveBy;
    }

    if (selectedIndex < 0) {
      selectedIndex = maxIndex;

    } else if (selectedIndex > maxIndex) {
      selectedIndex = 0;
    }

    var selectedItem = searchResults[selectedIndex];

    this.setState({
      'selectedIndex': selectedIndex,
      'searchInput': selectedItem.displayName
    });
  }

  selectServiceArea(serviceArea) {
    var state = this.state,
      props = this.props,
      searchResults = state.searchResults,
      selectedIndex = state.selectedIndex;

    if (!serviceArea) {
      selectedIndex = selectedIndex ? selectedIndex : 0;
      if (searchResults) {
        serviceArea = searchResults[selectedIndex]
      }
    }

    if (serviceArea && props.onSelect) {
      props.onSelect(serviceArea);
    }

    this.setState({
      'searchResults': []
    });
  }

  handleKeyDown(event) {
    var key = event.which,
      keyNext = (key == 40),
      keyPrev = (key == 38),
      keyEnter = (key == 13),
      keyEsc = (key == 27);

    if (keyNext) {
      this.moveInSearchResultsBy(1);

    } else if (keyPrev) {
      this.moveInSearchResultsBy(-1);

    } else if (keyEnter) {
      this.selectServiceArea();

    } else if (keyEsc) {
      this.clear();
    }
  }

  getServiceAreasForTerm(term) {
    var results = [];

    if (!term) {
      return results;
    }

    var state = this.state,
      serviceAreas = state.serviceAreas,
      searchTerm = term.toLowerCase();

    serviceAreas.some(function (serviceArea) {
      var name = serviceArea.name.toLowerCase(),
        displayName = serviceArea.displayName.toLowerCase();

      if (name == searchTerm || displayName == searchTerm) {
        results = [{
          'item': serviceArea,
          'score': 0
        }];
        return true;
      }
      
      var nameIndex = name.indexOf(searchTerm) + 1,
        displayNameIndex = displayName.indexOf(searchTerm) + 1;
      
      if (nameIndex || displayNameIndex) {
        results.push({
          'item': serviceArea,
          'score': nameIndex + displayNameIndex
        });
      }
    });

    return results
      .sort(function (v1, v2) {
        return v1.score - v2.score;
      }).map(function (data) {
        return data.item;
      });
  }

  getHighlightedTerm(value, term, callback) {
    var pattern = new RegExp(term, 'ig'),
      index,
      list = [],
      listItem = null,
      value = value.replace(pattern, function (match, count) { return '<' + match + '>'; }),
      maxIndex = value.length - 1;

    for (index = 0; index <= maxIndex; index++) {
      var ch = value.charAt(index),
        limitStart = (ch == '<'),
        limitEnd = (ch == '>'),
        onBorder = limitStart || limitEnd,
        lastCharacter = index == maxIndex;

      if (!lastCharacter && (!listItem || onBorder)) {
        list.push(listItem = {
          'value': '',
          'highlighted': limitStart
        });
      }

      if (!onBorder) {
        listItem.value += ch;
      }
    }

    return list.map(function (item) {
      return callback(item.value, item.highlighted);
    });
  }

  render() {
    var instance = this,
      state = instance.state,
      props = instance.props,
      uiType = props.uiType,
      citySearchPlaceholder = props.citySearchPlaceholder,
      selectedIndex = state.selectedIndex,
      serviceAreaUIList = [],
      areaSelected = instance.selectServiceArea;

    if (state.serviceAreas == null) {
      return [];
    }

    serviceAreaUIList = state.searchResults.map(function (serviceArea, index) {
      var name = serviceArea.name,
        displayName = serviceArea.displayName,
        isSelected = index == selectedIndex,
        highlightedName = document.dir == 'rtl' ? displayName : instance.getHighlightedTerm(
          displayName,
          state.searchInput,
          function (value, highlighted) {
            if (highlighted) {
              return React.createElement('span', { 'className': 'highlighted' }, value);
            }
            return value;
          });

      return React.createElement('li', {
        'onClick': function (event) {
          areaSelected(serviceArea);
        },
        'key': index,
        'value': name,
        'className': isSelected ? 'selected' : ''
      }, React.createElement('a', {
        'value': name,
        'display-value': displayName
      }, highlightedName));
    });

    var elements = [];

    var inputProps = {
      'key': 0,
      'type': 'text',
      'autoComplete': 'off',
      'value': state.searchInput,
      'placeholder': citySearchPlaceholder,
      'onChange': this.handleSearchChange,
      'onKeyDown': this.handleKeyDown
    };

    var hasResults = (serviceAreaUIList.length > 0);

    //TODO remove the need for these checks. Parametrize the component.
    if (uiType == 'landing_page') {
      inputProps.id = 'newcitysearch';
      inputProps.className = 'inputstyle';
      elements.push(React.createElement('input', inputProps));
      if (hasResults) {
        elements.push(React.createElement('ul', {
          'key': 1,
          'ref': function (ul) {
            instance.itemListDOM = ul;
          },
          'id': 'newservicearealist',
          'className': 'common-search-dropdown'
        }, serviceAreaUIList));
      }

    } else if (uiType == 'footer') {
      inputProps.id = 'footernewcitysearch';
      inputProps.className = 'inputstyle d-block w-100';
      elements.push(React.createElement('input', inputProps));
      elements.push(React.createElement('a', { 'id': 'footer-search-button', 'className': 'search-btn', 'key': 1 }));
      elements.push(React.createElement('ul', {
        'key': 2,
        'ref': function (ul) {
          instance.itemListDOM = ul;
        },
        'id': 'footerservicearealist',
        'className': 'common-search-dropdown' + (hasResults ? '' : ' hide')
      }, serviceAreaUIList));

    } else if (uiType == 'citylist_page') {
      inputProps.id = 'newcitysearch';
      inputProps.className = 'city-search-input columns large-8 medium-12 small-12';
      elements.push(React.createElement('input', inputProps));
      elements.push(React.createElement('a', { 'id': 'search-button', 'className': 'search-button', 'key': 1 }));
      if (hasResults) {
        elements.push(React.createElement('ul', {
          'key': 2,
          'ref': function (ul) {
            instance.itemListDOM = ul;
          },
          'id': 'citylistservicearealist',
          'className': 'city-search-dropdown'
        }, serviceAreaUIList));
      }
    }

    return elements;
  }

  componentDidUpdate(prevProps, prevState) {
    var itemListDOM = this.itemListDOM;
    if (itemListDOM) {
      var selectedItem = itemListDOM.querySelector('li.selected');
      if (selectedItem) {
        itemListDOM.scrollTop = selectedItem.offsetTop - 5;
      }
    }
  }

}