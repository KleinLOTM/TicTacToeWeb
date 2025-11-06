import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// --- Select DOM elements ---
const cells = document.querySelectorAll(".cell");
const resultDiv = document.getElementById("result");
const turnIndicator = document.getElementById("turnIndicator");
const background = document.getElementById("background");

// Background images
const bgX = "url('most-badass-magical-girl-5lz0b8hd1svqjwgm.jpg')";
const bgO = "url('494d9b176334fa91dab3deb044ed3ce5.jpg')";

// --- Firestore reference ---
const gameDoc = doc(window.db, "games", "currentGame");

// --- Initialize game document if missing ---
async function initGame() {
    const docSnap = await getDoc(gameDoc);
    if (!docSnap.exists()) {
        console.log("Creating initial game document...");
        await setDoc(gameDoc, {
            board: Array(9).fill(""),
            currentPlayer: "X",
            gameOver: false
        });
    }
    startListening();
}

// --- Variables ---
let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

// --- Update UI ---
function updateTurn() {
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    turnIndicator.style.color = currentPlayer === "X" ? "red" : "blue";
    background.style.backgroundImage = currentPlayer === "X" ? bgX : bgO;
}

function highlightWinner(combo) {
    combo.forEach(i => cells[i].classList.add("win"));
}

function checkWinner() {
    const winCombos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let combo of winCombos) {
        const [a,b,c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWinner(combo);
            return board[a];
        }
    }
    if (!board.includes("")) return "Tie";
    return null;
}

// --- Firestore listener ---
function startListening() {
    onSnapshot(gameDoc, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        console.log("Firestore update received:", data);

        board = data.board;
        currentPlayer = data.currentPlayer;
        gameOver = data.gameOver;

        // Update board UI
        cells.forEach((cell, i) => {
            cell.textContent = board[i];
            cell.style.color = board[i] === "X" ? "red" : board[i] === "O" ? "blue" : "";
            cell.classList.remove("win");
        });

        // Check winner
        const winner = checkWinner();
        if (winner && winner !== "Tie") {
            resultDiv.textContent = `Player ${winner} Wins!`;
            resultDiv.style.color = winner === "X" ? "red" : "blue";
        } else if (winner === "Tie") {
            resultDiv.textContent = "It's a Tie!";
            resultDiv.style.color = "black";
        } else {
            resultDiv.textContent = "";
        }

        updateTurn();
    });
}

// --- Handle clicks ---
cells.forEach(cell => {
    cell.addEventListener("click", async () => {
        const idx = cell.dataset.index;
        if (board[idx] || gameOver) return;

        board[idx] = currentPlayer;

        // Check for winner
        const winner = checkWinner();
        if (winner) {
            gameOver = true;
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
        }

        // Save to Firestore
        try {
            await setDoc(gameDoc, { board, currentPlayer, gameOver });
            console.log("Move saved to Firestore");
        } catch (err) {
            console.error("Error saving move:", err);
        }
    });
});

// --- Reset button ---
document.getElementById("resetButton").addEventListener("click", async () => {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameOver = false;
    try {
        await setDoc(gameDoc, { board, currentPlayer, gameOver });
        console.log("Game reset in Firestore");
    } catch (err) {
        console.error("Error resetting game:", err);
    }
});

// --- Initialize ---
initGame();
