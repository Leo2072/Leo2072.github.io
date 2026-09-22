const titleIconSourceUrlList = ["Sprites/raccoon_title_icon.png", "Sprites/penguin_title_icon.png"];


// Get the title icon element.
var titleIcon = document.getElementById("title-icon");

function randomiseTitleIcon()
{
    // Set the picture source of the title icon to a random URL in the titleIconSourceUrlList array.
    titleIcon.setAttribute("href", randomItemFromArray(titleIconSourceUrlList));
}

// Set up the randomise-title-icon-button.
var randomiseTitleIconButton = document.getElementById("randomise-title-icon-button");
randomiseTitleIconButton.onclick = randomiseTitleIcon;