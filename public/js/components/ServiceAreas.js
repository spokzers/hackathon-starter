class ServiceAreas extends React.Component {
  
  constructor() {
    super();
    this.state = {};
    this.update = this.update.bind(this);
  }

  update(serviceAreas) {
    var countryNameMap = {},
      countryToServiceAreasMap = {};
    
    serviceAreas.forEach(function (serviceArea) {
      var countryModel = serviceArea.serviceProviderAvailableCountryModel.countryModel,
        countryName = countryModel.name,
        countryCode = countryModel.twoCharCode;
      
        if (!countryToServiceAreasMap[countryName]) {
        countryToServiceAreasMap[countryName] = [];
      }

      countryToServiceAreasMap[countryName].push({
        'displayName': serviceArea.displayName,
        'name': serviceArea.name,
        'countryCode': countryCode
      });

      if(!countryNameMap[countryName]) {
        countryNameMap[countryName] = countryModel.displayName;
      }
    });

    this.setState({
      'countryToServiceAreasMap': countryToServiceAreasMap,
      'countryNameMap' : countryNameMap
    });
  }

  componentDidUpdate() {
    $(document).foundation();
  }

  render() {
    var state = this.state,
      countryNameMap = state.countryNameMap,
      countryToServiceAreasMap = state.countryToServiceAreasMap;
    
    if (countryToServiceAreasMap == null) {
      return [];
    }

    var countries = [],
      countryIndex = 0;
    
    for (var country in countryToServiceAreasMap) {
      var serviceAreas = countryToServiceAreasMap[country];

      var serviceAreasElements = [];
      for (var i = 0; i < serviceAreas.length; i++) {
        var serviceArea = serviceAreas[i];
        //var dispName = serviceArea.split("-")[0];
        //var countryCode = serviceArea.split("-")[1].toLowerCase();
        //var countryCode = serviceArea.countryCode.toLowerCase();
        var name = serviceArea.name;
        var displayName = serviceArea.displayName;
        var countryCode = country_code;
        var url = '/' + language_code + '-' + countryCode + '/cities/' + name.replace(/ /g, '-').toLowerCase() + '/';
        serviceAreasElements.push(React.createElement('li', { 'className': 'small-6 medium-4 large-3', 'key': i },
          React.createElement('span', null, React.createElement('a', { 'href': url }, displayName))));
      }

      var countryDisplayName = countryNameMap[country];

      countries.push(React.createElement('li',
        {
          'key': country,
          'className': 'accordion-item ' + (countryIndex == 0 ? 'is-active' : ''),
          'data-accordion-item': 'true'
        },
        React.createElement('a', { 'className': 'accordion-title-custom' }, countryDisplayName),
        React.createElement('div', { 'className': 'accordion-content', 'data-tab-content': 'true' },
          React.createElement('ul', { 'className': 'city-list-items' }, serviceAreasElements)
        )));
      countryIndex++;
    }
    return React.createElement('ul', { 'className': 'accordion', 'data-accordion': 'true', 'data-multi-expand': 'true' }, countries);
  }
}