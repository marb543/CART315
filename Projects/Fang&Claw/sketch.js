/**
 * Global game state variables for tracking game mechanics:
 * - balls: Array of all active balls in the game
 * - claw: Object containing claw position and properties
 * - selectedBalls: Array of balls currently held by the claw
 * - collectedBalls: Array of successfully collected balls
 * - score: Current level score
 * - totalScore: Cumulative score across all levels
 * - level: Current game level
 * - gravity: Physics constant for ball falling
 * - timeLeft: Seconds remaining in current level
 * - requiredPoints: Points needed to complete current level
 */
let balls = [];
let claw;
let selectedBalls = [];
let collectedBalls = [];
let score = 0;
let level = 1;
let gravity = 0.5;
let swingForce = 0.2;
let chainLength = 50;
let gameLevel = {
  easy: { dropChance: 0.15, swingForce: 0.1, speed: 4 },
  medium: { dropChance: 0.25, swingForce: 0.2, speed: 5 },
  hard: { dropChance: 0.35, swingForce: 0.3, speed: 6 }
};
let timeLeft = 60;
let lastTime = 0;
let gameOver = false;
let requiredPoints = 100; // Base required points
let levelStartScore = 0; // To track points earned in current level
let totalScore = 0;
let highScore = 0;

// Add after the global variables
let sounds = {
  grab: null,
  drop: null,
  collect: null,
  levelUp: null,
  gameOver: null
};

// Add to global variables
const POWERUP_TYPES = {
  MAGNET: {
    color: '#FF00FF',
    duration: 5000,
    description: 'Magnetic Claw',
    effect: () => { claw.size *= 1.5; } // Increase grab range
  },
  DOUBLE_POINTS: {
    color: '#00FFFF',
    duration: 10000,
    description: '2x Points',
    effect: () => { /* already handled in collectBall */ }
  },
  SLOW_TIME: {
    color: '#FFD700',
    duration: 8000,
    description: 'Slow Motion',
    effect: () => {
      for (let ball of balls) {
        ball.vx *= 0.5;
        ball.vy *= 0.5;
      }
    }
  }
};

let activePowerups = {
  MAGNET: false,
  DOUBLE_POINTS: false,
  SLOW_TIME: false
};

// Add to global variables
let isTutorial = true;
let tutorialStep = 0;

// Add to global variables
let isTransitioning = false;
let transitionAlpha = 0;
let transitionDirection = 1;

// Add these variables at the top with other global variables
let soundsLoaded = false;
let soundsEnabled = false;

/***********************************
 * GAME INITIALIZATION
 ***********************************/

function preload() {
  if (window.AudioContext || window.webkitAudioContext) {
    soundsEnabled = true;
    try {
      soundFormats('mp3');
      const soundFiles = {
        grab: 'grab',
        drop: 'drop',
        collect: 'collect',
        levelUp: 'levelup',
        gameOver: 'gameover'
      };

      // Load each sound file
      for (const [key, filename] of Object.entries(soundFiles)) {
        sounds[key] = loadSound(`sounds/${filename}.mp3`,
          () => console.log(`${key} sound loaded successfully`),
          (err) => {
            console.error(`Error loading ${key} sound:`, err);
            soundsEnabled = false;
          }
        );
      }
      soundsLoaded = true;
    } catch (e) {
      console.error('Sound system initialization failed:', e);
      soundsEnabled = false;
    }
  } else {
    console.log('WebAudio not supported in this browser');
    soundsEnabled = false;
  }
}

/**
 * Initializes the game environment and canvas.
 * Creates an 720x550 pixel playing field and sets up the first level.
 * This is called once when the game starts.
 */
function setup() {
  console.log('Setup running...');
  createCanvas(720, 550);
  loadHighScore();
  resetLevel(level);

  // If sounds haven't loaded after 3 seconds, disable them and continue
  setTimeout(() => {
    if (!soundsLoaded) {
      console.log('Sound loading timed out, continuing without sound');
      soundsEnabled = false;
    }
  }, 3000);
}

