import { useEffect, useState } from 'react'
import './App.css'
import confetti from 'canvas-confetti'

const x = '✖'
const o = '⬤'
// color: '#ff6961'
// color: '#84b6f4'

let turn = true // true: x

function bestMoveO (board, returnIndex = true) {
  const possibleMoves = []
  let bestMove = [-1, 1] // index, value

  for (let i = 0; i < 9; i++) {
    if (board[i] === '') { possibleMoves.push(i) }
  }

  if (possibleMoves.length === 0) {
    return checkWinner(board) === x ? 1 : checkWinner(board) === o ? -1 : 0
  }

  for (let i = 0; i < possibleMoves.length; i++) {
    const move = possibleMoves[i]

    board[move] = o

    if (checkWinner(board) === o) {
      board[move] = ''
      return returnIndex ? move : -1
    }

    const newValue = bestMoveX(board, false)
    if (newValue < bestMove[1]) {
      bestMove = [move, newValue]
    }

    board[move] = ''
  }

  return returnIndex ? bestMove[0] : bestMove[1]
}

function bestMoveX (board, returnIndex = true) {
  const possibleMoves = []
  let bestMove = [-1, -1] // index, value

  for (let i = 0; i < 9; i++) {
    if (board[i] === '') { possibleMoves.push(i) }
  }

  if (possibleMoves.length === 0) {
    return checkWinner(board) === x ? 1 : checkWinner(board) === o ? -1 : 0
  }

  for (let i = 0; i < possibleMoves.length; i++) {
    const move = possibleMoves[i]

    board[move] = x

    if (checkWinner(board) === x) {
      board[move] = ''
      return returnIndex ? move : 1
    }

    const newValue = bestMoveO(board, false)
    if (newValue > bestMove[1]) {
      bestMove = [move, newValue]
    }

    board[move] = ''
  }

  return returnIndex ? bestMove[0] : bestMove[1]
}

function checkWinner (board) {
  for (let i = 0; i < 3; i++) {
    if (board[i] === board[i + 3] && board[i + 3] === board[i + 6] && board[i] !== '') {
      return board[i]
    }
  }

  for (let i = 0; i < 9; i += 3) {
    if (board[i] === board[i + 1] && board[i + 1] === board[i + 2] && board[i] !== '') {
      return board[i]
    }
  }

  if (board[0] === board[4] && board[4] === board[8] && board[0] !== '') {
    return board[0]
  }

  if (board[2] === board[4] && board[4] === board[6] && board[2] !== '') {
    return board[2]
  }

  return ''
}

function App () {
  const [playWithAI, setPlayWithAI] = useState(false)
  const [board, setBoard] = useState(Array(9).fill(''))
  const [winnerStyle, setWinnerStyle] = useState(null)
  let [winner, setWinner] = useState('')
  const [playAgainStyle, setPlayAgainStyle] = useState({ transform: 'translateY(100px)' })

  function playAgain () {
    setWinnerStyle(null)
    setPlayAgainStyle({ transform: 'translateY(100px)' })
    turn = true
    setBoard(Array(9).fill(''))
    setTimeout(() => {
      setWinner('')
    }, 500)
  }

  function setCharacter (index, extraIndex = -1) {
    if (board[index] !== '' || (extraIndex === -1 && playWithAI && !turn)) return

    const newBoard = [...board]

    if (extraIndex !== -1) {
      newBoard[extraIndex] = o
      newBoard[index] = x
    } else if (turn) {
      newBoard[index] = x
    } else {
      newBoard[index] = o
    }

    setBoard(prevBoard => newBoard)

    winner = checkWinner(newBoard)
    if (winner !== '' || !newBoard.some((e) => e === '')) {
      setWinner(winner)
      setWinnerStyle({
        opacity: '1',
        zIndex: '100',
        backgroundColor:
          (winner === ''
            ? 'rgba(0, 0, 0, .5)'
            : (winner === x
                ? 'rgba(255, 105, 97, .1)'
                : 'rgba(132, 182, 244, .1)'))
      })
      setPlayAgainStyle({ transform: 'translateY(0)' })
    } else {
      turn = !turn
    }
  }

  function handleClick (index) {
    setCharacter(index)
    if (playWithAI && !turn) {
      const newBoard = [...board]
      newBoard[index] = x
      setTimeout(() => {
        const a = bestMoveO(newBoard)
        console.log('a: ', a)
        setCharacter(index, a)
      }, 500)
    }
  }

  return (
    <div className='container'>
      <h1 className='reddit-mono'>Tic-tac-toe</h1>
      <div className='grid-container'>
        {
          board.map((character, index) => (
            <Tile
              key={index}
              character={character}
              setCharacter={() => handleClick(index)}
              AITurn={playWithAI && !turn}
            />
          ))
        }
      </div>
      <Turn />
      <Winner winner={winner} style={winnerStyle} />

      <div className='btn-div top'>
        <button className='btn' onClick={() => { playAgain(); setPlayWithAI(!playWithAI) }}> {playWithAI ? 'Play with a friend' : 'Play with AI'} </button>
      </div>

      <div className='btn-div bot' style={playAgainStyle}>
        <button className='btn' onClick={playAgain}>Play Again</button>
      </div>
    </div>
  )
}

function Tile ({ character, setCharacter, AITurn }) {
  let style = {}
  let tileStyle = {}
  let className = ''

  if (character === '' && !AITurn) {
    className = turn ? 'hover-x' : 'hover-o'
    tileStyle = { cursor: 'pointer' }
  } else {
    style = { color: character === x ? '#ff6961' : '#84b6f4' }
  }

  return (
    <div className={'tile ' + className} onClick={setCharacter} style={tileStyle}>
      <span style={style}>
        {character}
      </span>
    </div>
  )
}

function Turn () {
  return (
    <div className='turn'>
      <div className={turn ? 'selected-x' : undefined}>{x}</div>
      <div className={!turn ? 'selected-o' : undefined}>{o}</div>
    </div>
  )
}

function Winner ({ winner, style }) {
  let content
  let braceStyle = {}
  let modalStyle = {}
  const popupStyle = style

  useEffect(() => {
    if (winner !== '') { confetti() }
  }, [winner])

  if (winner === '') {
    content = (
      <>
        <span style={{ fontSize: '2.5em' }}>Draw</span>
      </>
    )
    braceStyle = { backgroundColor: '#686868' }
    modalStyle = { height: '100px' }
  } else {
    content = (
      <>
        <span style={{ fontSize: '2.5em' }}>Winner</span>
        <span style={{ fontSize: '3em', color: (winner === x ? '#ff6961' : '#84b6f4') }}>{(winner === x ? x : o)}</span>
      </>
    )
  }

  return (
    <div className='popup' style={popupStyle}>
      <div className='brace' style={braceStyle} />
      <div className='modal' style={modalStyle}>
        {content}
      </div>
      <div className='brace' style={braceStyle} />
    </div>
  )
}

export default App
