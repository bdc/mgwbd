import GamePhase from './GamePhase';
import Http from 'components/http/Http';
import PlayerHelper from 'players/PlayerHelper';


class GameManager {
  constructor() {
    this.http = new Http.Factory().create();
    this.game = null;
    this.gameKey = null;
    this.gameState = null;
    this.gameSettings = null;
    this.gameSettingsConfig = null;
    this.gamePhase = GamePhase.PRE_GAME;
    this.pollIntervalId = setInterval(this.poll.bind(this), 1000);
  }

  poll() {
    // See if we need to poll.
    if (!this.gameSettings ||
        !this.gameSettings.players) {
      return;
    }
    let allLocal =
        this.gameSettings.players.reduce(
            (result, p) => PlayerHelper.isClaimedByMe(p) && result, true);
    if (allLocal) {
      return; // No need to poll.
    }
    this.http.get('/gameplay/poll')
        .query({ gameKey: this.gameKey, lastSeenMillis: this.lastSeenMillis, })
        .then(this.onActionResponse.bind(this), this.onError);
  }

  setGame(game) {
    this.game = game;
    this.game.setMoveHandler(this.onAction.bind(this));
    this.gameState = null;
    this.gamePhase = GamePhase.PRE_GAME;
    this.newGame();
  }

  setGameStateChangeHandler(fn) {
    this.gameStateChangeHandler = fn;
  }

  setGameState(gameState) {
    this.gameState = gameState;
    if (this.gameStateChangeHandler) {
      this.gameStateChangeHandler(this.gameState);
    }
  }

  setGamePhaseChangeHandler(fn) {
    this.gamePhaseChangeHandler = fn;
  }

  setGamePhase(gamePhase, msg) {
    this.gamePhase = gamePhase;
    if (this.gamePhaseChangeHandler) {
      this.gamePhaseChangeHandler(this.gamePhase);
    }
    if (msg) {
      this.sendMessage(msg);
    }
  }

  setGameSettingsChangeHandler(fn) {
    this.gameSettingsChangeHandler = fn;
  }

  setGameSettings(gameSettings, fromServer) {
    this.gameSettings = gameSettings;
    if (this.gameSettingsChangeHandler) {
      this.gameSettingsChangeHandler(this.gameSettings);
    }
    if (!fromServer) {
      this.onGameSettings(this.gameSettings);
    }
  }

  setMessageHandler(fn) {
    this.messageHandler = fn;
  }

  sendMessage(msg) {
    if (this.messageHandler) {
      this.messageHandler(msg);
    }
  }

  getGame() {
    return this.game;
  }

  getGameState() {
    return this.gameState;
  }

  getGameSettingsConfig() {
    return this.gameSettingsConfig;
  }

  getGameSettings() {
    return this.gameSettings;
  }

  getGamePhase() {
    return this.gamePhase;
  }

  getJoinLink() {
    // TODO may want to move this to a helper/util/manager class.
    return `${document.location.origin}/join/${this.gameKey}`;
  }

  newGame() {
    this.http.post('/gameplay/new')
        .send({
          hostDomain: document.location.hostname,
          gameType: this.game.getCanonicalName(),
        })
        .then(this.onNewGameResponse.bind(this), this.onError);
  }

  startGame() {
    this.http.post('/gameplay/start')
        .send({
          gameKey: this.gameKey,
          gameSettings: this.gameSettings,
        })
        .then(this.onStartGameResponse.bind(this), this.onError);
  }

  onNewGameResponse(rsp) {
    if (rsp.body && rsp.body.gameSettings) {
      let players = rsp.body.gameSettings.players || [];
      players.forEach(PlayerHelper.claimPlayer);
    }
    this.onActionResponse(rsp);
    this.gameKey = rsp.body.gameKey;
    this.setGamePhase(GamePhase.PRE_GAME);
  }

  onStartGameResponse(rsp) {
    this.onActionResponse(rsp);
    this.setGamePhase(GamePhase.PLAYING);
    let firstPlayerName = this.gameSettings.players[0].name;
    this.sendMessage(`Here we go! ${firstPlayerName} moves first.`);
  }

  onGameSettings(gameSettings) {
    this.http.post('/gameplay/setsettings')
        .send({
            gameKey: this.gameKey,
            gameSettings,
        })
        .then(this.onActionResponse.bind(this), this.onError);
  }

  onAction(action) {
    if (this.gamePhase !== GamePhase.PLAYING) {
      return;
    }
    this.http.post('/gameplay/action')
        .send({
            gameKey: this.gameKey,
            clientCode: PlayerHelper.clientCode,  // TODO verify this server-side
            action,
        })
        .then(this.onActionResponse.bind(this), this.onError);
  }

  onActionResponse(rsp) {
    if (!rsp || !rsp.body) {
      return;
    }
    if (rsp.body.gameState) {
      let gameState = rsp.body.gameState;
      this.setGameState(gameState);
      if (gameState.gameEnd) {
        this.setGamePhase(GamePhase.POST_GAME);
        if (gameState.gameEnd.tie) {
          this.sendMessage("Incredible, it's a tie! How about another?");
          return;
        }
        let winningPlayerName =
            this.gameSettings.players[gameState.gameEnd.win - 1].name;
        this.sendMessage(
            `Wow! ${winningPlayerName} is the winner! How about another?`);
      }
    }
    if (rsp.body.gameSettingsConfig) {
      this.gameSettingsConfig = rsp.body.gameSettingsConfig;
    }
    if (rsp.body.gameSettings) {
      this.setGameSettings(rsp.body.gameSettings, true);
    }
    if (rsp.body.lastSeenMillis) {
      this.lastSeenMillis = rsp.body.lastSeenMillis;
    }
  }

  onError(error) {
    console.log(error);
  }
}


GameManager.Factory = class {
  create() {
    return _instance;
  }
}


const _instance = new GameManager();


export default GameManager;
