function scrollTo(element, to, duration) {
    if (duration < 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 2;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        scrollTo(element, to, duration - 2);
    }, 10);
}

/*autocomplete script*/

$(document).on('keydown', '.inputstyle .ui-autocomplete-input', function(e) // or keypress I have the same result
{

    var $locationItems = $('.content-wrapper .common-search-dropdown li');

    var key = e.keyCode,
        $selected = $locationItems.filter('.selected'),
        $current;

    //if (key != 40 && key != 38 && key != 13) return;

    $locationItems.removeClass('selected');

    if (key == 40) // Down key
    {

        if (!$selected.length || $selected.is(':last-child')) {
            $current = $locationItems.eq(0);
        } else {
            $current = $selected.next();
        }
    }

    else if (key == 38) // Up key
    {
        if (!$selected.length || $selected.is(':first-child')) {
            $current = $locationItems.last();
        } else {
            $current = $selected.prev();
        }
    }
    if (key == 13) // Down key
    {
        $current=$selected;
        $selected.find('a')[0].click();
    }

    //$('.inputstyle').val(
    if(!!$current)$current.addClass('selected').text();

});