/**
 * Resets and initializes a new level with scaled difficulty.
 * - Clears all balls and resets collection area
 * - Sets 60 second timer
 * - Decreases number of balls as levels progress (25 initially, -3 per level)
 * - Increases ball speed and required points with level
 * - Adds new ball colors at levels 2 (green) and 3 (purple)
 * 
 * @param {number} currentLevel - The level number to initialize
 */
function resetLevel(currentLevel) {
  balls = [];
  selectedBalls = [];
  collectedBalls = [];
  score = 0;
  timeLeft = 60;
  lastTime = millis();
  levelStartScore = 0;

  // Start with more balls and decrease per level (max 5 levels of decrease)
  let ballReduction = min(currentLevel - 1, 5);
  let numBalls = 25 - (ballReduction * 3);

  let colors = ['red', 'blue', 'yellow'];
  if (currentLevel > 1) colors.push('green');
  if (currentLevel > 2) colors.push('purple');

  // Increase initial velocity with level
  let baseVelocity = 0.5 + (currentLevel * 0.5);

  for (let i = 0; i < numBalls; i++) {
    balls.push({
      x: random(50, width - 50),
      y: random(100, height - 50),
      color: random(colors),
      size: 30,
      selected: false,
      vx: random(-baseVelocity, baseVelocity),
      vy: random(-baseVelocity, baseVelocity),
      value: getColorValue(random(colors))
    });
  }

  claw = {
    x: width / 2,
    y: 50,
    size: 40,
    open: true,
    speed: gameLevel[getCurrentDifficulty()].speed,
    angle: 0,
    swingVelocity: 0
  };

  // Increase required points for each level
  requiredPoints = 100 + (currentLevel - 1) * 50;

  // Add power-up balls
  addPowerupBalls();
}

/**
 * Calculates point value for each ball color.
 * Point values:
 * - Red: 10 points
 * - Blue: 15 points
 * - Yellow: 20 points
 * - Green: 25 points (Level 2+)
 * - Purple: 30 points (Level 3+)
 * 
 * @param {string} color - The color of the ball
 * @returns {number} The point value for the given color
 */
function getColorValue(color) {
  switch (color) {
    case 'red': return 10;
    case 'blue': return 15;
    case 'yellow': return 20;
    case 'green': return 25;
    case 'purple': return 30;
    default: return 10;
  }
}

/**
 * Determines game difficulty based on current level.
 * Difficulty affects ball movement speed and escape behavior:
 * - Easy (Levels 1-2): Slower balls, less likely to escape
 * - Medium (Levels 3-4): Moderate speed, moderate escape chance
 * - Hard (Level 5+): Faster balls, high escape chance
 * 
 * @returns {string} The difficulty level ('easy', 'medium', or 'hard')
 */
function getCurrentDifficulty() {
  if (level <= 2) return 'easy';
  if (level <= 4) return 'medium';
  return 'hard';
}

/***********************************
 * MAIN GAME LOOP
 ***********************************/

/**
 * Main game loop handling all game mechanics and rendering.
 * Processes in this order:
 * 1. Checks for game over state
 * 2. Updates timer and checks level completion
 * 3. Handles claw movement and physics
 * 4. Draws game elements
 * 5. Updates UI and score display
 */
function draw() {
  if (gameOver) {
    showGameOver();
    return;
  }

  if (isTutorial) {
    showTutorial();
  }

  if (isTransitioning) {
    drawLevelTransition();
    return;
  }

  background(220);
  stroke(0);
  strokeWeight(4);
  noFill();
  rect(10, 10, width - 20, height - 20);

  // Update timer
  let currentTime = millis();
  if (currentTime - lastTime >= 1000) {
    timeLeft--;
    lastTime = currentTime;

    // Check for time up
    if (timeLeft <= 0) {
      checkLevelCompletion();
    }
  }

  handleClawMovement();
  updatePhysics();
  drawBalls();
  drawClaw();
  updateUI();
  drawTimer();
}

