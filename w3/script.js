// Setup canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Game variables
let score = 0;
let level = 1;
let gameOver = false;
const player = {
   x: 50,
   y: canvas.height - 70,
   width: 50,
   height: 50,
   dy: 0,
   jumping: false
};


// Different types of obstacles
const obstacleTypes = [
   { type: 'spike', width: 30, height: 30, color: 'red', speed: -6 },
   { type: 'block', width: 40, height: 40, color: 'blue', speed: -4 },
   { type: 'movingBlock', width: 60, height: 30, color: 'green', speed: -5, moveRange: 50 },
   { type: 'fallingBlock', width: 40, height: 40, color: 'purple', speed: -3, fallSpeed: 2 }
];
let obstacles = [];
const gravity = 0.4; // Adjusted gravity
const jumpStrength = -12; // Adjusted jump strength
let frameCount = 0;


// Initialize key states
const keys = {
   space: false,
   r: false
};


// Handle keydown events
document.addEventListener('keydown', (event) => {
   if (event.code === 'Space') {
       keys.space = true;
   }
   if (event.code === 'KeyR') {
       keys.r = true;
       if (gameOver) {
           resetGame();
       }
   }
});


// Handle keyup events
document.addEventListener('keyup', (event) => {
   if (event.code === 'Space') {
       keys.space = false;
   }
   if (event.code === 'KeyR') {
       keys.r = false;
   }
});


// Draw player
function drawPlayer() {
   ctx.fillStyle = 'red';
   ctx.fillRect(player.x, player.y, player.width, player.height);
}


// Draw obstacles
function drawObstacles() {
   obstacles.forEach(obstacle => {
       ctx.fillStyle = obstacle.color;
       ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
   });
}


// Update player position and movement
function updatePlayer() {
   if (keys.space && !player.jumping) {
       player.dy = jumpStrength;
       player.jumping = true;
   }
  
   player.dy += gravity; // Apply gravity
   player.y += player.dy;
  
   // Prevent player from falling below the canvas
   if (player.y + player.height > canvas.height) {
       player.y = canvas.height - player.height;
       player.dy = 0;
       player.jumping = false;
   }
}


// Create a new obstacle
function createObstacle() {
   const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
   let obstacle = {
       x: canvas.width,
       y: canvas.height - type.height,
       width: type.width,
       height: type.height,
       color: type.color,
       speed: type.speed,
       type: type.type
   };
  
   // Specific properties for moving and falling blocks
   if (type.type === 'movingBlock') {
       obstacle.originalY = obstacle.y;
       obstacle.direction = Math.random() > 0.5 ? 1 : -1; // Random initial direction
       obstacle.moveRange = type.moveRange;
   } else if (type.type === 'fallingBlock') {
       obstacle.fallSpeed = type.fallSpeed;
       obstacle.initialY = obstacle.y;
       obstacle.falling = true;
   }
  
   return obstacle;
}


// Update obstacles position and behavior
function updateObstacles() {
   obstacles.forEach(obstacle => {
       obstacle.x += obstacle.speed;
      
       // Update moving block behavior
       if (obstacle.type === 'movingBlock') {
           obstacle.y += obstacle.direction;
           if (obstacle.y < obstacle.originalY - obstacle.moveRange) {
               obstacle.direction = 1;
           } else if (obstacle.y > obstacle.originalY) {
               obstacle.direction = -1;
           }
       }
      
       // Update falling block behavior
       if (obstacle.type === 'fallingBlock') {
           if (obstacle.falling) {
               obstacle.y += obstacle.fallSpeed;
               if (obstacle.y > canvas.height - obstacle.height) {
                   obstacle.falling = false;
               }
           }
       }
      
       // Check for collision with player
       if (player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y + obstacle.height &&
           player.y + player.height > obstacle.y) {
          
           // Collision detected
           gameOver = true;
           document.getElementById('gameOver').style.display = 'block';
       }
   });
  
   // Remove off-screen obstacles
   obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
  
   // Add new obstacles with increased frequency as game progresses
   if (frameCount % (150 - level * 10) === 0 && !gameOver) { // Increase difficulty with level
       obstacles.push(createObstacle());
   }
}


// Reset game state
function resetGame() {
   score = 0;
   level = 1;
   player.x = 50;
   player.y = canvas.height - 70;
   player.dy = 0;
   player.jumping = false;
   obstacles = [];
   gameOver = false;
   document.getElementById('gameOver').style.display = 'none';
   document.getElementById('score').textContent = `Score: ${score}`;
   document.getElementById('level').textContent = `Level: ${level}`;
}


// Update score display
function updateScore() {
   if (!gameOver) {
       score += 1;
       document.getElementById('score').textContent = `Score: ${score}`;
   }
}


// Update level display
function updateLevel() {
   if (frameCount % 300 === 0 && !gameOver) {
       level += 1;
       document.getElementById('level').textContent = `Level: ${level}`;
       // Increase difficulty or modify game mechanics based on level
   }
}


// Draw debug information
function drawDebugInfo() {
   ctx.fillStyle = 'white';
   ctx.font = '16px Arial';
   ctx.fillText(`Player: (${player.x}, ${player.y})`, 10, 20);
   obstacles.forEach((obstacle, index) => {
       ctx.fillText(`Obstacle ${index}: (${obstacle.x}, ${obstacle.y}, ${obstacle.type})`, 10, 40 + index * 20);
   });
}


// Main game loop
function gameLoop() {
   if (!gameOver) {
       ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      
       drawPlayer();
       drawObstacles();
       drawDebugInfo(); // Add this line to debug
      
       updatePlayer();
       updateObstacles();
       updateScore();
       updateLevel();
      
       frameCount++;
   }
  
   requestAnimationFrame(gameLoop); // Request next frame
}


// Start the game loop
gameLoop();


