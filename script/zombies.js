/*****************************************************************************\
    This file contains snippets of code that solved a problem in alternate
    way. You would not put a file like this in a release candidate or master
    branch.
\*****************************************************************************/

/*****************************************************************************\
// Alternate code for creating images that utilizes JavaScript heavily
let newFighterIMG = document.createElement('img');  // Create an image element
newFighterIMG.setAttribute('id', P0CHARA + 'IMG');  // Change the ID of the image
newFighterIMG.src = 'img/' + P0CHARA + '_idle.png'; // Set the right graphic
newFighterIMG.alt = P0NAME  // Change the mouseover alt text
newFighterIMG.className = 'fighterIMG'; // Set the image to the fighter image classs
// Move the new image into the 'graphicsBox'
document.getElementById('graphicsBox').appendChild(newFighterIMG);

newFighterIMG = document.createElement('img');  // Overwrite the image with another new image
newFighterIMG.setAttribute('id', P1CHARA + 'IMG');  // Change the ID of the image
newFighterIMG.src = 'img/' + P1CHARA + '_idle.png'; // Set the right graphic
newFighterIMG.alt = P1NAME  // Change the mouseover alt text
newFighterIMG.className = 'fighterIMG'; // Set the image to the fighter image classs
// Move the new image into the 'graphicsBox'
document.getElementById('graphicsBox').appendChild(newFighterIMG);
\*****************************************************************************/
