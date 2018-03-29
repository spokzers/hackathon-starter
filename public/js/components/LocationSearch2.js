class LocationSearch extends React.Component {

  constructor() {
    super();
    this.getLocations = this.getLocations.bind(this);
  }

  clear() {
    this.autoComplete.clear();
  }

  getLocations(callback, searchKey) {
    var props = this.props,
      locationService = new LocationService();
    this.currentRequest = locationService
      .getLocations(props.serviceAreaId, props.locationType, searchKey)
      .end((err, res) => {
        var list = [];

        if (err) {
          console.error('location search call failed');
        }
        if (res && res.body && res.body.length) {
          list = res.body;
        }
        callback(list);
      });
  }

  render() {
    var instance = this,
      props = instance.props;

    return React.createElement(AutoComplete, {
      getData: instance.getLocations,
      onTextChange: function (value) {
        if (instance.currentRequest) {
          instance.currentRequest.abort();
        }
      },
      onValueChange: function (value) {
        props.selectLocationCallback(props.index, {
          type: 'type98',
          name: value
        });
      },
      onSelect: function (location) {
        props.selectLocationCallback(props.index, location);
      },
      getDisplayValue: function (item) {
        return item.sDName;
      },
      ref: function (ref) {
        instance.autoComplete = ref;
      },
      placeholder: props.placeholder,
      inputClassName: 'inputstyle',
      listClassName: 'common-search-dropdown',
      className: 'small-11 medium-10 large-11 columns brick relative end'
    });
  }
}