/***********************************
 * GAME MECHANICS
 ***********************************/

/**
 * Processes keyboard input for claw movement.
 * Arrow keys control movement:
 * - Left/Right: Horizontal movement (constrained to game bounds)
 * - Up/Down: Vertical movement (constrained to game bounds)
 * Movement speed increases with difficulty level
 */
function handleClawMovement() {
  if (keyIsDown(LEFT_ARROW)) {
    claw.x = max(50, claw.x - claw.speed);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    claw.x = min(width - 50, claw.x + claw.speed);
  }
  if (keyIsDown(DOWN_ARROW)) {
    claw.y = min(height - 50, claw.y + claw.speed);
  }
  if (keyIsDown(UP_ARROW)) {
    claw.y = max(50, claw.y - claw.speed);
  }
}

/**
 * Updates all physics calculations for the game.
 * Handles:
 * 1. Claw swing mechanics with pendulum motion
 * 2. Selected ball attachment to claw
 * 3. Free ball movement and bouncing
 * 4. Ball escape behavior when claw approaches
 * 5. Speed limits and friction effects
 */
function updatePhysics() {
  let difficulty = getCurrentDifficulty();
  claw.swingVelocity += sin(claw.angle) * gameLevel[difficulty].swingForce;
  claw.angle += claw.swingVelocity;
  claw.angle *= 0.99;
  claw.swingVelocity *= 0.99;

  let actualX = claw.x + sin(claw.angle) * 10;

  // Update selected balls
  for (let ball of selectedBalls) {
    if (!claw.open) {
      ball.x = actualX;
      ball.y = claw.y + chainLength;
      ball.vx = 0;
      ball.vy = 0;
    } else {
      ball.vy += gravity;
      ball.y += ball.vy;
      ball.x += ball.vx;

      if (ball.y > height - ball.size / 2) {
        ball.y = height - ball.size / 2;
        ball.vy *= -0.6;
      }
    }
  }

  // Update free balls
  for (let ball of balls) {
    if (!ball.selected) {
      // Check distance to claw
      let d = dist(claw.x, claw.y + 20, ball.x, ball.y);

      // Reduce escape chance and range
      if (d < claw.size * 1.5 && random() < 0.15) { // Reduced range and chance (was 2 and 0.3)
        // Calculate direction away from claw
        let angle = atan2(ball.y - (claw.y + 20), ball.x - claw.x);
        let escapeSpeed = 2.5; // Reduced escape speed (was 4)
        ball.vx = cos(angle) * escapeSpeed;
        ball.vy = sin(angle) * escapeSpeed;
      }

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls with more friction
      if (ball.x < 50 || ball.x > width - 50) {
        ball.vx *= -0.8; // Added more friction on bounce (was -1)
        ball.x = constrain(ball.x, 50, width - 50);
      }

      // Bounce off top and bottom with more friction
      if (ball.y < 100 || ball.y > height - 50) {
        ball.vy *= -0.8; // Added more friction on bounce (was -1)
        ball.y = constrain(ball.y, 100, height - 50);
      }

      // Reduced random movement
      if (random() < 0.01) { // Reduced chance of direction change (was 0.02)
        ball.vx += random(-0.3, 0.3); // Reduced random movement (was -0.5, 0.5)
        ball.vy += random(-0.3, 0.3);

        // Lower speed limits
        let speed = sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        let levelSpeedMultiplier = 1 + (level * 0.2);
        let maxSpeed = 2 * levelSpeedMultiplier;
        if (d < claw.size * 1.5) {
          maxSpeed = 2.5 * levelSpeedMultiplier;
        }
        if (speed > maxSpeed) {
          ball.vx = (ball.vx / speed) * maxSpeed;
          ball.vy = (ball.vy / speed) * maxSpeed;
        }
      }

      // Increased friction to slow balls down more quickly
      ball.vx *= 0.99; // More friction (was 0.995)
      ball.vy *= 0.99;
    }
  }
}

