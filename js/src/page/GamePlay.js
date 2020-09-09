import './GamePlay.scss';
import { Button } from 'primereact/button';
import GameInstructionsDialog from 'components/game/GameInstructionsDialog';
import GameManager from 'games/GameManager';
import GamePhase from 'games/GamePhase';
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

  onStartGame() {
    this.gameManager.startGame();
  }

  onEndGame() {
    this.gameManager.setGamePhase(GamePhase.POST_GAME, 'Game aborted!');
  };

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

  onModifyPlayers() {
    console.log('oh, so you want to change things up do ya?');
  }

  renderInstructions() {
    return (
      <GameInstructionsDialog
          open={true}
          content={this.gameManager.getGame().renderInstructions()} />
    );
  }

  renderSettings() {
    let settingsConfig = this.gameManager.getGameSettingsConfig();
    if (this.state.gameSettings) {
      return (
        <GameSettingsDialog
            settingsConfig={settingsConfig}
            settings={this.state.gameSettings}
            readOnly={this.state.gamePhase === GamePhase.PLAYING}
            onSettingsChange={
              settings => this.gameManager.setGameSettings(settings)
            } />
      );
    }
    return null;
  }

  renderGameCanvas() {
    return this.gameManager.getGame().renderCanvas(
        this.state.gameState,
        this.state.gameSettings,
        this.gameManager.getPlayerManager());
  }

  renderGameMenuButtons() {
    let startGameButton =
        <Button label='Start Game' onClick={this.onStartGame.bind(this)} />;
    let quitGameButton =
        <Button label='Quit Game' onClick={this.onEndGame.bind(this)} />;
    let modifyPlayersButton =
        <Button
            label='Modify Players'
            className='p-button-outlined'
            onClick={this.onModifyPlayers.bind(this)} />;
    if (this.state.gamePhase === GamePhase.PRE_GAME) {
      return (
        <div>
          {startGameButton}
        </div>
      );
    }
    if (this.state.gamePhase === GamePhase.PLAYING) {
      return (
        <div>
          {quitGameButton}
        </div>
      );
    }
    if (this.state.gamePhase === GamePhase.POST_GAME) {
      return (
        <div>
          {startGameButton}
        </div>
      );
    }
    return null;
  }

  renderLoading() {
    return (
    <div className='section'>
      <LabelValue
          className='gameMenu'
          label={this.renderGameMenuButtons()}
          labelClassName='gameMenuButtons'
          value={
            <div>
              {this.renderInstructions()}
              {this.renderSettings()}
            </div>
          }
          styles={LabelValue.Style.LEFT_RIGHT} />
      Loading...
    </div>
    );
  }

  renderLoaded() {
    return (
      <div className='section'>
        <LabelValue
            className='gameMenu'
            label={this.renderGameMenuButtons()}
            labelClassName='gameMenuButtons'
            value={
              <div>
                {this.renderInstructions()}
                {this.renderSettings()}
              </div>
            }
            styles={LabelValue.Style.LEFT_RIGHT} />
        <div className='gameCanvas'>
          {this.state.gamePhase ? this.renderGameCanvas() : 'loading...'}
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

  render() {
    return (
      <div className='GamePlay page'>
        <div className='section subtitle'>
          {this.gameManager.getGame().getDisplayName()}
        </div>
        {this.state.gameState ? this.renderLoaded() : this.renderLoading()}
      </div>
    );
  }
}


export default GamePlay;
