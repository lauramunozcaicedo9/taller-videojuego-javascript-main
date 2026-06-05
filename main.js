const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const buttons = document.querySelectorAll('button');
const lives = document.getElementById('lives');
const time = document.getElementById('time');
const playagain  = document.getElementById('playagain');
const recorField = document.getElementById('record');
const recordGlob = localStorage.getItem('recordTime');

(recordGlob) ? recorField.innerHTML = `Tu mejor tiempo es de ${localStorage.getItem('recordTime')}`: false;

playagain.style.display = 'none';

let canvasSize, elementsSize, intervalo;
let player = {};
let mapInfo = {index: 0, start:{}, finish:{}};
let resetData = true;
let canInitTime = false;
let finished = false;


window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);
window.addEventListener('keydown', function(e){
    detectMovePlayer(e.code);
});
buttons.forEach(function(button){
    button.addEventListener('click', function(e){
        detectMovePlayer(e.srcElement.id)
    });
})
playagain.addEventListener('click', playAgain);

function playAgain(){
    player = {};
    playagain.style.display = 'none';
    resetData = true;
    canInitTime = false;
    finished = false;
    startGame();
}

function detectMovePlayer(side){
    if(!finished){
        switch(side){
            case 'ArrowUp':
            case 'up':
                (player.posY > 0 ) ? player.posY-- : false;
            break;
    
            case 'ArrowLeft':
                (player.posX > 0) ? player.posX-- : false;
            case 'left':
            break;
    
            case 'ArrowRight':
            case 'right':
                (player.posX < 9 ) ? player.posX++ : false;
            break;
    
            case 'ArrowDown':
            case 'down':
                (player.posY < 9)  ? player.posY++: false;
            break;
        }

        if(!canInitTime){
            intervalTime = setInterval(showTime,100);
            canInitTime = true;
        }
        
        startGame();
    }
}


function finalizeGame(text){
    game.clearRect(0, 0, canvas.width, canvas.height);
    game.fillText(emojis[text],(canvas.width / 2) - elementsSize, canvas.height / 2);
    mapInfo.index = 0;
    resetData = true;
    clearInterval(intervalTime);
    finished = true;
    playagain.style.display = 'block';
    if(text == 'WIN'){
        addRecord();
    }
}

function addRecord(){
    const record = localStorage.getItem('recordTime');
    if(record){
        if(player.time < record || record == 0){
            localStorage.setItem('recordTime', player.time);
        } 
    }else{
        localStorage.setItem('recordTime', player.time);
    }

    recorField.innerHTML = `Tu mejor tiempo es de ${localStorage.getItem('recordTime')}`;
}

function locatePlayer(){
    if(map[player.posY][player.posX] == 'X'){
        if(player.life > 1){
            game.fillText(emojis['BOMB_COLLISION'],elementsSize * player.posX, elementsSize * (player.posY + 1));
            player.life--;
            player.posX = mapInfo.start.x;
            player.posY = mapInfo.start.y;
            setTimeout(startGame,500);
        }else{
            player.life--;
            showLives();
            finalizeGame('GAME_OVER');
        }
        
    }else if(map[player.posY][player.posX] == 'I'){
        if(maps[mapInfo.index + 1]){
            mapInfo.index ++;
            resetData = true;
            startGame();
        }else{
           finalizeGame('WIN');
        }
    }else{
        game.fillText(emojis['PLAYER'],elementsSize * player.posX, elementsSize * (player.posY + 1));
    }
    
}


function setCanvasSize(){
    (window.innerHeight > window.innerWidth)?  canvasSize = window.innerWidth * 0.8 :  canvasSize = window.innerHeight * 0.8;

     canvas.setAttribute('width',canvasSize);
     canvas.setAttribute('height',canvasSize);

     elementsSize = (canvasSize / 10) - 1;

     startGame();
}

function startGame(){
    game.clearRect(0, 0, canvas.width, canvas.height);
    game.font = elementsSize + 'px Verdana';
    game.textAlign = 'start';
    
    cargarMapa(mapInfo.index);
    showLives();
    locatePlayer();
}

function cargarMapa(index){
    const mapRows = maps[index].trim().split('\n');
    const mapRowsCols = mapRows.map(row => row.trim().split(''));

    mapRowsCols.forEach((row,y) => {
        row.forEach((col,x) =>{ 
            const posX = elementsSize * (x);
            const posY = elementsSize * (y + 1);
            game.fillText(emojis[col],posX,posY);

            if(resetData){
                if(col == 'O'){
                    player.posX = x;
                    player.posY = y;
                    (!player.life) ? player.life = 3: false;
                    (!player.time)? player.time = 0 : false;
                    mapInfo.start.x = x; 
                    mapInfo.start.y = y;
                }
                if(col == 'I'){
                    mapInfo.finish.x = x;
                    mapInfo.finish.y = y;
                } 
            }
            
        })
    });
    resetData = false;
    map = mapRowsCols;
}


function showLives(){
    lives.innerHTML = emojis['HEART'].repeat(player.life);
}

function showTime(){
    player.time ++;
    time.innerHTML = player.time;
}