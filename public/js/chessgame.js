const socket = io();
const chess = new Chess();
const boardelement = document.querySelector(".chessboard");

let draggedpiece = null;
let sourcesquare = null;
let playerrole = null;

const randerboard = () =>{
    const board = chess.board();
    boardelement.innerHTML = "";
    board.forEach((row,rowindex) => {
        row.forEach((square,squareindex) => {
            const squareelement = document.createElement("div");
            squareelement.classList.add("square",
                (rowindex + squareindex)%2 === 0 ? "light" : "dark"
            );
            squareelement.dataset.row = rowindex;
            squareelement.dataset.col = squareindex;

            if(square){
                const pieceelement = document.createElement("div");
                pieceelement.classList.add("piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceelement.innerHTML = getpicesunicode(square);
                pieceelement.draggable = playerrole === square.color;

                pieceelement.addEventListener("dragstart",(e)=>{
                    if(pieceelement.draggable){
                        draggedpiece = pieceelement;
                        sourcesquare = {row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain","");
                    }
                });

                pieceelement.addEventListener("dragend",(e) => {
                    draggedpiece = null;
                    sourcesquare = null;
                })

                squareelement.appendChild(pieceelement);
            }

            squareelement.addEventListener("dragover",(e) => {
                e.preventDefault();
            })

            squareelement.addEventListener("drop", (e) => {
                e.preventDefault();
                if(draggedpiece){
                    const targetsource = {
                        row : parseInt(squareelement.dataset.row),
                        col : parseInt(squareelement.dataset.col)
                    };

                    handlemove(sourcesquare,targetsource);
                }
            })

            boardelement.appendChild(squareelement);
        });
    });

    if(playerrole === "b"){
        boardelement.classList.add("flipped");
    }
    else{
        boardelement.classList.remove("flipped");
    }
};

const handlemove = (source, target)=> {
    const move = {
        from : `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to : `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion : "q"
    };
    socket.emit("move",move);
};

const getpicesunicode =(piece) => {
    const unicodepices ={
        p : "♙",
        r : "♖",
        n : "♘",
        b : "♗",
        q : "♕",
        k : "♔",
        P : "♟",
        R : "♜",
        N : "♞",
        B : "♝",
        Q : "♛",
        K : "♚"
    };

    return unicodepices[piece.type] || "";
};

socket.on("playerrole",(role) => {
    playerrole = role;
    randerboard();
});

socket.on("spectatorrole",() =>{
    playerrole = null;
    randerboard();
});

socket.on("boardstate", (fen)=> {
    chess.load(fen);
    randerboard();
});

socket.on("move", (move)=> {
    chess.load(move);
    randerboard();
});

randerboard();
