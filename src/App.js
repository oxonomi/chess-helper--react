import React, { useState, useEffect } from "react";
import './App.css';

import king from '../src/img/king.svg'
import queen from '../src/img/queen.svg'
import rook from '../src/img/rook.svg'
import bishop from '../src/img/bishop.svg'
import knight from '../src/img/knight.svg'
import pawn from '../src/img/pawn.svg'
import refresh from '../src/img/refresh.svg'

let BoardPosition = "Initial";

const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];


const Magnus = [
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "p", ""],
  ["", "b", "q", "", "", "p", "", "p"],
  ["", "", "p", "", "p", "P", "", "P"],
  ["", "", "P", "", "", "", "P", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "Q", "P", "", ""],
  ["", "", "B", "", "", "", "", ""],
];

const Shirov = [
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "q", "p", "p", ""],
  ["", "", "", "p", "", "b", "", ""],
  ["p", "", "", "", "", "", "", "P"],
  ["", "", "B", "", "", "", "", ""],
  ["", "", "", "", "", "", "P", ""],
  ["", "", "", "", "", "", "Q", ""],
];

const Geller = [
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "p"],
  ["", "", "", "", "", "q", "p", ""],
  ["", "", "", "", "p", "", "", ""],
  ["p", "", "", "", "r", "P", "R", "P"],
  ["", "", "", "Q", "", "", "P", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
];

const Kholmov = [
  ["r", "", "b", "", "", "r", "", "k"],
  ["", "", "", "", "q", "p", "", "p"],
  ["p", "", "", "p", "p", "b", "", "Q"],
  ["", "", "", "", "n", "P", "", ""],
  ["", "p", "", "N", "P", "", "", ""],
  ["", "", "N", "", "", "", "", ""],
  ["P", "P", "P", "", "", "", "", "P"],
  ["", "", "Q", "R", "", "B", "R", ""],
];


  const Square = ({ children, dark, isSelected, isDefended, isAttacked, defendCount, attackCount, onClick }) => {

    const piece = children.props.piece;

    //checkerboard
    let className = dark ? "square dark" : "square light";
    //selected
    if (isSelected) className += " selected";

    //Defend and Attack counts
    // style dots lighter if square is empty
    let defendClassName = piece ? "defendCount" : "defendCount--empty";
    let attackClassName = piece ? "attackCount" : "attackCount--empty";

    //create a div (dot) for each defend and attack count
    const defendTally = [];
    for (let i = 0; i < defendCount; i++) {
      defendTally.push(<div key={i} className={defendClassName}></div>);
    }
    const attackTally = [];
    for (let i = 0; i < attackCount; i++) {
      attackTally.push(<div key={i} className={attackClassName}></div>);
    }

    //Capture styling
    className += (defendCount !== 0 && attackCount === 0 && piece !=='' && piece === piece.toLowerCase()) ? " defend-capture--safe" : "";
    className += (defendCount !== 0 && attackCount !==0 && piece !=='' && piece === piece.toLowerCase()) ? " defend-capture" : "";
    className += (attackCount !== 0 && piece !=='' && piece === piece.toUpperCase()) ? " attack-capture" : "";


  return (
    <div
      className={className}
      onClick={onClick}
    >
        <div className="attackCountContainer ">
          {attackTally}
        </div>
        {children}
        <div className="defendCountContainer">
          {defendTally}
        </div>
    </div>
  )
};


// Piece        ______________________________________________
const Piece = ({ piece }) => {
  const pieceMap = {
    k: king,
    q: queen,
    r: rook,
    b: bishop,
    n: knight,
    p: pawn,
    K: king,
    Q: queen,
    R: rook,
    B: bishop,
    N: knight,
    P: pawn,
  };

  // const color = piece.toLowerCase() === piece ? "black" : "white";
  const isWhite = piece.toLowerCase() === piece ? false : true;
  const pieceChar = pieceMap[piece] || "";


  return (
    <div>
      {pieceChar ? (
        <img
            className={isWhite ? "piece white" : "piece"}
            src={pieceChar}
            alt={piece}
        >
        </img>
      ) : (
        <div></div>
      )}
    </div>
  );
};


