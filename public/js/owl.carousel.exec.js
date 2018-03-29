(function() {
  $(".owl-sm-3-slider").each(function() {
    var featureSlider = jQuery(this),
      columns = featureSlider.find(".columns");
    
    columns
    .removeClass("columns")
    .removeClass("end")
    .removeClass("small-12")
    .removeClass("medium-12")
    .removeClass("medium-4")
    .removeClass("large-4");
  
    featureSlider
    .addClass("owl-carousel")
    .addClass("owl-theme")
    .owlCarousel({
      nav:false,
      rtl:document.dir == "rtl",
      loop:false,
      margin:30,
      responsiveClass:true,
      responsive: {
        0:{
          items:1
        },
  
        1024:{ //Alleged non-mobile width :D
          items:3
        }
      }
    });
  });

  $(".owl-1-slider").each(function () {
    var carousel = jQuery(this);
    carousel
      .addClass("owl-carousel")
      .addClass("owl-theme")
      .owlCarousel({
        nav: false,
        rtl: document.dir == "rtl",
        loop: true,
        autoplay:true,
        items: 1
      });
  });

  /*
  var getRideSlider = $(".owl-get-ride-slider");
  getRideSlider.each(function() {
    var featureSlider = jQuery(this);

    featureSlider
    .addClass("owl-carousel")
    .addClass("owl-theme")
    .owlCarousel({
      items:1,
      autoplay:true,
      nav:false,
      dots:false,
      loop:true,
      animateOut: 'fadeOut',
      animateIn: 'fadeIn',
      mouseDrag: false,
      margin:10
    });

    featureSlider.click(function(event) {
      var target = jQuery(event.target);
      if(target.is("[data-pager]")) {
        var pageNumber = target.attr("data-pager");
        featureSlider.trigger('to.owl.carousel', [pageNumber, 150]);
      }
    });
  });
  */
})();