/**
 * Draws all balls in the game
 */
function drawBalls() {
  noStroke();
  for (let ball of balls) {
    // Special rendering for power-up balls
    if (ball.isPowerup) {
      // Draw sparkle effect
      push();
      translate(ball.x, ball.y);
      rotate(ball.sparkleAngle);
      ball.sparkleAngle += 0.05; // Rotate sparkle

      // Draw star shape
      fill(ball.color);
      beginShape();
      for (let i = 0; i < 10; i++) {
        let radius = i % 2 === 0 ? ball.size : ball.size * 0.5;
        let angle = (i * TWO_PI) / 10;
        vertex(cos(angle) * radius, sin(angle) * radius);
      }
      endShape(CLOSE);

      // Add glow effect
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = ball.color;
      circle(0, 0, ball.size * 0.8);
      drawingContext.shadowBlur = 0;
      pop();
    } else {
      // Normal ball rendering
      fill(ball.color);
      if (ball.selected) {
        stroke(0);
        strokeWeight(2);
      } else {
        noStroke();
      }
      circle(ball.x, ball.y, ball.size);
    }
  }
}

/**
 * Draws the claw and its chain
 */
function drawClaw() {
  let actualX = claw.x + sin(claw.angle) * 10;
  stroke(0);
  strokeWeight(2);
  line(claw.x, 0, actualX, claw.y);

  if (claw.open) {
    line(actualX - 20, claw.y, actualX - 10, claw.y + 20);
    line(actualX + 20, claw.y, actualX + 10, claw.y + 20);
  } else {
    line(actualX - 15, claw.y, actualX, claw.y + 20);
    line(actualX + 15, claw.y, actualX, claw.y + 20);
  }
}

/**
 * Updates UI elements with current game state
 */
function updateUI() {
  document.getElementById('score-display').textContent = score;
  document.getElementById('level-display').textContent = level;
  updateCollectionDisplay();
  drawPowerupStatus();
}

/**
 * Handles spacebar input for grabbing and releasing balls
 */
function keyPressed() {
  if (key === ' ') {
    if (gameOver) {
      // Reset game
      gameOver = false;
      score = 0;
      totalScore = 0;
      level = 1;
      collectedBalls = [];
      resetLevel(level);
      return;
    }

    // Normal spacebar handling for claw
    claw.open = !claw.open;
    if (claw.open && claw.y <= 50 && selectedBalls.length > 0) {
      handleBallCollection();
    }
    if (!claw.open) {
      grabNearbyBalls();
    }
  }
}

/**
 * Processes ball collection and scoring
 */
function handleBallCollection() {
  let difficulty = getCurrentDifficulty();

  for (let ball of selectedBalls) {
    if (random() < gameLevel[difficulty].dropChance) {
      dropBall(ball);
    } else {
      collectBall(ball);
    }
  }
  selectedBalls = [];

  if (balls.length === 0) {
    level++;
    showLevelComplete();
    resetLevel(level);
  }
}

/**
 * Drops a ball with physics
 * @param {Object} ball - The ball to drop
 */
function dropBall(ball) {
  ball.selected = false;
  ball.vy = 2;
  ball.vx = random(-2, 2);
  let index = selectedBalls.indexOf(ball);
  if (index > -1) {
    selectedBalls.splice(index, 1);
  }
  playSound('drop');
  showMessage('lost');
}

/**
 * Collects a ball and adds to score
 * @param {Object} ball - The ball to collect
 */
function collectBall(ball) {
  if (ball.isPowerup) {
    activatePowerup(ball.powerupType);
  }

  // Apply double points if powerup is active
  let pointMultiplier = activePowerups.DOUBLE_POINTS ? 2 : 1;
  score += ball.value * pointMultiplier;

  collectedBalls.push({
    color: ball.color,
    size: ball.size
  });

  let ballIndex = balls.indexOf(ball);
  if (ballIndex > -1) {
    balls.splice(ballIndex, 1);
  }

  playSound('collect');
  showMessage(`+${ball.value * pointMultiplier}`);
}

