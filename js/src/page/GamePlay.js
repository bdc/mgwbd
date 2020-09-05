import './GamePlay.scss';
import { Button } from 'primereact/button';
import GameInstructionsDialog from 'components/game/GameInstructionsDialog';
import GameManager from 'games/GameManager';
import GameSettingsDialog from 'components/game/GameSettingsDialog';
import LabelValue from 'components/chrome/LabelValue';
import PlayerArea from 'components/player/PlayerArea';
import React from 'react';


class GamePlay extends React.Component {

  constructor(props) {
    super();
    let game = new props.game();
    game.setMoveHandler(this.onMove.bind(this));
    this.gameManager = new GameManager.Factory().create();
    this.gameManager.setGame(game);
    this.gameManager.setGameStateChangeHandler(
        this.onGameStateChange.bind(this));
    this.gameManager.setGamePhaseChangeHandler(
        this.onGamePhaseChange.bind(this));
    this.gameManager.setGameSettingsChangeHandler(
        this.onGameSettingsChange.bind(this));
    this.gameManager.setMessageHandler(this.onGameMessage.bind(this));
    this.state = {
      gameState: this.gameManager.getGameState(),
      gameSettings: this.gameManager.getGameSettings(),
      gamePhase: this.gameManager.getGamePhase(),
      messages: [],
    };
  }

  onNewGame() {
    let playerNames = this.gameManager.getGame().getDefaultPlayerNames();
    let playerManager = this.gameManager.getPlayerManager();
    playerManager.resetPlayers();
    playerManager.createLocalHumanPlayer(playerNames[0]);
    playerManager.createLocalHumanPlayer(playerNames[1]);
    this.gameManager.startGame();
  }

  onMove(gameState, action) {
    this.gameManager.onAction(action);
  }

  onGameStateChange(gameState) {
    this.setState({gameState});
  }

  onGamePhaseChange(gamePhase) {
    this.setState({gamePhase});
  }

  onGameSettingsChange(gameSettings) {
    this.setState({gameSettings});
  }

  onGameMessage(msg) {
    this.setState({messages: this.state.messages.concat(msg)});
  }

  renderInstructions() {
    /* open={true} */
    return (
      <GameInstructionsDialog
          content={this.gameManager.getGame().renderInstructions()} />
    );
  }

  renderSettings() {
    return (
      <GameSettingsDialog
          settingsConfig={this.gameManager.getGame().getSettingsConfig()}
          settings={this.state.gameSettings}
          onSettingsChange={
            settings => this.gameManager.setGameSettings(settings)
          } />
    );
  }

  renderGameCanvas() {
    return this.gameManager.getGame().renderCanvas(
        this.state.gameState,
        this.state.gameSettings,
        this.gameManager.getPlayerManager());
  }

  render() {
    return (
      <div className='GamePlay page'>
        <div className='section subtitle'>
          {this.gameManager.getGame().getDisplayName()}
        </div>
        <div className='section'>
          <div className='gameMenu'>
            <LabelValue
                label={
                  <Button
                      label='New Game' onClick={this.onNewGame.bind(this)} />
                }
                value={
                  <div>
                    {this.renderInstructions()}
                    {this.renderSettings()}
                  </div>
                }
                styles={LabelValue.Style.LEFT_RIGHT} />
          </div>
          <div className='gameCanvas'>
            {this.renderGameCanvas()}
          </div>
        </div>
        <PlayerArea
            players={this.gameManager.getPlayerManager().getPlayers()}
            activePlayer={this.state.gameState.activePlayer} />
        <div className='section log'>
          {this.state.messages.map(
              (m, i) => <div key={i} className='message'>{m}</div>)}
        </div>
      </div>
    );
  }
}


export default GamePlay;
