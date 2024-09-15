"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Player = "Blue" | "Red"
type Cell = "S" | "O" | null
type Line = { start: [number, number], end: [number, number], player: Player }

const initialBoard: Cell[][] = Array(6).fill(null).map(() => Array(6).fill(null))

export function SosGame() {
  const [board, setBoard] = useState<Cell[][]>(initialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>("Blue")
  const [scores, setScores] = useState({ Blue: 0, Red: 0 })
  const [currentLetter, setCurrentLetter] = useState<"S" | "O">("S")
  const [gameOver, setGameOver] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [timer, setTimer] = useState(10)

  const checkSOS = (newBoard: Cell[][]): Line[] => {
    const newLines: Line[] = []

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        // Horizontal
        if (col <= 3 && newBoard[row][col] === "S" && newBoard[row][col+1] === "O" && newBoard[row][col+2] === "S") {
          newLines.push({ start: [row, col], end: [row, col+2], player: currentPlayer })
        }
        // Vertical
        if (row <= 3 && newBoard[row][col] === "S" && newBoard[row+1][col] === "O" && newBoard[row+2][col] === "S") {
          newLines.push({ start: [row, col], end: [row+2, col], player: currentPlayer })
        }
        // Diagonal top-left to bottom-right
        if (row <= 3 && col <= 3 && newBoard[row][col] === "S" && newBoard[row+1][col+1] === "O" && newBoard[row+2][col+2] === "S") {
          newLines.push({ start: [row, col], end: [row+2, col+2], player: currentPlayer })
        }
        // Diagonal bottom-left to top-right
        if (row >= 2 && col <= 3 && newBoard[row][col] === "S" && newBoard[row-1][col+1] === "O" && newBoard[row-2][col+2] === "S") {
          newLines.push({ start: [row, col], end: [row-2, col+2], player: currentPlayer })
        }
      }
    }
    return newLines
  }

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] !== null || gameOver) return

    const newBoard = board.map(r => [...r])
    newBoard[row][col] = currentLetter

    const newLines = checkSOS(newBoard)
    const newFormations = newLines.filter(line => !lines.some(existingLine => 
      existingLine.start[0] === line.start[0] && existingLine.start[1] === line.start[1] &&
      existingLine.end[0] === line.end[0] && existingLine.end[1] === line.end[1]
    ))

    setBoard(newBoard)
    setLines([...lines, ...newFormations])
    
    if (newFormations.length > 0) {
      setScores(prev => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + newFormations.length
      }))
      // Toggle current letter after getting a point
      setCurrentLetter(currentLetter === "S" ? "O" : "S")
    } else {
      setCurrentPlayer(currentPlayer === "Blue" ? "Red" : "Blue")
      setCurrentLetter(currentLetter === "S" ? "O" : "S")
      setTimer(10)
    }
  }

  const resetGame = () => {
    setBoard(initialBoard)
    setCurrentPlayer("Blue")
    setScores({ Blue: 0, Red: 0 })
    setCurrentLetter("S")
    setGameOver(false)
    setLines([])
    setTimer(10)
  }

  useEffect(() => {
    if (board.every(row => row.every(cell => cell !== null))) {
      setGameOver(true)
    }
  }, [board])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          setCurrentPlayer(currentPlayer === "Blue" ? "Red" : "Blue")
          setCurrentLetter(currentLetter === "S" ? "O" : "S")
          return 10
        }
        return prevTimer - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPlayer, currentLetter])

  return (
    <Card className="w-full max-w-md mx-auto mt-28 sm:mt-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center flex justify-between items-center">
          <span className="text-blue-500 mx-2">Blue: {scores.Blue}</span>
          <span>VS</span>
          <span className="text-red-500 mx-2">Red: {scores.Red}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="grid grid-cols-6 gap-1 mb-4">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className="ml-2 mt-0.5 h-12 w-12 text-xl font-bold relative z-10"
                  variant={cell ? "secondary" : "outline"}
                  aria-label={`Cell ${rowIndex * 6 + colIndex + 1}, ${cell || "empty"}`}
                >
                  {cell}
                </Button>
              ))
            )}
          </div>
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {lines.map((line, index) => {
              const startX = line.start[1] * 16.67 + 8.33
              const startY = line.start[0] * 16.67 + 8.33
              const endX = line.end[1] * 16.67 + 8.33
              const endY = line.end[0] * 16.67 + 8.33
              return (
                <line
                  key={index}
                  x1={`${startX}%`}
                  y1={`${startY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke={line.player === "Blue" ? "blue" : "red"}
                  strokeWidth="2"
                />
              )
            })}
          </svg>
        </div>
        {gameOver ? (
          <div className="text-center mt-4 text-xl font-bold" role="alert">
            Game Over! 
            {scores.Blue > scores.Red ? " Blue Player wins!" : scores.Red > scores.Blue ? " Red Player wins!" : " Its a tie!"}
          </div>
        ) : (
        <div className="flex justify-between mt-4">
          <div className="w-1/4 p-2 border border-neutral-200 rounded text-center text-sm dark:border-neutral-800">
            {currentPlayer === "Blue" ? timer : "ONLINE"}
          </div>
          <div className={`w-1/4 p-2 border rounded text-center font-bold text-xl ${currentPlayer === "Blue" ? "bg-green-200" : ""}`}>
            {currentPlayer === "Blue" ? currentLetter : ""}
          </div>
          <div className={`w-1/4 p-2 border rounded text-center font-bold text-xl ${currentPlayer === "Red" ? "bg-green-200" : ""}`}>
            {currentPlayer === "Red" ? currentLetter : ""}
          </div>
          <div className="w-1/4 p-2 border border-neutral-200 rounded text-center text-sm dark:border-neutral-800">
            {currentPlayer === "Red" ? timer : "ONLINE"}
          </div>
        </div>
        )}
        <Button onClick={resetGame} className="w-full mt-4">Reset Game</Button>
      </CardContent>
      <div className="text-center text-2xl font-bold text-blue-500 mt-4 mb-8">SOS GAME</div>
    </Card>
  )
}