/**
 * Attempts to grab balls near the claw
 */
function grabNearbyBalls() {
  for (let ball of balls) {
    let d = dist(claw.x, claw.y + 20, ball.x, ball.y);
    if (d < claw.size && !ball.selected) {
      ball.selected = true;
      selectedBalls.push(ball);
      ball.x = claw.x;
      ball.y = claw.y + 30;
      playSound('grab');
    }
  }
}

/**
 * Shows a message popup
 * @param {string} text - The message to show
 */
function showMessage(text) {
  let messageDiv = document.getElementById('message');
  let messageText = document.getElementById('message-text');
  messageText.innerText = text;
  messageDiv.style.display = 'block';

  // Use green background for points, red for lost ball
  messageDiv.style.backgroundColor = text.includes('+') ? '#d4ffd4' : '#ffebeb';

  // Clear any existing timeout
  if (messageDiv.hideTimeout) {
    clearTimeout(messageDiv.hideTimeout);
  }

  // Set timeout duration based on message type
  let duration = text.includes('+') ? 1000 : 2000; // 1s for points, 2s for lost

  // Auto-hide message after duration
  messageDiv.hideTimeout = setTimeout(() => {
    messageDiv.style.display = 'none';
  }, duration);
}

/**
 * Shows the level completion message
 */
function showLevelComplete() {
  isTransitioning = true;
  transitionAlpha = 0;
  playSound('levelUp');
}

/**
 * Updates the collection display with ball counts by color
 */
function updateCollectionDisplay() {
  const display = document.getElementById('collection-display');
  display.innerHTML = '';

  // Count balls by color
  const ballCounts = {};
  collectedBalls.forEach(ball => {
    ballCounts[ball.color] = (ballCounts[ball.color] || 0) + 1;
  });

  // Create ball count display
  const countDisplay = document.createElement('div');
  countDisplay.className = 'ball-count';

  // Display count for each color
  Object.entries(ballCounts).forEach(([color, count]) => {
    const ballType = document.createElement('div');
    ballType.className = 'ball-type';

    const colorDot = document.createElement('div');
    colorDot.className = 'ball-color';
    colorDot.style.backgroundColor = color;

    const amount = document.createElement('span');
    amount.className = 'ball-amount';
    amount.textContent = `${count}x`;

    ballType.appendChild(colorDot);
    ballType.appendChild(amount);
    countDisplay.appendChild(ballType);
  });

  display.appendChild(countDisplay);
}

/**
 * Draws the timer and required points
 */
function drawTimer() {
  textSize(20);
  textAlign(LEFT, TOP);
  fill(0);
  noStroke();
  text(`Time: ${timeLeft}s`, 20, 20);
  text(`Required: ${requiredPoints}`, 20, 45);
}

/**
 * Checks if player met the level requirements
 */
function checkLevelCompletion() {
  if (score >= requiredPoints) {
    totalScore += score;
    level++;
    showLevelComplete();
    resetLevel(level);
  } else {
    gameOver = true;
  }
}

/**
 * Shows game over screen
 */
function showGameOver() {
  background(220);
  let finalScore = totalScore + score;
  let newHighScore = updateHighScore(finalScore);

  textSize(32);
  textAlign(CENTER, CENTER);
  fill(0);
  text('GAME OVER', width / 2, height / 2 - 60);

  textSize(24);
  text(`Level ${level} Score: ${score}`, width / 2, height / 2 - 20);
  text(`Total Score: ${finalScore}`, width / 2, height / 2 + 10);
  text(`High Score: ${highScore}`, width / 2, height / 2 + 40);

  if (newHighScore) {
    fill('#FFD700');
    text('NEW HIGH SCORE!', width / 2, height / 2 + 70);
  }

  fill(0);
  text('Press SPACE to restart', width / 2, height / 2 + 100);

  playSound('gameOver');
}

function loadHighScore() {
  let saved = localStorage.getItem('clawGameHighScore');
  highScore = saved ? parseInt(saved) : 0;
}

