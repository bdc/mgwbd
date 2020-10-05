import './DandelionsCanvas.scss';
import GamePieceHelper from 'games/GamePieceHelper';
import PlayerHelper from 'players/PlayerHelper';
import React from 'react';
import dandelionsCompass from './images/dandelions-compass.png';
import { SquareStates, AllDirections } from './Constants.js';


const Move = Object.freeze({
  grid: (row, col) => ({grid: {row, col}}),
  compass: d => ({compass: d}),
});


/**
 * props:
 *   gameState: Object
 *   gameSettings: Object
 *   gamePhase: Object
 *   canMove: boolean, Whether this client may make a move now.
 */
class DandelionsCanvas extends React.Component {

  constructor() {
    super();
    this.state = {
      hover: {}, // { grid: { row: 1, col: 1} } or { compass: 'N' }
    };
  }

  onChooseMove(move) {
    this.props.onChooseMove(move);
  }

  getSquareImg(squareState, row, col) {
    let style = this.props.gameSettings.players[0].style;
    let type;
    switch (squareState) {
      case SquareStates.SEED:
        type = 'dot';
        break;
      case SquareStates.FLWR:
        type = 'asterisk';
        break;
      default:
        return;
    }
    return GamePieceHelper.getGamePiece(style, type, [row, col]);
  }

  getCompassImg(direction) {
    let style = this.props.gameSettings.players[1].style;
    return GamePieceHelper.getGamePiece(style, 'dot', direction);
  }

  renderGridSquare(data, rowIndex, colIndex) {
    let highlight = false;
    let isClickable =
        this.props.canMove &&
        this.props.gameState.activePlayerIndex === 0 &&
        data !== SquareStates.FLWR;
    if (this.props.gameState.lastMove &&
        this.props.gameState.lastMove.grid[rowIndex][colIndex] != null) {
      data = this.props.gameState.lastMove.grid[rowIndex][colIndex];
      highlight = true;
    }
    if (isClickable &&
        this.state.hover.grid &&
        this.state.hover.grid.row === rowIndex &&
        this.state.hover.grid.col === colIndex) {
      data = SquareStates.FLWR;
      highlight = true;
    }
    let url = this.getSquareImg(data, rowIndex, colIndex);
    let selection = {row: rowIndex, col: colIndex};
    let touchTarget = <div className='clickable'
        onMouseOver={() => this.setState({hover: {grid: selection}})}
        onMouseOut={() => this.setState({hover: {}})}
        onClick={() => 
            isClickable &&
            this.onChooseMove(Move.grid(rowIndex, colIndex))} />;

    return (
      <div className='square' key={`r${rowIndex}c${colIndex}`}>
        {highlight ? <div className='highlight' /> : null}
        <div className='image' style={{backgroundImage: `url(${url})`}} />
        {isClickable ? touchTarget : null}
      </div>
    );
  }

  renderGridRow(row, rowIndex) {
    return (
      <div className='row' key={rowIndex}>
        {row.map(
            (data, colIndex) =>
                this.renderGridSquare(data, rowIndex, colIndex))}
      </div>
    );
  }

  renderCompassPoint(keyPrefix, direction, isHighlighted) {
    let url = this.getCompassImg(direction);
    let point = <div className='compassPoint' style={{backgroundImage: `url(${url})`}} />;
    let highlight = <div className='compassPoint highlight' />;

    return (
      <div
          key={`${keyPrefix} ${direction}`}
          className={`directionHolderInner dir${direction} ${keyPrefix}`}>
        {isHighlighted ? highlight : point}
      </div>
    );
  }

  renderCompassTouchTarget(direction) {
    if (this.props.gameState.compass.directions.indexOf(direction) >= 0 ||
        this.props.gameState.activePlayerIndex !== 1 ||
        !this.props.canMove) {
      return null;
    }

    return (
      <div
          key={direction}
          className={`directionHolderInner dir${direction}`}>
        <div
            className='touchTarget'
            onMouseOver={() => this.setState({hover: {compass: direction}})}
            onMouseOut={() => this.setState({hover: {}})}
            onClick={() => this.onChooseMove(Move.compass(direction))} />
      </div>
    );
  }

  renderCompass(gameState) {
    let directions = gameState.compass.directions;
    let highlightLastTurn = null;
    let highlightHover = null;
    if (gameState.lastMove && gameState.lastMove.compass) {
      let compass = gameState.lastMove.compass;
      let direction = compass.directions.length && compass.directions[0];
      if (direction) {
        highlightLastTurn = this.renderCompassPoint('last', direction, true);
      }
    }
    if (this.state.hover.compass && this.props.canMove) {
      highlightHover = this.renderCompassPoint(
          'hover', this.state.hover.compass, true);
    }
    let windPlayerStyleClass =
        PlayerHelper.getStyleClass(this.props.gameSettings.players[1]);
    return (
      <div className={`compass ${windPlayerStyleClass}`}>
        <div className='compassOverlay'
            style={{backgroundImage: `url(${dandelionsCompass})`}} />
        <div className='compassOverlay directionHolder'>
          {directions.map(d => this.renderCompassPoint('used', d, false))}
        </div>
        <div className='compassOverlay directionHolder'>
          {highlightLastTurn}
          {highlightHover}
          {AllDirections.map(
              d => this.renderCompassTouchTarget(d))}
        </div>
      </div>
    )
  }

  /**
   * props:
   *   gameState: Object
   *   gameSettings: Object
   *   gamePhase: Enum
   *   canMove: boolean
   */
  render() {
    let dandelionPlayerStyleClass =
        PlayerHelper.getStyleClass(this.props.gameSettings.players[0]);
    return (
      <div className='DandelionsCanvas'>
        {this.renderCompass(this.props.gameState)}
        <div className={`grid ${dandelionPlayerStyleClass}`}>
          {this.props.gameState.grid.map(this.renderGridRow, this)}
        </div>
      </div>
    );
  }
}


export default DandelionsCanvas;
