// Setup the game
let logging = false; // Do we reset the output window each action or not?
let playerTurn = false; // "true" for player 2, "false" for player 1

// Reserve a space in global scope to store our fighters
let Player0;
let Player1;

// These will be used when creating the two fighters to identify each
const P0NAME = "Eddie";
const P0CHARA = "Crashr";
const P1NAME = "Josh";
const P1CHARA = "saml";

// Reserve a space in the global scope to save our div containers
let output;
let controls;
let graphics;
let bars;

// Game parameters
const START_HP = 10; // The amount of HP each player starts with
const START_SP = 10; // The amount of SP each player starts with
const MAX_STAT = 10; // The highest any stat can go
const MIN_DODGE = 4; // The target the player needs to hit to
const DODGE_MULTI = 0.25 // The multiplier of damage that is reduced by a dodge
const COST_DOUBLE = 2; // The SP cost of a Double Attack
const COST_RECOVER = 3; // The SP cost of Recover
const RECOVER_MULTI = 3; // THe multiplier to the random amount of recovered HP

// This is the template that we create new fighters from
class Fighter {
    constructor(name, charaName) {
        // 'constructer' is in all JS classes
        // It gets run immediately when a new object is created from a class

        // Set all of our defaults values for this new fighter here
        this.name = name;
        this.hp = START_HP;
        this.sp = START_SP;
        this.atk = 5;
        this.def = 5;
        this.tek = 5;
        this.charaName = charaName;
    }

    attack(target) {
        // 'Roll' for damage
        let damage = Math.ceil(Math.random() * this.atk);
        // 'Roll' to see if target dodged
        let dodge = Math.ceil(Math.random() * target.def);

        // If target 'rolled' higher than the successful dodge threshold
        if (dodge >= MIN_DODGE) {
            // Announce the target dodged
            output.innerHTML += `${target.name} <span class="abilityColor">Dodged!</span><br>`;
            // Reduce damage to half
            damage = Math.round(damage * DODGE_MULTI);
            // Show the target's dodge graphic
            updateGFX(target.charaName, 'dodge')
        } else {
            // Show the target's hit graphic
            updateGFX(target.charaName, 'hit')
        }
        // Announce damage and show this fighter's attack graphics
        output.innerHTML += `${this.name} did <span class="damageColor">${damage}</span> damage!<br>`;
        updateGFX(this.charaName, 'attack')
        // This both does damage AND checks to see if there was a knockout
        if (koCheck(target, damage)) {
            // "true" was returned
            // There was a knockout!
            output.innerHTML += `<b><span class="damageColor">Knockout!</span></b><br>`;
            updateGFX(target.charaName, 'ko')

        } else {
            // "false" was returned
            // The target is still in the game!
            output.innerHTML += `${target.name} has <span class="healthColor">${target.hp}</span> HP remaining.<br>`
        }
    }

    single(target) {
        // Save the html already in the outputBox, then erase the outputBox
        let oldText = output.innerHTML;
        output.innerHTML = "";
        // Do one attack
        this.attack(target);
        // Add old html from outputBox back in
        if (logging) {
            // Put the old html back into the output box
            output.innerHTML += '<hr>' + oldText
        }
        // Call this to end the turn
        endTurn();
    }

    double(target) {
        // Save the html already in the outputBox, then erase the outputBox
        let oldText = output.innerHTML;
        output.innerHTML = "";
        // Do one attack
        this.attack(target);
        // Check to see if this player has enough SP to use the ability
        if (this.sp >= COST_DOUBLE && !koCheck(target, 0)) {
            // Consume SP for using the ability
            this.sp -= COST_DOUBLE;
            // Log action details to 'outputBox'
            output.innerHTML += `<span class="abilityColor">Double-Kick!</span>(<span class="specialColor">${this.sp}</span> SP left)</span><br>`;
            // Do one attack
            this.attack(target);
        } else {
            output.innerHTML += `Not enough SP!<br>`;
        }
        // Add old html from outputBox back in
        if (logging) {
            // Put the old html back into the output box
            output.innerHTML += '<hr>' + oldText
        }
        // Call this to end the turn
        endTurn();
    }

    recover(opponent) {
        // Save the html already in the outputBox, then erase the outputBox
        let oldText = output.innerHTML;
        output.innerHTML = "";
        // Check to see if this player has enough SP to use the ability
        if (this.sp >= COST_RECOVER) {
            // Consume SP for using the ability
            this.sp -= COST_RECOVER;
            // Log action details to 'outputBox'
            output.innerHTML += `<span class="abilityColor">Recover!</span>(<span class="specialColor">${this.sp}</span> SP left)</span><br>`;
            // Calculate how much gets healed
            let recover = Math.ceil(Math.random() * this.tek * RECOVER_MULTI);
            // Announce to players how much is getting healed
            output.innerHTML += `${this.name} recovered <span class="recoverColor">${recover}</span> damage!<br>`;
            // Use a '-' to make koCheck apply negative damage
            koCheck(this, -recover)
            // Change graphic to recovery graphic
            updateGFX(this.charaName, 'spell')
        } else {
            // If there's not enough SP, do nothing
            output.innerHTML += `Not enough SP!<br>`;
        }
        // Other player will be idle, so change graphics
        updateGFX(opponent.charaName, 'idle')
        // Update the health bar, since we healed
        updateBar(this, 'HP', this.hp, START_HP);
        // Add old html from outputBox back in
        if (logging) {
            // Put the old html back into the output box
            output.innerHTML += '<hr>' + oldText
        }
        // Call this to end the turn
        endTurn();
    }
}