function updateHighScore(score) {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('clawGameHighScore', highScore);
    return true;
  }
  return false;
}

// Add to the resetLevel function after creating regular balls
function addPowerupBalls() {
  let powerupCount = min(Math.floor(level / 2), 3);

  for (let i = 0; i < powerupCount; i++) {
    let powerupType = random(Object.keys(POWERUP_TYPES));
    let powerup = POWERUP_TYPES[powerupType];

    balls.push({
      x: random(50, width - 50),
      y: random(100, height - 50),
      color: powerup.color,
      size: 25,
      selected: false,
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      isPowerup: true,
      powerupType: powerupType,
      value: 50,
      sparkleAngle: 0 // For visual effect
    });
  }
}

function activatePowerup(type) {
  const powerup = POWERUP_TYPES[type];
  activePowerups[type] = true;

  // Apply power-up effect
  if (powerup.effect) {
    powerup.effect();
  }

  // Show visual feedback
  showMessage(`${powerup.description} ACTIVATED!`);

  // Set up expiration
  setTimeout(() => {
    deactivatePowerup(type);
  }, powerup.duration);
}

// Add new function to handle power-up deactivation
function deactivatePowerup(type) {
  activePowerups[type] = false;

  // Reverse effects
  switch (type) {
    case 'MAGNET':
      claw.size = 40; // Reset to original size
      break;
    case 'SLOW_TIME':
      // Reset ball speeds to normal
      for (let ball of balls) {
        ball.vx *= 2;
        ball.vy *= 2;
      }
      break;
  }

  showMessage(`${POWERUP_TYPES[type].description} EXPIRED`);
}

// Add new function
function showTutorial() {
  if (!isTutorial) return;

  let messages = [
    "Use ←→ arrows to move the claw left and right",
    "Use ↑↓ arrows to move up and down",
    "Press SPACE to grab balls",
    "Bring balls to the top to collect them",
    "Different colors are worth different points!",
    "Watch out for power-ups!"
  ];

  fill(0, 0, 0, 200);
  rect(0, height - 100, width, 100);

  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(messages[tutorialStep], width / 2, height - 50);

  // Progress tutorial based on actions
  if (tutorialStep === 0 && (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW))) {
    tutorialStep++;
  } else if (tutorialStep === 1 && (keyIsDown(UP_ARROW) || keyIsDown(DOWN_ARROW))) {
    tutorialStep++;
  } else if (tutorialStep === 2 && !claw.open) {
    tutorialStep++;
  } else if (tutorialStep === 3 && collectedBalls.length > 0) {
    tutorialStep++;
  }

  if (tutorialStep >= messages.length - 1) {
    isTutorial = false;
  }
}

// Add new function
function drawLevelTransition() {
  if (!isTransitioning) return;

  push();
  background(220);
  fill(0, 0, 0, transitionAlpha);
  rect(0, 0, width, height);

  if (transitionAlpha > 0) {
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text(`Level ${level}`, width / 2, height / 2);
  }

  transitionAlpha += transitionDirection * 5;

  if (transitionAlpha > 255) {
    transitionDirection = -1;
  } else if (transitionAlpha < 0) {
    isTransitioning = false;
    transitionDirection = 1;
  }
  pop();
}

// Update the playSound function
function playSound(soundName) {
  if (soundsEnabled && soundsLoaded && sounds[soundName]) {
    try {
      sounds[soundName].play();
    } catch (e) {
      console.error(`Error playing ${soundName}:`, e);
    }
  }
}

// New function to show active power-ups
function drawPowerupStatus() {
  let y = 70;
  textAlign(LEFT, TOP);
  textSize(16);
  fill(0);
  noStroke();

  Object.entries(activePowerups).forEach(([type, active]) => {
    if (active) {
      fill(POWERUP_TYPES[type].color);
      text(`${POWERUP_TYPES[type].description} ACTIVE`, 20, y);
      y += 20;
    }
  });
} 