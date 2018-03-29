class CarTypes extends React.Component {

  constructor() {
    super();
    this.state = { carTypes: [] };

    this.update = this.update.bind(this);
 
    var carMessages = [];
    for (var i = 0; i < carsInfo.length; i++) {
      carMessages[carsInfo[i].name.toLowerCase()] = carsInfo[i].message;
    }
    this.state.carMessages = carMessages;
  }

  update(basePriceModels) {
    var setState = this.setState.bind(this);

    dotCMSService.getCarTypeImages(function (carTypeImageMap) {
      if (carTypeImageMap) {
        basePriceModels = basePriceModels.filter(function (basePriceModel) {
          var carType = basePriceModel.customerCarTypeModel;
          return carType.displayOnWeb && carTypeImageMap[carType.id];
        });
      }
      setState({ carTypes: basePriceModels });
    });
  }
  
  componentWillMount() {
      jQuery('#cartypes').showLoading();
  }

  componentDidUpdate() {
    currentSlide(1);
    sliderInit();
    jQuery('#cartypes').hideLoading();
  }


  render() {
    var state = this.state,
      carTypes = state.carTypes,
      list1 = [],
      list2 = [];

    carTypes.forEach(function (carType) {
      carType = carType.customerCarTypeModel;
      var carPic = carTypeImageMap[carType.id] || "/images/car-graphic-placeholder.svg";
    
      
      list1.push(React.createElement('div',{},
      React.createElement('p',{},carType.displayName)
      ));
      list2.push(React.createElement('div', {},React.createElement('img', { src: carPic })));
    });


    return [
        React.createElement('div', { class: 'pr_images'}, null),
        React.createElement('div', { class: 'slider-nav', onClick: this.showSlide }, list1),
        React.createElement('div', { class: 'slider-for' }, list2)
    ];
    
  }
  
}