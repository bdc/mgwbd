import './GamePlay.scss';
import { Button } from 'primereact/button';
import GameInstructionsDialog from 'components/game/GameInstructionsDialog';
import GameManager from 'games/GameManager';
import GamePhase from 'games/GamePhase';
import GameSettingsDialog from 'components/game/GameSettingsDialog';
import GameStatusDisplay from 'components/game/GameStatusDisplay';
import LabelValue from 'components/chrome/LabelValue';
import PlayerArea from 'components/player/PlayerArea';
import PlayerSettingsDialog from 'components/player/PlayerSettingsDialog';
import React, { useState, useEffect } from 'react';
import VictoryAnimation from 'components/game/VictoryAnimation';
import { withRouter } from 'react-router';


const GamePlay = props => {
  const gameManager = new GameManager.Factory().create();
  const game = gameManager.getGame();
  const gameState = gameManager.getGameState();
  const gamePhase = gameManager.getGamePhase();
  const gameSettings = gameManager.getGameSettings();
  const gameSettingsConfig = gameManager.getGameSettingsConfig() || [];
  const [, forceUpdate] = useState({});

  useEffect(() => {
    gameManager.setChangeHandler(() => forceUpdate({}));
    let joinGameKey = props.location.state && props.location.state.join;
    if (!joinGameKey) {
      gameManager.setGame(props.game);
      gameManager.newGame();
    }
    return () => gameManager.setChangeHandler(() => null);
  }, [gameManager, props.game, props.location.state]);

  const onStartGame = () => gameManager.startGame();
  const onEndGame = () => gameManager.setGamePhase(GamePhase.POST_GAME);

  const renderInstructions = () =>
      <GameInstructionsDialog open={true} game={game} />;

  const renderPlayerSettings = () => {
    let filteredSettingsConfig = gameSettingsConfig
        .filter(i => i.canonicalName.startsWith('players:'));
    return (
      <PlayerSettingsDialog
          settings={gameSettings}
          settingsConfig={filteredSettingsConfig}
          readOnly={gamePhase === GamePhase.PLAYING}
          onSettingsChange={s => gameManager.setGameSettings(s)} />
    );
  };

  const renderGameSettings = gameManager => {
    if (Object.keys(gameSettingsConfig).length) {
      let gamePhase = gameManager.getGamePhase();
      let gameSettings = gameManager.getGameSettings();
      return (
        <GameSettingsDialog
            settingsConfig={gameSettingsConfig}
            settings={gameSettings}
            readOnly={gamePhase === GamePhase.PLAYING}
            onSettingsChange={s => gameManager.setGameSettings(s)} />
      );
    }
    return null;
  };

  const renderGameMenuButtons = () => {
    // TODO remove this button, it's just for experimentation
    let botButton = <Button label='Bot' onClick={() => {
      gameManager.pokeBot(gameState.activePlayerIndex);
    }} />;
    let startGameButton = <Button label='Start Game' onClick={onStartGame} />;
    let quitGameButton = <Button label='Quit Game' onClick={onEndGame} />;
    if (gamePhase === GamePhase.PRE_GAME) {
      return <div>{startGameButton}</div>;
    }
    if (gamePhase === GamePhase.PLAYING) {
      return <div>{quitGameButton}{botButton}</div>;
    }
    if (gamePhase === GamePhase.POST_GAME) {
      return <div>{startGameButton}</div>;
    }
    return null;
  };

  const renderGameMenu = () => 
      <LabelValue
          className='gameMenu'
          label={renderGameMenuButtons()}
          labelClassName='gameMenuButtons'
          value={
            <div>
              {renderPlayerSettings()}
              {game ? renderInstructions() : null}
              {game ? renderGameSettings(gameManager) : null}
            </div>
          }
          styles={LabelValue.Style.LEFT_RIGHT} />;

  const renderLoading = () => <div className='section'>{renderGameMenu()}</div>;

  const renderLoaded = () =>
      <div className='section'>
        {renderGameMenu()}
        <div className='gameArea'>
          <div className='gameCanvas'>
            {game.renderCanvas(
                gameState, gameSettings, gamePhase, gameManager.canMove())}
          </div>
          {gamePhase === GamePhase.POST_GAME ?
              <VictoryAnimation
                  gameEnd={gameState.gameEnd}
                  players={gameSettings.players} /> : null}
        </div>
        <GameStatusDisplay {...{gameState, gameSettings, gamePhase}} />
        <PlayerArea
            players={gameSettings && gameSettings.players}
            activePlayerIndex={
                gamePhase === GamePhase.PLAYING &&
                gameState.activePlayerIndex}
            gameEnd={gameState.gameEnd} />
      </div>;

  const render = () => {
    return (
      <div className='GamePlay page'>
        <div className='section subtitle'>
          {gameManager.isReady() ? game.getDisplayName() : 'Loading…'}
        </div>
        {gameManager.isReady() ? renderLoaded() : renderLoading()}
      </div>
    );
  };

  return render();
}


export default withRouter(GamePlay);
