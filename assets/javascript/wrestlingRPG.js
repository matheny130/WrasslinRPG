// Execute this code when the DOM has fully loaded
$(document).ready(function () {
  // VARIABLE DECLARATION

  // Creating an object to hold our characters

  var characters = {
    "The Rock": {
      name: "The Rock",
      health: 125,
      attack: 6,
      imageUrl: "assets/images/therock.jpg",
      enemyAttackBack: 8
    },
    "Stone Cold Steve Austin": {
      name: "Stone Cold Steve Austin",
      health: 100,
      attack: 10,
      imageUrl: "assets/images/stonecold.jpg",
      enemyAttackBack: 12
    },
    "The Undertaker": {
      name: "The Undertaker",
      health: 150,
      attack: 10,
      imageUrl: "assets/images/undertaker.jpg",
      enemyAttackBack: 20
    },
    "Mankind": {
      name: "Mankind",
      health: 175,
      attack: 5,
      imageUrl: "assets/images/mankind.jpg",
      enemyAttackBack: 25
    }
  };

  // Will be populated when user selects a character
  var attacker;
  // Populated with all the characters the player didn't select
  var wrestlers = [];
  // Will be populated when the player chooses an opponent
  var opponent;
  // Will keep track of turns during combat. Used for calculating damage
  var turnCounter = 1;
  // Tracks number of defeated opponents
  var pinCount = 0;

  //FUNCTIONS

  // This function will render a character card to the page
  // The character rendered, the area they are rendered to, and their status is determined by the arguments passed in
  var renderCharacter = function (character, renderArea) {
    //This block of code builds the chatacter card and renders it to the page
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);
  };

  // this function will load all the characters into the character section to be selected
  var initializeGame = function () {
    // Loop through the characters object and call the render Character function on each character to render their card
    for (var key in characters) {
      renderCharacter(characters[key], "#characters-section");
    }
  };

  // remember to run the function here
  initializeGame();

  // This function handles updating the selected player or the current opponent. If there is no selected player/opponent this function will also place the character based on the areaRender chosen (e.g. #selected-character or opponent)
  var updateCharacter = function (charObj, areaRender) {
    //First we empty the area so that we can re-render the new object
    $(areaRender).empty();
    renderCharacter(charObj, areaRender);
  };

  //This function will render the available-to-attack opponents. This should be run once after a character has been selected
  var renderOpponents = function (oppArr) {
    for (var i = 0; i < oppArr.length; i++) {
      renderCharacter(oppArr[i], "#available-to-attack-section");
    }
  };

  //Function to handle rendering game messages.
  var renderMessage = function (message) {
    // Buildins the message and appends it to the page.
    var gameMessageSet = $("#game-message");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);
  };

  //function to restart the game after win or loss
  var restartGame = function (resultMessage) {
    //When the restart button is clicked, reload the page.
    var restart = $("<button id='restart'>Restart</button>").click(function () {
      location.reload();
    });

    //Build div that will display the win/loss message
    var gameState = $("<div>").text(resultMessage);

    //Render the restart button and win/loss message to the page
    $("#game-message").append(gameState);
    $("#game-message").append(restart);
  };

  // Function to clear the game message section
  var clearMessage = function () {
    var gameMessage = $("#game-message");
    gameMessage.text("");
  };

  // =====================================================================

  // On click event for selecting character
  $("#characters-section").on("click", ".character", function () {
    // Saving the clicked character's name
    var name = $(this).attr("data-name");

    // If a player character has not been chosen
    if (!attacker) {
      // Populate attacker with selected character info
      attacker = characters[name];
      // Loop through remaining characters and push them to the wrestlers array
      for (var key in characters) {
        if (key !== name) {
          wrestlers.push(characters[key]);
        }
      }

      //Hide character select div
      $("#characters-section").hide();

      // Render our selected character and our combatants
      updateCharacter(attacker, "#selected-character");
      renderOpponents(wrestlers);
    }
  });

  // Creates on click event for each opponent
  $("#available-to-attack-section").on("click", ".character", function () {
    // Saving opponent name
    var name = $(this).attr("data-name");

    // If there is no opponent the clicked wrestler will become the opponent
    if ($("#opponent").children().length === 0) {
      opponent = characters[name];
      updateCharacter(opponent, "#opponent");

      // remove element as it will now be a new opponent
      $(this).remove();
      clearMessage();
    }
  });

  // When you click the attack button
  $("#attack-button").on("click", function () {
    // If here is an opponent combat will occur
    if ($("#opponent").children().length !== 0) {
      // Creates messages for our attack and opponent counter attack
      var attackMessage = "You attacked " + opponent.name + " for " + attacker.attack * turnCounter + " damage.";
      var counterAttackMessage = opponent.name + " attacked you back for " + opponent.enemyAttackBack + " damage.";
      clearMessage();

      // Reduce opponent's health by your attack value
      opponent.health -= attacker.attack * turnCounter;

      // If the opponent still has health
      if (opponent.health > 0) {
        // Render the opponent's updated character card
        updateCharacter(opponent, "#opponent");

        // Render the combat messages
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        //Reduce your health by the opponent's attack value
        attacker.health -= opponent.enemyAttackBack;

        // Render the player's updates character card
        updateCharacter(attacker, "#selected-character");

        // Less than zero health game ends
        // Call restartGame function to allow the user to restart
        if (attacker.health <= 0) {
          clearMessage();
          restartGame("You have been defeated....GAME OVER!!!");
          $("#attack-button").off("click");
        }
      }
      else {
        // If the opponent has less than zero health they are defeated
        // Remove your opponent's character card
        $("#opponent").empty();

        var gameStateMessage = "You have defeated " + opponent.name + ", you can choose to fight another opponent."
        renderMessage(gameStateMessage);

        // Increment your pin count
        pinCount++;

        // If you have pinned all of your opponents you win
        // Call the restartGame function to allow the user to restart the game and play again
        if (pinCount >= wrestlers.length) {
          clearMessage();
          $("#attack-button").off("click");
          restartGame("You Won!!! GAME OVER!!!");
        }
      }
      // Increment turn counter. This is used to determine how much damage the character does
      turnCounter++;
    }
    else {
      // If there is no opponent render and error message
      clearMessage();
      renderMessage("No opponent here.")
    }
  });
});