import React from 'react';


class Game {
  getCanonicalName() {
  }

  getDisplayName() {
  }

  getDefaultPlayerNames() {
    return [ 'Player 1', 'Player 2', ];
  }

  getInstructionCards() {
    return [];
  }

  renderInstructions() {
    return (
      <div>Instructions</div>
    );
  }

  getBlankGameState() {
    return {};
  }

  getSettingsConfig() {
    return [];
  }

  onChooseMove(move) {
    if (this.moveHandler) {
      this.moveHandler(move);
    }
  }

  setMoveHandler(fn) {
    this.moveHandler = fn;
  }

  renderCanvas(gameState, gameSettings, gamePhase, canMove) {
    return null;
  }
}


export default Game;
