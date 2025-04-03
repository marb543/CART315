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

// Game difficulty settings
let gameLevel = {
  easy: { dropChance: 0.15, swingForce: 0.1, speed: 4 },
  medium: { dropChance: 0.25, swingForce: 0.2, speed: 5 },
  hard: { dropChance: 0.35, swingForce: 0.3, speed: 6 }
};

// Timer and scoring variables
let timeLeft = 60;
let lastTime = 0;
let gameOver = false;
let requiredPoints = 100;
let levelStartScore = 0;
let totalScore = 0;
let highScore = 0;

// Sound system variables
let sounds = {
  grab: null,
  drop: null,
  collect: null,
  levelUp: null,
  gameOver: null
};

// Power-up definitions
const POWERUP_TYPES = {
  MAGNET: {
    color: '#9b59b6',
    duration: 5000,
    description: 'Magnetic Claw',
    effect: () => { claw.size *= 1.5; }
  },
  DOUBLE_POINTS: {
    color: '#ff6b00',
    duration: 10000,
    description: '2x Points',
    effect: () => { }
  },
  SLOW_TIME: {
    color: '#2ecc71',
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

// Power-up state tracking
let activePowerups = {
  MAGNET: false,
  DOUBLE_POINTS: false,
  SLOW_TIME: false
};

// Game state flags
let isTutorial = true;
let tutorialStep = 0;
let isTransitioning = false;
let transitionAlpha = 0;
let transitionDirection = 1;
let soundsLoaded = false;
let soundsEnabled = false;
let userInteracted = false;
let backgroundImg;
let gameOverImg;
let assetsLoaded = 0;
let totalAssets = 8;
let backgroundMusic;
let musicStarted = false;
let gameStarted = false;
let timerFlashAlpha = 0;
let timerFlashDirection = 1;

/***********************************
 * GAME INITIALIZATION
 ***********************************/

function preload() {
  try {
    backgroundImg = loadImage('images/main_background.png',
      () => {
        console.log('Background image loaded successfully');
        assetsLoaded++;
      },
      () => {
        console.error('Failed to load background image');
        backgroundImg = null;
        assetsLoaded++;
      }
    );

    gameOverImg = loadImage('images/game_over.png',
      () => {
        console.log('Game over image loaded successfully');
        assetsLoaded++;
      },
      () => {
        console.error('Failed to load game over image');
        gameOverImg = null;
        assetsLoaded++;
      }
    );
  } catch (e) {
    console.error('Error loading images:', e);
    backgroundImg = null;
    gameOverImg = null;
    assetsLoaded += 2;
  }

  if (window.AudioContext || window.webkitAudioContext) {
    soundsEnabled = true;
    try {
      soundFormats('mp3');
      const soundFiles = {
        grab: 'grab',
        drop: 'drop',
        collect: 'collect',
        levelUp: 'levelup',
        gameOver: 'game_over'
      };

      // Load each sound file
      for (const [key, filename] of Object.entries(soundFiles)) {
        sounds[key] = loadSound(`sounds/${filename}.mp3`,
          () => {
            console.log(`${key} sound loaded successfully`);
            assetsLoaded++;
          },
          (err) => {
            console.error(`Error loading ${key} sound:`, err);
            soundsEnabled = false;
            assetsLoaded++;
          }
        );
      }
      soundsLoaded = true;
    } catch (e) {
      console.error('Sound system initialization failed:', e);
      soundsEnabled = false;
      assetsLoaded += 5; // Count all sound files as loaded
    }
  } else {
    console.log('WebAudio not supported in this browser');
    soundsEnabled = false;
    assetsLoaded += 5; // Count all sound files as loaded
  }

  // Modify the preload function's background music loading part
  try {
    backgroundMusic = loadSound('sounds/background_sound.mp3',
      () => {
        console.log('Background music loaded successfully');
        // Don't set volume here, wait until we actually play
        assetsLoaded++;
      },
      (err) => {
        console.error('Error loading background music:', err);
        backgroundMusic = null;
        assetsLoaded++;
      }
    );
  } catch (e) {
    console.error('Error loading background music:', e);
    backgroundMusic = null;
    assetsLoaded++;
  }
}

/**
 * Initializes the game environment and canvas.
 * Creates an 720x550 pixel playing field and sets up the first level.
 * This is called once when the game starts.
 */
function setup() {
  console.log('Setup running...');

  // Calculate canvas size based on available space
  let availableWidth = windowWidth * 0.76 - windowWidth * 0.02; // 76% of window minus 2vw padding
  let availableHeight = windowHeight * 0.96; // 96vh

  // Maintain aspect ratio while fitting available space
  let canvasWidth = min(availableWidth, availableHeight * 1.18);
  let canvasHeight = canvasWidth / 1.18;

  // Create canvas with calculated dimensions
  createCanvas(canvasWidth, canvasHeight);

  // Rest of your setup code
  loadHighScore();
  resetLevel(level);
  textFont('Press Start 2P');

  // Add a slight delay before starting music to ensure everything is loaded
  setTimeout(() => {
    startBackgroundMusic();
  }, 1000);

  // If sounds haven't loaded after 3 seconds, disable them and continue
  setTimeout(() => {
    if (!soundsLoaded) {
      console.log('Sound loading timed out, continuing without sound');
      soundsEnabled = false;
    }
  }, 3000);
}

// Update window resize handler
function windowResized() {
  let availableWidth = windowWidth * 0.76 - windowWidth * 0.02;
  let availableHeight = windowHeight * 0.96;

  let canvasWidth = min(availableWidth, availableHeight * 1.18);
  let canvasHeight = canvasWidth / 1.18;

  resizeCanvas(canvasWidth, canvasHeight);

  if (claw) {
    claw.x = constrain(claw.x, 50, width - 50);
    claw.y = constrain(claw.y, 50, height - 50);
  }
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

  // Reset timer but only start counting if game has started
  timeLeft = 60;
  if (gameStarted) {
    lastTime = millis();
  }
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
  if (!gameStarted) {
    // Show waiting screen
    background(0);
    push();
    setStandardText(16);
    textAlign(CENTER, CENTER);
    text('PRESS ANY KEY TO START', width / 2, height / 2);
    pop();
    return;
  }

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

  // Draw background
  if (backgroundImg) {
    // Draw the background image
    image(backgroundImg, 10, 10, width - 20, height - 20);
  } else {
    // Fallback to black background if image fails to load
    background(0);
  }

  // Draw game border
  stroke('#ff6b00'); // Orange border
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
  const speed = claw.speed;
  if (keyIsDown(LEFT_ARROW)) {
    claw.x = constrain(claw.x - speed, 50, width - 50);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    claw.x = constrain(claw.x + speed, 50, width - 50);
  }
  if (keyIsDown(DOWN_ARROW)) {
    claw.y = constrain(claw.y + speed, 50, height - 50);
  }
  if (keyIsDown(UP_ARROW)) {
    claw.y = constrain(claw.y - speed, 50, height - 50);
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

  // Optimize claw physics
  claw.swingVelocity += sin(claw.angle) * gameLevel[difficulty].swingForce;
  claw.angle += claw.swingVelocity;
  claw.angle = constrain(claw.angle, -PI / 4, PI / 4); // Limit swing angle
  claw.swingVelocity *= 0.99;

  let actualX = claw.x + sin(claw.angle) * 10;

  // Update selected balls more efficiently
  for (let ball of selectedBalls) {
    if (!claw.open) {
      ball.x = actualX;
      ball.y = claw.y + chainLength;
      ball.vx = 0;
      ball.vy = 0;
    } else {
      ball.vy = constrain(ball.vy + gravity, -10, 10);
      ball.y = constrain(ball.y + ball.vy, ball.size / 2, height - ball.size / 2);
      ball.x = constrain(ball.x + ball.vx, 50, width - 50);
    }
  }

  // Optimize free ball physics
  for (let ball of balls) {
    if (!ball.selected) {
      let d = dist(claw.x, claw.y + 20, ball.x, ball.y);

      // Simplified escape behavior
      if (d < claw.size * 1.5 && random() < 0.15) {
        let angle = atan2(ball.y - (claw.y + 20), ball.x - claw.x);
        ball.vx = cos(angle) * 2.5;
        ball.vy = sin(angle) * 2.5;
      }

      // Update position with constraints
      ball.x = constrain(ball.x + ball.vx, 50, width - 50);
      ball.y = constrain(ball.y + ball.vy, 100, height - 50);

      // Bounce handling
      if (ball.x <= 50 || ball.x >= width - 50) ball.vx *= -0.8;
      if (ball.y <= 100 || ball.y >= height - 50) ball.vy *= -0.8;

      // Apply friction
      ball.vx *= 0.99;
      ball.vy *= 0.99;
    }
  }
}

/**
 * Draws all balls in the game
 */
function drawBalls() {
  for (let ball of balls) {
    push();
    if (ball.isPowerup) {
      // Power-up balls
      fill(ball.color);
      stroke(255);
      strokeWeight(2);
      circle(ball.x, ball.y, ball.size * 1.2);

      // Add a simple sparkle effect
      noFill();
      stroke(255);
      strokeWeight(1);
      rotate(ball.sparkleAngle);
      line(ball.x - ball.size, ball.y, ball.x + ball.size, ball.y);
      line(ball.x, ball.y - ball.size, ball.x, ball.y + ball.size);
      ball.sparkleAngle += 0.05;
    } else {
      // Normal balls
      fill(255); // White fill
      if (ball.selected) {
        stroke('#ff6b00'); // Orange stroke for selected balls
        strokeWeight(2);
      } else {
        noStroke();
      }
      circle(ball.x, ball.y, ball.size);
    }
    pop();
  }
}

/**
 * Draws the claw and its chain
 */
function drawClaw() {
  let actualX = claw.x + sin(claw.angle) * 10;
  stroke('#ff6b00'); // Change from black (0) to orange
  strokeWeight(3); // Made slightly thicker for better visibility

  // Draw chain/rope
  line(claw.x, 0, actualX, claw.y);

  // Draw claw parts
  if (claw.open) {
    // Open claw
    line(actualX - 20, claw.y, actualX - 10, claw.y + 20);
    line(actualX + 20, claw.y, actualX + 10, claw.y + 20);
  } else {
    // Closed claw
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
  // Enable audio on first key press
  enableAudio();

  // Start the game on first key press
  if (!gameStarted) {
    gameStarted = true;
    // Reset the timer and last time to start fresh
    timeLeft = 60;
    lastTime = millis();
    return;
  }

  if (key === ' ') {
    if (gameOver) {
      // Reset game
      gameOver = false;
      score = 0;
      totalScore = 0;
      level = 1;
      collectedBalls = [];
      resetLevel(level);

      // Restart background music with a slight delay
      setTimeout(() => {
        startBackgroundMusic();
      }, 500);
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
  messageText.style.fontFamily = "'Press Start 2P', cursive";
  messageDiv.style.display = 'block';

  // Use green background for points, orange for lost ball
  messageDiv.style.backgroundColor = text.includes('+') ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 107, 0, 0.2)';

  // Clear any existing timeout
  if (messageDiv.hideTimeout) {
    clearTimeout(messageDiv.hideTimeout);
  }

  let duration = text.includes('+') ? 1000 : 2000;
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
  push();
  setStandardText(clamp(width * 0.04, 18, 24)); // Increased from 0.03 to 0.04, min from 14 to 18, max from 18 to 24
  textAlign(LEFT, TOP);

  // Calculate position relative to canvas size
  let xPos = width * 0.05;
  let yPos = height * 0.05;
  let spacing = height * 0.08; // Increased from 0.06 to 0.08 for better spacing with larger text

  // Draw semi-transparent background for better readability
  noStroke();
  fill(0, 0, 0, 180);
  rect(xPos - 15, yPos - 15, width * 0.3, spacing * 2 + 30, 8); // Made background larger to accommodate bigger text

  // Time display with flashing effect when low on time
  if (timeLeft <= 10) {
    // Update flash effect
    timerFlashAlpha += timerFlashDirection * 15;
    if (timerFlashAlpha >= 255 || timerFlashAlpha <= 0) {
      timerFlashDirection *= -1;
    }
    fill(255, 0, 0, timerFlashAlpha); // Red with flashing
  } else {
    fill('#ff6b00'); // Normal orange color
  }
  text(`Time: ${timeLeft}s`, xPos, yPos);

  // Required points display with color based on progress
  let progressColor = score >= requiredPoints ? '#2ecc71' : '#ff6b00'; // Green if met, orange if not
  fill(progressColor);
  text(`Required: ${requiredPoints}`, xPos, yPos + spacing);

  // Show current score for comparison
  fill('#ff6b00');
  text(`Score: ${score}`, xPos, yPos + spacing * 2);
  pop();
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
  // Stop background music with error handling
  if (backgroundMusic && backgroundMusic.isPlaying()) {
    try {
      backgroundMusic.stop();
      musicStarted = false;
      console.log('Background music stopped');
    } catch (e) {
      console.error('Error stopping background music:', e);
    }
  }

  // Draw game over background
  if (gameOverImg) {
    // Clear any existing background
    background(0);
    // Draw only the game over image
    image(gameOverImg, 0, 0, width, height);
  } else {
    background(0); // Black background as fallback
  }

  let finalScore = totalScore + score;
  let newHighScore = updateHighScore(finalScore);

  // Add semi-transparent overlay to ensure text is readable
  fill(0, 0, 0, 150);
  rect(0, height / 2 - 100, width, 220);

  push();
  setStandardText(24);
  textAlign(CENTER, CENTER);
  text('GAME OVER', width / 2, height / 2 - 60);

  setStandardText(16);
  text(`Level ${level} Score: ${score}`, width / 2, height / 2 - 20);
  text(`Total Score: ${finalScore}`, width / 2, height / 2 + 10);
  text(`High Score: ${highScore}`, width / 2, height / 2 + 40);

  if (newHighScore) {
    fill('#2ecc71'); // Keep green for new high score
    text('NEW HIGH SCORE!', width / 2, height / 2 + 70);
  }

  fill('#ff6b00');
  text('Press SPACE to restart', width / 2, height / 2 + 100);
  pop();

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

  push();
  fill(0, 0, 0, 200);
  rect(0, height - 100, width, 100);

  setStandardText(clamp(width * 0.02, 10, 14));
  textAlign(CENTER, CENTER);
  text(messages[tutorialStep], width / 2, height - 50);
  pop();

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
  background(0);
  fill(0, 0, 0, transitionAlpha);
  rect(0, 0, width, height);

  if (transitionAlpha > 0) {
    setStandardText(32);
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
  push();
  setStandardText(clamp(width * 0.02, 10, 14));
  textAlign(LEFT, TOP);

  Object.entries(activePowerups).forEach(([type, active]) => {
    if (active) {
      fill(POWERUP_TYPES[type].color);
      text(`${POWERUP_TYPES[type].description} ACTIVE`, 20, y);
      y += 20;
    }
  });
  pop();
}

// Add this new function to handle music start
function startBackgroundMusic() {
  if (backgroundMusic && soundsEnabled && !musicStarted && userInteracted) {
    try {
      console.log('Attempting to start background music...');
      backgroundMusic.setVolume(0.4);
      backgroundMusic.loop();
      musicStarted = true;
      console.log('Background music started successfully');
    } catch (e) {
      console.error('Error starting background music:', e);
    }
  } else {
    console.log('Music not started because:', {
      musicExists: !!backgroundMusic,
      soundEnabled: soundsEnabled,
      alreadyStarted: musicStarted,
      userHasInteracted: userInteracted
    });
  }
}

// Simplify the enableAudio function
function enableAudio() {
  if (!userInteracted) {
    userInteracted = true;
    soundsEnabled = true;

    // Hide only the audio message
    const audioMessage = document.getElementById('audio-message');
    if (audioMessage) audioMessage.style.display = 'none';

    // Start background music if it's loaded
    if (backgroundMusic) {
      try {
        getAudioContext().resume().then(() => {
          console.log('Audio context resumed');
          backgroundMusic.setVolume(0.4);
          backgroundMusic.loop();
          musicStarted = true;
          console.log('Background music started after user interaction');
        });
      } catch (e) {
        console.error('Error starting background music:', e);
      }
    }
  }
}

// Add this function to handle audio context
function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  return false;
}

// Add this function to handle mouse clicks
function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  return false;
}

// Add this function at the top to standardize text styling
function setStandardText(size = 12) {
  textFont('Press Start 2P');
  textSize(size);
  fill('#ff6b00'); // Orange color to match instructions
  noStroke();
}

// Helper function for responsive text sizing
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
} 