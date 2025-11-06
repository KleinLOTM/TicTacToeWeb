// Game state
const board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

// DOM elements
const cells = document.querySelectorAll(".cell");
const resultDiv = document.getElementById("result");
const turnIndicator = document.getElementById("turnIndicator");
const background = document.getElementById("background");
const mainContainer = document.querySelector(".main-container");

// Background images (ensure files are in the same folder as HTML)
const bgX = "url('most-badass-magical-girl-5lz0b8hd1svqjwgm.jpg')";
const bgO = "url('494d9b176334fa91dab3deb044ed3ce5.jpg')";

// Update the background based on current player
function updateBackground() {
    background.style.backgroundImage = currentPlayer === "X" ? bgX : bgO;
}

// Update turn indicator
function updateTurn() {
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    turnIndicator.style.color = currentPlayer === "X" ? "red" : "blue";
    updateBackground();
}

// Check for winner
function checkWinner() {
    const winCombos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let combo of winCombos) {
        const [a,b,c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            [a,b,c].forEach(i => cells[i].classList.add("win")); // highlight winning cells
            return board[a];
        }
    }
    if (!board.includes("")) return "Tie";
    return null;
}

// Handle cell click
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const idx = cell.dataset.index;
        if (board[idx] || gameOver) return;

        board[idx] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.style.color = currentPlayer === "X" ? "red" : "blue";

        const winner = checkWinner();
        if (winner) {
            gameOver = true;
            if (winner === "Tie") {
                resultDiv.textContent = "It's a Tie!";
                resultDiv.style.color = "black";
            } else {
                resultDiv.textContent = `Player ${winner} Wins!`;
                resultDiv.style.color = winner === "X" ? "red" : "blue";
            }
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            updateTurn();
        }
    });
});

// Reset button
document.getElementById("resetButton").addEventListener("click", () => {
    board.fill("");
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("win");
    });
    gameOver = false;
    currentPlayer = "X";
    resultDiv.textContent = "";
    mainContainer.style.display = "flex"; // show board if hidden
    updateTurn();
});

// Initialize
updateTurn();