// Chessboard      ______________________________________________
const Chessboard = ({ board, selectedSquare, defendedSquares, attackedSquares, defendCount, attackCount, onSquareClick }) => {
  const squares = [];

for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    const dark = (i + j) % 2 === 1;
    const piece = board[i][j];
    const isSelected = selectedSquare && selectedSquare[0] === i && selectedSquare[1] === j;
    const isDefended = defendedSquares.some(([x, y]) => x === i && y === j);
    const isAttacked = attackedSquares.some(([x, y]) => x === i && y === j);
    squares.push(
      <Square
        key={`${i}-${j}`}
        dark={dark}
        isSelected={isSelected}
        isDefended={isDefended}
        isAttacked={isAttacked}
        defendCount={defendCount[i][j]}
        attackCount={attackCount[i][j]}
        onClick={() => onSquareClick(i, j)}
      >
        <Piece piece={piece} />
      </Square>
    );
  }
}


return <div className="board">{squares}</div>;
};


function App() {

  const [board, setBoard] = useState(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [defendedSquares, setDefendedSquares] = useState([]);
  const [attackedSquares, setAttackedSquares] = useState([]);

  // // Initialize the state for counts
  let [defendCount, setDefendCount] = useState(Array(8).fill().map(() => Array(8).fill(0)));
  let [attackCount, setAttackCount] = useState(Array(8).fill().map(() => Array(8).fill(0)));

  useEffect(() => {
    const [initialDefendedSquares, initialAttackedSquares, initialDefendCount, initialAttackCount] = calculateTargetSquares(initialBoard);
    setDefendCount(initialDefendCount);
    setAttackCount(initialAttackCount);
    setDefendedSquares(initialDefendedSquares);
    setAttackedSquares(initialAttackedSquares);
  }, []);


    const calculateTargetSquares = (board) => {

        const knightMoves = [
            [-1, 2], [1, 2], [-2, 1], [2, 1], [-2, -1], [2, -1], [-1, -2], [1, -2]
        ];
        const bishopMoves = [
            [-1, -1], [1, 1], [-1, 1], [1, -1]
        ];
        const rookMoves = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const kingMoves = [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];
        let defendedSquares = [];
        let attackedSquares = [];

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

              const piece = board[i][j];
              if (piece === "") {
                  continue;
              }

              const isWhite = piece === piece.toUpperCase();
              const targetSquares = isWhite ? defendedSquares : attackedSquares;


              if (piece.toUpperCase() === "P") {  //Pawn rules
                  if (!isWhite) {
                      // Black pawn attacks
                      if (i < 7 && j > 0) {
                          targetSquares.push([i + 1, j - 1]);
                      }
                      if (i < 7 && j < 7) {
                          targetSquares.push([i + 1, j + 1]);
                      }
                  } else {
                      // White pawn attacks
                      if (i > 0 && j > 0) {
                          targetSquares.push([i - 1, j - 1]);
                      }
                      if (i > 0 && j < 7) {
                          targetSquares.push([i - 1, j + 1]);
                      }
                  }
              } else if (piece.toUpperCase() === "N") { //knight rules
                  for (const [dx, dy] of knightMoves) {
                      const newX = i + dx;
                      const newY = j + dy;
                      if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                          targetSquares.push([newX, newY]);
                      }
                  }
              } else if (piece.toUpperCase() === "B" || piece.toUpperCase() === "Q") { //Bishop rules
                  for (const [dx, dy] of bishopMoves) {
                      let x = i;
                      let y = j;
                      for (let step = 1; step < 8; step++) {
                          x += dx;
                          y += dy;
                          if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                              if (board[x][y] !== "") {
                                  targetSquares.push([x, y]);
                                  break;
                              }
                              targetSquares.push([x, y]);
                          } else {
                              break;
                          }
                      }
                  }
              } if (piece.toUpperCase() === "R" || piece.toUpperCase() === "Q") { // If it's a rook
                  for (const [dx, dy] of rookMoves) {
                      let x = i;
                      let y = j;
                      for (let step = 1; step < 8; step++) {
                          x += dx;
                          y += dy;
                          if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                              if (board[x][y] !== "") {
                                  targetSquares.push([x, y]);
                                  break;
                              }
                              targetSquares.push([x, y]);
                          } else {
                              break;
                          }
                      }
                  }
              } if (piece.toUpperCase() === "K") { // King's defending style
                  for (const [dx, dy] of kingMoves) {
                      let x = i + dx;
                      let y = j + dy;
                      if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                          targetSquares.push([x, y]);
                      }
                  }
              }

              }
          }


          function calculateSquareCounts(squares) { // look for duplicates to determine count
            const counts = Array(8).fill(null).map(() => Array(8).fill(0));
            for (let square of squares) {
              let [i, j] = square;
              counts[i][j]++;
            }
            return counts;
          }

          const defendCount = calculateSquareCounts(defendedSquares);
          const attackCount = calculateSquareCounts(attackedSquares);

        return [defendedSquares, attackedSquares, defendCount, attackCount];
  };


  const handleSquareClick = (i, j) => {
    const piece = board[i][j];

  if (!selectedSquare && piece) {
    // If no square is selected and the clicked square has a piece, select it
    setSelectedSquare([i, j]);
  } else if (selectedSquare && selectedSquare[0] === i && selectedSquare[1] === j) {
    // If the same square is clicked, deselect it
    setSelectedSquare(null);
  } else if (selectedSquare) {
    const [prevI, prevJ] = selectedSquare;
    const prevPiece = board[prevI][prevJ];
    const isSameColor = (piece && prevPiece && piece.toLowerCase() === piece) === (prevPiece.toLowerCase() === prevPiece);

    if (!piece || !isSameColor) {
      // If the second clicked square is empty or contains a piece of a different color, move the piece
      const newBoard = board.map(row => row.slice());
      newBoard[i][j] = prevPiece;
      newBoard[prevI][prevJ] = "";
      setBoard(newBoard);

      if (piece) {
        // If a piece is captured, move it to offBoardPieces (not implemented yet)
      }
      const newDefendedAndAttackedSquares = calculateTargetSquares(newBoard);
        setDefendedSquares(newDefendedAndAttackedSquares[0]);
        setAttackedSquares(newDefendedAndAttackedSquares[1]);
        setDefendCount(newDefendedAndAttackedSquares[2]);
        setAttackCount(newDefendedAndAttackedSquares[3]);
    }

    // Deselect the previously selected square
    setSelectedSquare(null);
  }
  };

  // example positions
  const PresetPosition = () => {
    console.log("button clicked")
    console.log("BoardPosition: ", BoardPosition)
    let newBoard = [];
    if (BoardPosition === "Initial") {
        newBoard = Magnus;
        BoardPosition = "Magnus (2018)"
    } else if (BoardPosition === "Magnus (2018)") {
        newBoard = Shirov;
        BoardPosition = "Shirov (1998)"
    } else if (BoardPosition === "Shirov (1998)") {
      newBoard = Geller;
      BoardPosition = "Geller (1949)"
    } else if (BoardPosition === "Geller (1949)") {
      newBoard = Kholmov;
      BoardPosition = "Kholmov (1964)"
    } else if (BoardPosition === "Kholmov (1964)") {
      newBoard = initialBoard;
      BoardPosition = "Initial"
    }
    setBoard(newBoard);
    const newDefendedAndAttackedSquares = calculateTargetSquares(newBoard);
        setDefendedSquares(newDefendedAndAttackedSquares[0]);
        setAttackedSquares(newDefendedAndAttackedSquares[1]);
        setDefendCount(newDefendedAndAttackedSquares[2]);
        setAttackCount(newDefendedAndAttackedSquares[3]);
  }



  return (

    <div className="App">
      <div className="positionSwitch">
        <button style={{ marginRight: '5px' }} onClick={PresetPosition}>
          <img src={refresh} alt="Refresh"/>
        </button>
        <p>{BoardPosition === "Initial" ? "" : BoardPosition}</p>
      </div>
       <div className="board-wrapper">
        <Chessboard
          board={board}
          selectedSquare={selectedSquare}
          defendedSquares={defendedSquares}
          attackedSquares={attackedSquares}
          defendCount={defendCount}
          attackCount={attackCount}
          onSquareClick={handleSquareClick}
        />
      </div>
    </div>
  );

}

export default App;
