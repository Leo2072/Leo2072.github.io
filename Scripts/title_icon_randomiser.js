var TITLE_ICON_SOURCES = ["Sprites/raccoon_title_icon.png", "Sprites/penguin_title_icon.png"];


// Get the title icon element.
var titleIcon = document.getElementById("title-icon");

function randomiseTitleIcon()
{
    // Set the picture source of the title icon to a random URL in the TITLE_ICON_SOURCES array.
    titleIcon.setAttribute("href", randomItemFromArray(TITLE_ICON_SOURCES));
}
