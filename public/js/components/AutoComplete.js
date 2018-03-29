class AutoComplete extends React.Component {

  constructor() {
    super();
    this.state = {
      searchText: '',
      itemList: [],
      selectedIndex: undefined
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.clear = this.clear.bind(this);
  }

  handleInputChange(event) {
    var instance = this,
      props = instance.props,
      onTextChange = props.onTextChange,
      input = instance.input,
      value = input.value;

    if (instance.timeoutID) {
      window.clearTimeout(instance.timeoutID);
    }

    instance.setState({
      searchText: value
    });

    if (onTextChange) {
      onTextChange(value);
    }

    instance.timeoutID = window.setTimeout(function (event) {
      instance.handleValueChange(input.value);
    }, 200);
  }

  handleValueChange(value) {
    var instance = this,
      props = instance.props;

    if (props.onValueChange) {
      props.onValueChange(value);
    }

    props.getData(function (list) {
      instance.setState({
        selectedIndex: 0,
        itemList: list || []
      });
    }, value);
  }

  selectItemAtCurrentIndex() {
    this.selectItemAtIndex(this.state.selectedIndex);
  }

  selectItemAtIndex(index) {
    var itemList = this.state.itemList;
    if (itemList && itemList.length && index != null) {
      this.selectItem(itemList[index])
    }
  }

  selectItem(item) {
    this.setState({
      itemList: [],
      selectedIndex: undefined,
      searchText: item ? this.props.getDisplayValue(item) : ''
    });
    this.props.onSelect(item);
  }

  moveInSearchResultsBy(moveBy) {
    var state = this.state,
      props = this.props,
      searchResults = state.itemList,
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
      selectedIndex: selectedIndex,
      searchText: props.getDisplayValue(selectedItem)
    });
  }

  clear() {
    this.selectItem();
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
      this.selectItemAtCurrentIndex();

    } else if (keyEsc) {
      this.clear();
    }
  }

  render() {
    var instance = this,
      state = instance.state,
      props = instance.props,
      getDisplayValue = props.getDisplayValue,
      selectItem = instance.selectItem,
      uiList = state.itemList.map(function (item, index) {
        var isSelected = state.selectedIndex === index;
        return React.createElement('li', {
            key: index,
            className: isSelected ? 'selected' : '',
            onClick: function () {
              selectItem(item);
            }
          },
          React.createElement(
            'a', {}, getDisplayValue(item)
          )
        );
      });
    
    var elements = [];
    elements.push(React.createElement('input', {
      autoComplete: 'off',
      type: 'text',
      className: props.inputClassName,
      id: props.id,
      value: instance.state.searchText,
      placeholder: props.placeholder,
      onChange: instance.handleInputChange,
      onKeyDown: instance.handleKeyDown,
      ref: function (ref) {
        instance.input = ref;
      }
    }));

    if (uiList.length > 0) {
      elements.push(React.createElement('ul', {
        ref: function (ul) {
          instance.itemListDOM = ul;
        },
        className: props.listClassName
      }, null, uiList));
    }

    return React.createElement('div', {
      className: props.className
    }, elements);
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