// This adds 'mutations' to the Fighter template
class Eddie extends Fighter {
    constructor(name, charaName) {
        super(name, charaName);
        // Set all of our defaults values for this new fighter here
        // Eddie does more damage but lacks in techniques
        this.atk = 7;
        this.def = 5;
        this.tek = 3;
    }
}

class Josh extends Fighter {
    constructor(name, charaName) {
        super(name, charaName);
        // Set all of our defaults values for this new fighter here
        // Same is well trained in technique, but isn't great at fighting
        this.atk = 3;
        this.def = 5;
        this.tek = 7;
    }
}

class Todd extends Fighter {
    constructor(name, charaName) {
        super(name, charaName);
        // Set all of our defaults values for this new fighter here
        // Todd is very cautious, making him better at defending
        this.atk = 4;
        this.def = 7;
        this.tek = 4;
    }
}

// This does damage (or healing), then reports if the target was knocked out or not
function koCheck(change_target, change_amount) {
    // Change the target's hp
    change_target.hp -= change_amount;
    // Check for and report a Knockout!
    // Send "true" back if the hp is now 0 or less, and "false" if it's not
    return (change_target.hp <= 0)
}

// Use this to pass the turn from one player to the other
function endTurn() {
    // "Flip" the turn counter by making it equal the inverse of what it is now
    playerTurn = !playerTurn
    // Give one sp back to the user whose turn it just became
    if (Player0.sp < 10)
        Player0.sp += !playerTurn
    if (Player1.sp < 10)
        Player1.sp += playerTurn
    updateBar(Player0, 'HP', Player0.hp, START_HP);
    updateBar(Player0, 'SP', Player0.sp, START_SP);
    updateBar(Player1, 'HP', Player1.hp, START_HP);
    updateBar(Player1, 'SP', Player1.sp, START_SP);
    // If either player is knocked out, take away player controls
    if (koCheck(Player0, 0) || koCheck(Player1, 0)) {
        hideControls()
    } else {
        showControls();
    }
}

function hideControls() {
    controls.innerHTML = "";
}

function showControls() {
    // Write three buttons for 'Single', 'Double', and 'Recover'. but the object names must be correct
    // We use tricky JS syntax tricks to insert the right player number into the html string
    controls.innerHTML = '<button class="inputs inputPlayer' + (playerTurn ? 1 : 0) + '" type="button" onclick="Player' + (playerTurn ? 1 : 0) + '.single(Player' + (!playerTurn ? 1 : 0) + ')">Single</button>';
    controls.innerHTML += '<button class="inputs inputPlayer' + (playerTurn ? 1 : 0) + '" type="button" onclick="Player' + (playerTurn ? 1 : 0) + '.double(Player' + (!playerTurn ? 1 : 0) + ')">Double [2 SP]</button>';
    controls.innerHTML += '<button class="inputs inputPlayer' + (playerTurn ? 1 : 0) + '" type="button" onclick="Player' + (playerTurn ? 1 : 0) + '.recover(Player' + (!playerTurn ? 1 : 0) + ')">Recover [3 SP]</button>';
}

function updateBar(player, bar, current, max) {
    let barFillPercent = (current / max) * 100
    if (current <= 0) {
        barFillPercent = 0;
    }
    if (current >= max) {
        barFillPercent = 100;
    }
    document.getElementById(player.charaName + bar + 'bar').innerHTML = `<div class="${bar}fill" style="width: ${barFillPercent}%;">${current}</div>`
}

function updateGFX(charaName, stance) {
    document.getElementById(charaName + 'IMG').src = "img/" + charaName + "_" + stance + ".png"
}

function startup() {
    // Go find the HTML elements that were just put on the page
    output = document.getElementById('outputBox');
    controls = document.getElementById('controlsBox');
    graphics = document.getElementById('graphicsBox');
    bars = document.getElementById('barsBox');
    // Create two new players
    Player0 = new Fighter(P0NAME, P0CHARA);
    Player1 = new Fighter(P1NAME, P1CHARA);
    // Create images
    graphics.innerHTML = '<img id="' + P0CHARA + 'IMG" class="fighterIMG" src="img/' + P0CHARA + '_idle.png" alt="' + P0NAME + '">';
    graphics.innerHTML += '<img id="' + P1CHARA + 'IMG" class="fighterIMG" src="img/' + P1CHARA + '_idle.png" alt="' + P1NAME + '">';
    // Create bars
    bars.innerHTML = '<div id="' + P0CHARA + 'HPbar" class="hpBar"></div>';
    bars.innerHTML += '<div id="' + P0CHARA + 'SPbar" class="spBar"></div>';
    bars.innerHTML += '<div id="' + P1CHARA + 'HPbar" class="hpBar"></div>';
    bars.innerHTML += '<div id="' + P1CHARA + 'SPbar" class="spBar"></div>';
    // Update the bars now that they are created
    updateBar(Player0, 'HP', Player0.hp, START_HP);
    updateBar(Player0, 'SP', Player0.sp, START_SP);
    updateBar(Player1, 'HP', Player1.hp, START_HP);
    updateBar(Player1, 'SP', Player1.sp, START_SP);
    // Give the players buttons so they can start
    showControls();
}
