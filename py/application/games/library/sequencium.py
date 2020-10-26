import copy
from application.games.game import Game


"""
  Example game state:
  {
    grid: [
      [Square, None, None, None, None, None],
      [None, Square, None, None, None, None],
      [None, None, Square, None, None, None],
      [None, None, None, Square, None, None],
      [None, None, None, None, Square, None],
      [None, None, None, None, None, Square],
    ],
    lastMove: {
      row: rowId,
      col: colId,
    },
    playerTurn: 1, // None, 1 or 2
    gameEnd: None,  # {win: 1}, {win: 2}, {draw: True}
  }
 
  typedef Square = {
    playerIndex: 0, // or 1
    value: 1, // 2, 3, 4, ...
    from: 'SW', // N, NE, E, SE, S, SW, W, NW, None
  }

  Example action:
  {
    playerIndex: 0,
    rowFrom: 1,
    colFrom: 1,
    rowTo: 2,
    colTo: 2,
  }
"""


_directionHelper = [ [None, 'W', 'E'], ['N', 'NW', 'NE'], ['S', 'SW', 'SE'], ]


class Sequencium(Game):

  @classmethod
  def getSettingsConfig(cls):
    return [
      {
        'canonicalName': 'doubleMoves',
        'displayName': 'Players move twice',
        'description': (
            'Starting with the second player’s first turn, each player '
            'moves twice per turn.'),
        'values': [True, False],
        'defaultValue': False,
      },
    ]

  @classmethod
  def getInitialGameState(cls, gameSettings=None):
    return {
      'grid': [
        [_sq(0, 1, None), None, None, None, None, None],
        [None, _sq(0, 2, 'NW'), None, None, None, None],
        [None, None, _sq(0, 3, 'NW'), None, None, None],
        [None, None, None, _sq(1, 3, 'SE'), None, None],
        [None, None, None, None, _sq(1, 2, 'SE'), None],
        [None, None, None, None, None, _sq(1, 1, None)],
      ],
      'lastMove': {}, # row: 3, col: 3,
      'activePlayerIndex': None,
    }
 
  def nextPlayerTurn(self):
    playerIndex = self.gameState['activePlayerIndex']
    if playerIndex is None:
      Game.nextPlayerTurn(self)
      return
    grid = self.gameState['grid']
    if not self.playerHasAvailableMove(1 - playerIndex, grid):
      return
    if not self.playerHasAvailableMove(playerIndex, grid):
      Game.nextPlayerTurn(self)
      return
    if not self.gameSettings or not self.gameSettings['doubleMoves']:
      Game.nextPlayerTurn(self)
      return
    numOccupiedSquares = 0
    for r in range(len(grid)):
      for c in range(len(grid[0])):
        numOccupiedSquares += 1 if grid[r][c] else 0
    if numOccupiedSquares % 2:
      Game.nextPlayerTurn(self)

  def gameEndCondition(self):
    grid = self.gameState['grid']
    scores = [0, 0]
    for r in range(len(grid)):
      for c in range(len(grid[0])):
        sq = grid[r][c]
        if sq is None:
          return None
        i = sq['playerIndex']
        scores[i] = max(scores[i], sq['value'])
    result = {'scores': scores}
    if scores[0] == scores[1]:
      result['draw'] = True
    else:
      result['win'] = 0 if scores[0] > scores[1] else 1
    return result

  def playerHasAvailableMove(self, playerIndex, grid):
    for r in range(len(grid)):
      for c in range(len(grid[0])):
        if grid[r][c]:
          continue
        for dr in range(-1, 2):
          for dc in range(-1, 2):
            if (r + dr < 0 or r + dr >= len(grid) or
                c + dc < 0 or c + dc >= len(grid[0])):
              continue
            if (grid[r + dr][c + dc] and
                grid[r + dr][c + dc]['playerIndex'] == playerIndex):
              return True
    return False

  def action(self, action):
    grid = self.gameState['grid']
    playerIndex = action['playerIndex']
    rowFrom = action['rowFrom']
    colFrom = action['colFrom']
    rowTo = action['rowTo']
    colTo = action['colTo']
    if self.gameState['activePlayerIndex'] is None:
      return False
    if (playerIndex != self.gameState['activePlayerIndex'] or
        rowFrom - rowTo < -1 or rowFrom - rowTo > 1 or
        colFrom - colTo < -1 or colFrom - colTo > 1 or
        grid[rowFrom][colFrom] is None or
        grid[rowFrom][colFrom]['playerIndex'] != playerIndex or
        grid[rowTo][colTo]):
      return False
    direction = _getDirection(rowFrom, colFrom, rowTo, colTo)
    value = grid[rowFrom][colFrom]['value'] + 1
    newGameState = copy.deepcopy(self.gameState)
    newGameState['grid'][rowTo][colTo] = {
        'playerIndex': playerIndex, 'value': value, 'from': direction}
    newGameState['lastMove'] = {'row': rowTo, 'col': colTo}
    self._gameState = newGameState
    self.checkGameEndCondition()
    self.nextPlayerTurn()
    return True


def _sq(playerIndex, value, direction):
	return {'playerIndex': playerIndex, 'value': value, 'from': direction}


def _getDirection(rowFrom, colFrom, rowTo, colTo):
  return _directionHelper[rowTo - rowFrom][colTo - colFrom]

