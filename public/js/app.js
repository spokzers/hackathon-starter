$(document).foundation();

var app = {};

$(function () {
    /*$(document).foundation(); */
    app.topMenu();

});

// Top menu
app.topMenu = function () {

    $(".dropdown").on('show.zf.dropdownmenu', function (ev, $el) {
        $el.css({
            "display": "none"
        })
            .slideDown(400);
    });

    $(".dropdown").on('hide.zf.dropdownmenu', function (ev, $el) {
        $el.children("ul")
            .css('display', 'inherit')
            .slideUp(200);
    });

};

// Default setting
Foundation.DropdownMenu.defaults.closingTime = 100;
Foundation.DropdownMenu.defaults.hoverDelay = 200;

/* Open the sidenav */
function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}

/* Close/hide the sidenav */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Back to top

/*window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("back-to-top").style.opacity = "1";
    } else {
        document.getElementById("back-to-top").style.opacity = "0";
    }
}

document.getElementById('back-to-top').onclick = function () {
    scrollTo(document.body, 0, 100);
}*/

function scrollTo(element, to, duration) {
    if (duration < 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 2;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        scrollTo(element, to, duration - 2);
    }, 10);
}

/*Cartype slider*/

var slideIndex = 1;
//showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if(slides.length == 0 || dots.length == 0) return;

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
    
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
}


/*
$('.count').each(function () {
    $(this).prop('Counter',0).animate({
        Counter: $(this).text()
    }, {
        duration: 1000,
        easing: 'swing',
        step: function (now) {
            $(this).text(Math.ceil(now));
        }
    });
});

*/

//Brand slider
/* var flkty = new Flickity( '#brandCarousel', {
    contain: true,
    pageDots: false,
    wrapAround: true,
    freeScroll: true,
    autoPlay: 3000
});
*/

var $carousel = $('.carousel').flickity({
        cellalign: 'left',
        contain: true,
        prevNextButtons: false,
        pageDots: false
    });
$carousel.flickity('reloadCells')


$(document).on('click', '.deck-link', function(event) {
    event.preventDefault();
    $('.slide-deck').toggleClass('show-deck');
});

jQuery(function () {
            jQuery.smartbanner({
            daysHidden: 15,   // days to hide banner after close button is clicked (defaults to 15)
            daysReminder: 90, // days to hide banner after "VIEW" button is clicked (defaults to 90)
            appStoreLanguage: 'us', // language code for the App Store (defaults to user's browser language)
            title: 'Careem',
            author: 'Careem - Transportation',
            button: 'View',
            speedIn: 100, // Show animation speed of the banner
            speedOut: 100, // Close animation speed of the banner
            //appendToSelector: 'header',
            hideOnInstall: true,
            inAppStore: 'On the App Store',
            inGooglePlay: 'In Google Play',
            onClose: function() {
                jQuery('#smartbanner').addClass('hide');
                jQuery('.menu-list').removeClass('fixLogo');
                //jQuery('.ab-pos').removeClass('abFix');
            },
        });

        if(jQuery('#smartbanner').length > 0){
            jQuery('.menu-list').addClass('fixLogo');
            //jQuery('.ab-pos').addClass('abFix');
        }
});

/*
jQuery(function () {
    if(jQuery('.fare-calculator').length < 1)
        {
            jQuery('.fare-estimator').showLoading();
        }
});

*/

function setHeight(){
    document.getElementById("cartypes").classList.add("50vh");

};

function unsetHeight(){
    document.getElementById("cartypes").classList.remove("50vh");
};

function rtlCheck(){
    if (language_code == "ar"){
        return true;
    } else {
        return false
    }
}

function sliderInit(){
    jQuery('.slider-for').not('.slick-initialized').slick({
            slidesToShow: 1,
            rtl: rtlCheck(),
            slidesToScroll: 1,
            fade: false,
            asNavFor: '.slider-nav',
            dots: false,
            arrows: true,
            appendArrows: '.pr_images',
            prevArrow: '<div class="arrow feat-prev">‹‹</div>',
            nextArrow: '<div class="arrow feat-next">››</div>'
        });
        
     jQuery(".slider-nav").not('.slick-initialized').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            rtl: rtlCheck(),
            infinite: true,
            asNavFor: '.slider-for',
            dots: false,
            arrows: false,
            centerMode: true,
            centerPadding: '20px',
            focusOnSelect: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        centerPadding: '0px',
                    }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        });
};


window.onresize = function(event) {
    sliderInit();
};