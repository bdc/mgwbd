import './Grid.scss';
import GamePieceHelper from 'games/GamePieceHelper';
import React, {forwardRef, useCallback, useEffect, useLayoutEffect, useState} from 'react';


/**
 * props:
 *   className
 *   lineClassName
 *   grid
 *   children
 *   squareStyle: function(squareData) => string
 *   renderSquareValue: function(squareData) => <div />
 *   renderSquareOverlay: function(squareData) => <div />
 *   onTouch: function(squareData, rowIndex, colIndex)
 *   isHighlighted: function(squareData, rowIndex, colIndex)
 *   isTouchable: function(squareData, rowIndex, colIndex)
 *   hashMaterial: array
 */
const Grid = forwardRef((props, ref) => {
  const [isClick, setIsClick] = useState(true);
  const [gridWidthPct, setGridWidthPct] = useState(100);
  const [gridRef, setGridRef] = useState(ref);

  useEffect(() => {
    if (!gridRef) {
      setGridRef(React.createRef());
    }
  }, [gridRef]);

  const onWrapperRefChange = useCallback(node => {
    //const calcGridWidthPct = () => {
    //  console.log('calcGridWidthPct');
    //};
    //const resizeObserver = new ResizeObserver(calcGridWidthPct);
    //node && resizeObserver.observe(node);
  }, []);

  const renderSquare = (squareData, i, j) => {
    let squareStyle = props.squareStyle && props.squareStyle(squareData);
    let value = squareData && squareData.value;
    let renderedValue = props.renderSquareValue ?
        props.renderSquareValue(squareData, i, j) : value;
    let renderedOverlay =
        props.renderSquareOverlay &&
        props.renderSquareOverlay(squareData, i, j);
    let highlight = <div className='highlight' />;
    let touchTarget = (
        <div
            className={`touchTarget ${isClick ? 'clickable ' : ''}`}
            onTouchStart={() => setIsClick(false)}
            onClick={() => props.onTouch(squareData, i, j)} />
    );
    return (
      <div className={`square ${squareStyle}`} key={`row${i}col${j}`}>
        {props.isHighlighted && props.isHighlighted(squareData, i, j) ?
            highlight : null}
        <div className='value'>{renderedValue}</div>
        <div className='overlay'>{renderedOverlay}</div>
        {props.isTouchable && props.isTouchable(squareData, i, j) ?
            touchTarget : null}
      </div>
    );
  };

  const renderRow = (rowData, i) => {
    return (
      <div className='row' key={`row${i}`}>
        {rowData.map((row, j) => renderSquare(row, i, j))}
      </div>
    );
  };

  const getLineStyle = lineData => {
    let url = GamePieceHelper.getBoardPiece(
        `line${lineData[0]}`, [props.hashMaterial, lineData]);
    return { backgroundImage: `url(${url})` };
  };

  const renderUnderlay = () => {
    let numRows = props.grid.length;
    let numCols = props.grid[0].length;
    let lineClassName = `line ${props.lineClassName}`;
    return (
      <div className='underlay'>
        <div className='gridLines horizontal'>
          {new Array(numRows + 1).fill().map((_, i) =>
              <div
                  key={i} className={lineClassName}
                  style={getLineStyle(['h', i])} />)}
        </div>
        <div className='gridLines vertical'>
          {new Array(numCols + 1).fill().map((_, i) =>
              <div
                  key={i} className={lineClassName}
                  style={getLineStyle(['v', i])} />)}
        </div>
      </div>
    );
  };

  // TODO this css & resizing logic should be updated, but quick fix to unbreak prod for now.
  return (
    <div
        className={`GridWrapper`}
        ref={onWrapperRefChange}
        style={{height: '100%', width: '100%'}}>
      <div
          className={`Grid ${props.className}`} ref={gridRef}
          style={{width: `${gridWidthPct}%`}}>
        {renderUnderlay()}
        <div className='rows'>
          {props.grid.map(renderRow)}
        </div>
        {props.children}
      </div>
    </div>
  );
});


export default Grid;

