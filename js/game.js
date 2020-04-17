
var myGamePiece;
var myObstacles = [];
var myScore;

document.addEventListener("keydown", function(event) {
    if (event.code == 'KeyW') {
      moveup();
    }
    if (event.code == 'KeyS') {
      movedown();
    }
    if (event.code == 'KeyA') {
      moveleft();
    }
    if (event.code == 'KeyD') {
      moveright();
    }      
});

document.addEventListener("keyup", function(event) {
    if (event.code == 'KeyW') {
      movedown();
    }
    if (event.code == 'KeyS') {
      moveup();
    }
    if (event.code == 'KeyA') {
      moveright();
    }
    if (event.code == 'KeyD') {
      moveleft();
    }      
});


function startGame() {  
    myGamePiece = new component(10, 10, "red", 230, 120);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[5]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 30);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }    
}

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.newPos();    
    myGamePiece.update();
}

function moveup() {
    myGamePiece.speedY -= 1; 
}

function movedown() {
    myGamePiece.speedY += 1; 
}

function moveleft() {
    myGamePiece.speedX -= 1; 
}

function moveright() {
    myGamePiece.speedX += 1; 
}