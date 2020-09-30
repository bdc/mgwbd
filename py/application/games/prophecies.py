import copy
from .game import Game

"""
Example game state:

Example actions:
"""

class Prophecies(Game):

  def getInitialGameState(self, gameSettings=None):
    numRows = gameSettings['numRows']
    numCols = gameSettings['numCols']
    if numRows > numCols: # swap the values
      numRows = numRows + numCols
      numCols = numRows - numCols
      numRows = numRows - numCols
    row = [None for i in range(numCols)]
    grid = [row for i in range(numRows)]
    return { 'grid': grid, 'activePlayer': None, }

  def getSettingsConfig(self):
    return [
      {
        'canonicalName': 'numRows',
        'displayName': 'Number of rows',
        'description': '',
        'values': [3, 4, 5, 6],
        'defaultValue': 4,
      },
      {
        'canonicalName': 'numCols',
        'displayName': 'Number of columns',
        'description': '',
        'values': [3, 4, 5, 6],
        'defaultValue': 5,
      },
    ]

  def isValidValue(self, grid, row, col, value):
    for i in range(len(grid)):
      if grid[i][col] and grid[i][col]['value'] == value:
        return False
    for j in range(len(grid[0])):
      if grid[row][j] and grid[row][j]['value'] == value:
        return False
    return True

  def fillAutoXs(self, grid):
    maxValue = max(len(grid), len(grid[0]))
    autoXs = []
    for row in range(len(grid)):
      for col in range(len(grid[0])):
        if grid[row][col]:
          continue
        validMove = False
        for value in range(1, maxValue + 1):
          if self.isValidValue(grid, row, col, value):
            validMove = True
        if not validMove:
          grid[row][col] = {'owner': None, 'value': 0}
          autoXs.append({'row': row, 'col': col})
    return autoXs

  def action(self, gameState, action, gamePhase=None, gameSettings=None):
    grid = gameState['grid']
    playerNumber = action['owner']
    row = action['row']
    col = action['col']
    value = action['value']
    if not gameState['activePlayer']:
      return gameState
    if playerNumber != gameState['activePlayer'] or grid[row][col] is not None:
      return gameState
    if not self.isValidValue(grid, row, col, value):
      return gameState

    newGameState = copy.deepcopy(gameState)
    newGameState['grid'][row][col] = {'owner': playerNumber, 'value': value}
    autoXs = self.fillAutoXs(newGameState['grid'])
    newGameState['lastMove'] = [{'row': row, 'col': col}] + autoXs
    self.checkGameEndCondition(newGameState)
    self.nextPlayerTurn(newGameState)
    return newGameState

  def gameEndCondition(self, gameState):
    grid = gameState['grid']
    for row in range(len(grid)):
      for col in range(len(grid[0])):
        if not grid[row][col]:
          return False
    return {'tie': True}

