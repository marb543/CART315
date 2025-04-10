/**
 * Fang & Claw - A Vampire Bat Collection Game
 * 
 * Core Systems:
 * - Game state management and level progression
 * - Physics-based claw movement and bat behavior
 * - Power-up system with magnetic claw, double points, and slow motion
 * - Collection mechanics and scoring system
 * - Audio system with background music and sound effects
 * - UI elements and visual feedback
 * 
 * Game Flow:
 * 1. Title screen -> Story -> Tutorial -> Gameplay
 * 2. Each level requires collecting specific points within time limit
 * 3. Difficulty increases with level progression
 * 4. Power-ups appear to assist player
 * 5. Game ends when time runs out without meeting point requirement
 * 
 * Controls:
 * - Arrow keys: Move claw
 * - Spacebar: Grab/release bats
 * - Collect bats at top of screen for points
 * 
 * Technical Notes:
 * - Uses p5.js for rendering and input handling
 * - Implements HTML5 Audio for sound system
 * - Responsive canvas sizing
 * - Local storage for high score persistence
 */

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
let chainLength = 150;

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
    duration: 15000,    // Increased to 15 seconds
    description: 'Magnetic Claw',
    effect: () => { claw.size *= 1.5; }
  },
  DOUBLE_POINTS: {
    color: '#ff6b00',
    duration: 20000,   // Increased to 20 seconds
    description: '2x Points',
    effect: () => { }
  },
  SLOW_TIME: {
    color: '#2ecc71',
    duration: 15000,   // Increased to 15 seconds
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
let gameState = 'TITLE'; // 'TITLE', 'STORY', 'TUTORIAL', 'PLAYING', 'GAMEOVER'
let storyPage = 0;
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
let draculaImg;
let starterImg;
let dialogueImages = [];
let currentDialogue = 0;
let totalDialogues = 6;

// Add these variables at the top with other global variables
let batImages = {
  red: 'images/red_bat.png',
  blue: 'images/blue_bat.png',
  yellow: 'images/yellow_bat.png',
  green: 'images/green_bat.png',
  purple: 'images/purple_bat.png',
  orange: 'images/orange_bat.png'
};

// Add these variables at the top with other global variables
let powerupImages = {
  MAGNET: null,
  DOUBLE_POINTS: null,
  SLOW_TIME: null
};

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

    draculaImg = loadImage('images/dracula.png',
      () => {
        console.log('Dracula image loaded successfully');
        assetsLoaded++;
      },
      () => {
        console.error('Failed to load dracula image');
        draculaImg = null;
        assetsLoaded++;
      }
    );

    starterImg = loadImage('images/starter_image.png',
      () => {
        console.log('Starter image loaded successfully');
        assetsLoaded++;
      },
      () => {
        console.error('Failed to load starter image');
        starterImg = null;
        assetsLoaded++;
      }
    );

    // Load all dialogue images
    for (let i = 1; i <= totalDialogues; i++) {
      dialogueImages[i - 1] = loadImage(`images/dialogue${i}.png`,
        () => {
          console.log(`Dialogue ${i} image loaded successfully`);
          assetsLoaded++;
        },
        () => {
          console.error(`Failed to load dialogue ${i} image`);
          dialogueImages[i - 1] = null;
          assetsLoaded++;
        }
      );
    }

    // Load bat images
    try {
      batImages.red = loadImage('images/red_bat.png',
        () => {
          console.log('Red bat image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load red bat image');
          assetsLoaded++;
        }
      );

      batImages.blue = loadImage('images/blue_bat.png',
        () => {
          console.log('Blue bat image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load blue bat image');
          assetsLoaded++;
        }
      );

      batImages.yellow = loadImage('images/yellow_bat.png',
        () => {
          console.log('Yellow bat image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load yellow bat image');
          assetsLoaded++;
        }
      );

      batImages.green = loadImage('images/green_bat.png',
        () => {
          console.log('Green bat image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load green bat image');
          assetsLoaded++;
        }
      );

      batImages.purple = loadImage('images/purple_bat.png',
        () => {
          console.log('Purple bat image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load purple bat image');
          assetsLoaded++;
        }
      );

      batImages.orange = loadImage('images/orange_bat.png',
        () => {
          console.log('Orange bat image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load orange bat image');
          assetsLoaded++;
        }
      );
    } catch (e) {
      console.error('Error loading bat images:', e);
      assetsLoaded += 5; // Count all bat images as loaded even if they failed
    }

    // Load power-up images
    try {
      powerupImages.MAGNET = loadImage('images/magnetic_claw.png',
        () => {
          console.log('Magnetic Claw image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load magnetic claw image');
          assetsLoaded++;
        }
      );

      powerupImages.DOUBLE_POINTS = loadImage('images/double_point.png',
        () => {
          console.log('Double Points image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load double points image');
          assetsLoaded++;
        }
      );

      powerupImages.SLOW_TIME = loadImage('images/slow_motion.png',
        () => {
          console.log('Slow Motion image loaded successfully');
          assetsLoaded++;
        },
        () => {
          console.error('Failed to load slow motion image');
          assetsLoaded++;
        }
      );
    } catch (e) {
      console.error('Error loading powerup images:', e);
      assetsLoaded += 3;
    }
  } catch (e) {
    console.error('Error loading images:', e);
    backgroundImg = null;
    gameOverImg = null;
    draculaImg = null;
    starterImg = null;
    dialogueImages = Array(totalDialogues).fill(null);
    assetsLoaded += 5 + totalDialogues;
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
      size: 120,
      selected: false,
      vx: random(-baseVelocity, baseVelocity),
      vy: random(-baseVelocity, baseVelocity),
      value: getColorValue(random(colors))
    });
  }

  claw = {
    x: width / 2,
    y: 50,
    size: 240,
    open: true,
    speed: 9, // Reduced from 18 to 9 (2x slower)
    angle: 0,
    swingVelocity: 0,
    maxSwingAngle: PI / 16,
    dampening: 0.99,
    chainElasticity: 0.05
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
  if (gameState === 'TITLE') {
    drawTitleScreen();
  } else if (gameState === 'STORY') {
    drawStoryScreen();
  } else if (gameState === 'PLAYING') {
    // Clear the background first
    background(0);

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

    // Draw game background
    if (backgroundImg) {
      image(backgroundImg, 10, 10, width - 20, height - 20);
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

      if (timeLeft <= 0) {
        checkLevelCompletion();
      }
    }

    handleClawMovement();
    updatePhysics();
    drawBalls();
    drawClaw();
    updateUI();
  }
}

function drawTitleScreen() {
  background(0);
  push();

  // Load and draw starter image to fill the screen
  if (starterImg) {
    // Fill the entire canvas while maintaining aspect ratio
    let imgRatio = starterImg.width / starterImg.height;
    let canvasRatio = width / height;
    let imgWidth, imgHeight;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      imgWidth = width;
      imgHeight = width / imgRatio;
    } else {
      // Canvas is taller than image
      imgHeight = height;
      imgWidth = height * imgRatio;
    }

    // Center the image
    let x = (width - imgWidth) / 2;
    let y = (height - imgHeight) / 2;

    image(starterImg, x, y, imgWidth, imgHeight);
  }

  pop();
}

function drawStoryScreen() {
  // Set background to match the dark navy/indigo color
  background('#1a1b2f');
  push();

  // Load and draw current dialogue image
  if (dialogueImages[currentDialogue]) {
    // Calculate dimensions that preserve aspect ratio and fit within 80% of the canvas height
    let maxHeight = height * 0.8;
    let imgRatio = dialogueImages[currentDialogue].width / dialogueImages[currentDialogue].height;
    let imgHeight = maxHeight;
    let imgWidth = imgHeight * imgRatio;

    // If width is too large, scale down based on width
    if (imgWidth > width * 0.9) {
      imgWidth = width * 0.9;
      imgHeight = imgWidth / imgRatio;
    }

    // Center the image horizontally and vertically
    let x = (width - imgWidth) / 2;
    let y = (height - imgHeight) / 2;

    // Draw orange border
    stroke('#ff6b00');
    strokeWeight(4);
    noFill();
    rect(x - 10, y - 10, imgWidth + 20, imgHeight + 20, 5);

    // Draw the image with calculated dimensions
    image(dialogueImages[currentDialogue], x, y, imgWidth, imgHeight);
  }

  pop();
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

  // Direct movement without lerp for immediate response
  if (keyIsDown(LEFT_ARROW)) {
    claw.x -= speed;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    claw.x += speed;
  }
  if (keyIsDown(UP_ARROW)) {
    claw.y -= speed;
  }
  if (keyIsDown(DOWN_ARROW)) {
    claw.y += speed;
  }

  // Diagonal speed adjustment
  if ((keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)) &&
    (keyIsDown(UP_ARROW) || keyIsDown(DOWN_ARROW))) {
    claw.x = claw.x * 0.707;
    claw.y = claw.y * 0.707;
  }

  // Constrain claw position
  claw.x = constrain(claw.x, 50, width - 50);
  claw.y = constrain(claw.y, 50, height - 50);
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

  // Almost no swing effect
  let targetAngle = 0;
  if (keyIsDown(LEFT_ARROW)) targetAngle = -claw.maxSwingAngle * 0.2;
  if (keyIsDown(RIGHT_ARROW)) targetAngle = claw.maxSwingAngle * 0.2;

  // Very minimal angle transition
  claw.angle = lerp(claw.angle, targetAngle, 0.2);

  let actualX = claw.x + sin(claw.angle) * 10;

  // Update selected balls with immediate following
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

  // Update free balls with enhanced escape behavior
  for (let ball of balls) {
    if (!ball.selected) {
      let d = dist(claw.x, claw.y + 20, ball.x, ball.y);
      let escapeDistance = claw.size * 2; // Increased detection range

      // Enhanced escape behavior
      if (d < escapeDistance) {
        let escapeChance = gameLevel[difficulty].dropChance;
        // Double escape chance if not magnetic claw
        if (!activePowerups.MAGNET) escapeChance *= 2;

        if (random() < escapeChance) {
          let angle = atan2(ball.y - (claw.y + 20), ball.x - claw.x);
          let escapeSpeed = 3; // Increased from 2
          ball.vx = cos(angle) * escapeSpeed;
          ball.vy = sin(angle) * escapeSpeed;

          // Add random variation to make movement less predictable
          ball.vx += random(-0.5, 0.5);
          ball.vy += random(-0.5, 0.5);
        }
      }

      // Smoother movement with increased speed
      ball.x = constrain(ball.x + ball.vx, 50, width - 50);
      ball.y = constrain(ball.y + ball.vy, 100, height - 50);

      // More energetic bouncing
      if (ball.x <= 50 || ball.x >= width - 50) {
        ball.vx *= -1.1; // Bounce with increased velocity
        ball.vy += random(-0.5, 0.5); // Add vertical variation
      }
      if (ball.y <= 100 || ball.y >= height - 50) {
        ball.vy *= -1.1; // Bounce with increased velocity
        ball.vx += random(-0.5, 0.5); // Add horizontal variation
      }

      // Reduced friction for more persistent movement
      ball.vx *= 0.998;
      ball.vy *= 0.998;
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
      imageMode(CENTER);
      let powerupImage = powerupImages[ball.powerupType];

      if (powerupImage) {
        if (ball.selected) {
          tint(255, 255, 255, 200);
          image(powerupImage, ball.x, ball.y, ball.size * 1.2, ball.size * 1.2);
          noTint();
        } else {
          image(powerupImage, ball.x, ball.y, ball.size, ball.size);
        }

        // Fix sparkle effect
        push();
        translate(ball.x, ball.y);
        rotate(ball.sparkleAngle);
        noFill();
        stroke(255, 255, 255, 150); // Added alpha for softer effect
        strokeWeight(2);
        let sparkleSize = ball.size * 0.7; // Scale sparkle with power-up size
        line(-sparkleSize / 2, 0, sparkleSize / 2, 0);
        line(0, -sparkleSize / 2, 0, sparkleSize / 2);
        pop();

        ball.sparkleAngle += 0.05;
      }
    } else {
      // Regular bats
      if (batImages[ball.color]) {
        imageMode(CENTER);
        if (ball.selected) {
          tint(255, 255, 255, 200);
          image(batImages[ball.color], ball.x, ball.y, ball.size * 1.2, ball.size * 1.2);
          noTint();
        } else {
          image(batImages[ball.color], ball.x, ball.y, ball.size, ball.size);
        }
      }
    }
    pop();
  }
}

/**
 * Draws the claw and its chain
 */
function drawClaw() {
  let actualX = claw.x + sin(claw.angle) * 10; // Reduced from 30 to 10
  stroke('#ff6b00');
  strokeWeight(9);

  // Draw straight chain/rope
  line(claw.x, 0, actualX, claw.y);

  // Draw claw parts with less spread
  if (claw.open) {
    // Open claw (slightly reduced spread)
    line(actualX - 50, claw.y, actualX - 25, claw.y + 60);
    line(actualX + 50, claw.y, actualX + 25, claw.y + 60);
  } else {
    // Closed claw (tighter grip)
    line(actualX - 35, claw.y, actualX, claw.y + 60);
    line(actualX + 35, claw.y, actualX, claw.y + 60);
  }
}

/**
 * Updates UI elements with current game state
 */
function updateUI() {
  // Update all display values
  document.getElementById('score-display').textContent = score;
  document.getElementById('level-display').textContent = level;
  document.getElementById('time-display').textContent = timeLeft;
  document.getElementById('required-display').textContent = requiredPoints;

  // Handle time warning
  const timeValue = document.querySelector('.time-value');
  if (timeLeft <= 10) {
    timeValue.classList.add('warning');
  } else {
    timeValue.classList.remove('warning');
  }

  // Handle required points met
  const requiredValue = document.querySelector('.required-value');
  if (score >= requiredPoints) {
    requiredValue.classList.add('met');
  } else {
    requiredValue.classList.remove('met');
  }

  updateCollectionDisplay();
}

/**
 * Handles spacebar input for grabbing and releasing balls
 */
function keyPressed() {
  if (key === ' ') {
    if (gameState === 'TITLE') {
      gameState = 'STORY';
      return;
    }

    if (gameState === 'STORY') {
      currentDialogue++;
      if (currentDialogue >= totalDialogues) {
        // When we've shown all dialogues, start the game
        gameState = 'PLAYING';
        gameStarted = true;
        enableAudio();
        lastTime = millis();
        resetLevel(level);
      }
      return;
    }

    // Gameplay controls
    if (gameState === 'PLAYING') {
      if (gameOver) {
        resetGame();
        return;
      }

      if (claw.open) {
        claw.open = false;
        grabNearbyBalls();
      } else {
        claw.open = true;
        handleBallCollection();
      }
    }
  }
}

/**
 * Processes ball collection and scoring
 */
function handleBallCollection() {
  let difficulty = getCurrentDifficulty();
  let isNearTop = claw.y <= 100;

  // Create a copy of selectedBalls to avoid modification during iteration
  let ballsToProcess = [...selectedBalls];
  selectedBalls = []; // Clear the array immediately

  for (let ball of ballsToProcess) {
    if (!isNearTop) {
      dropBall(ball);
    } else if (random() < gameLevel[difficulty].dropChance) {
      dropBall(ball);
    } else {
      collectBall(ball);
    }
  }

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

  // Make sure the ball is still in the balls array
  if (!balls.includes(ball)) {
    balls.push(ball);
  }

  playSound('drop');
  if (claw.y > 100) {
    showMessage('TOO LOW!');
  } else {
    showMessage('LOST');
  }
}

/**
 * Collects a ball and adds to score
 * @param {Object} ball - The ball to collect
 */
function collectBall(ball) {
  // Immediately remove the ball from the game world
  let ballIndex = balls.indexOf(ball);
  if (ballIndex > -1) {
    balls.splice(ballIndex, 1);
  }

  if (ball.isPowerup) {
    activatePowerup(ball.powerupType);
    let powerup = POWERUP_TYPES[ball.powerupType];
    let duration = powerup.duration / 1000;
    showMessage(`${powerup.description} ACTIVATED!\n(${duration}s)`, true);
    playSound('collect');
  } else {
    let pointMultiplier = activePowerups.DOUBLE_POINTS ? 2 : 1;
    score += ball.value * pointMultiplier;
    collectedBalls.push({
      color: ball.color,
      size: ball.size
    });
    playSound('collect');
    showMessage(`+${ball.value * pointMultiplier}`);
  }
}

/**
 * Attempts to grab balls near the claw
 */
function grabNearbyBalls() {
  let maxGrabbableBalls = activePowerups.MAGNET ? 2 : 1; // Only allow multiple grabs with magnetic claw
  let grabbedCount = 0;

  for (let ball of balls) {
    if (grabbedCount >= maxGrabbableBalls) break;

    let d = dist(claw.x, claw.y + 20, ball.x, ball.y);
    if (d < claw.size && !ball.selected) {
      ball.selected = true;
      selectedBalls.push(ball);
      ball.x = claw.x;
      ball.y = claw.y + 30;
      playSound('grab');
      grabbedCount++;

      // If not magnetic claw, break after first grab
      if (!activePowerups.MAGNET) break;
    }
  }
}

/**
 * Shows a message popup
 * @param {string} text - The message to show
 */
function showMessage(text, isPowerup = false) {
  let messageDiv = document.getElementById('message');
  let messageText = document.getElementById('message-text');
  messageText.innerText = text;
  messageText.style.fontFamily = "'Press Start 2P', cursive";
  messageText.style.fontSize = "36px"; // Increase popup message text size
  messageDiv.style.display = 'block';
  messageDiv.style.padding = "30px 40px"; // Increase padding to accommodate larger text

  // Use different background colors based on message type
  if (isPowerup) {
    messageDiv.style.backgroundColor = 'rgba(155, 89, 182, 0.2)';
  } else {
    messageDiv.style.backgroundColor = text.includes('+') ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 107, 0, 0.2)';
  }

  // Clear any existing timeout
  if (messageDiv.hideTimeout) {
    clearTimeout(messageDiv.hideTimeout);
  }

  let duration = isPowerup ? 2000 : (text.includes('+') ? 1000 : 2000);
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

    // Create an img element for the bat
    const batImg = document.createElement('img');
    batImg.src = `images/${color}_bat.png`;
    batImg.className = 'bat-image';
    batImg.width = 30;
    batImg.height = 30;

    const amount = document.createElement('span');
    amount.className = 'ball-amount';
    amount.textContent = `${count}x`;

    ballType.appendChild(batImg);
    ballType.appendChild(amount);
    countDisplay.appendChild(ballType);
  });

  display.appendChild(countDisplay);

  // Scroll to the center of the collection display
  requestAnimationFrame(() => {
    const scrollHeight = display.scrollHeight;
    const clientHeight = display.clientHeight;
    const centerPosition = (scrollHeight - clientHeight) / 2;
    display.scrollTo({
      top: centerPosition,
      behavior: 'smooth'
    });
  });
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
    background(0);
    image(gameOverImg, 0, 0, width, height);
  } else {
    background(0);
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
    fill('#2ecc71');
    text('NEW HIGH SCORE!', width / 2, height / 2 + 70);
  }

  fill('#ff6b00');
  text('Press SPACE to restart', width / 2, height / 2 + 100);
  pop();
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
      size: 100,  // Changed from 25 to 100 to make power-ups 4 times bigger
      selected: false,
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      isPowerup: true,
      powerupType: powerupType,
      value: 50,
      sparkleAngle: 0
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
      // Stop the sound if it's already playing
      if (sounds[soundName].isPlaying()) {
        sounds[soundName].stop();
      }
      sounds[soundName].play();
    } catch (e) {
      console.error(`Error playing ${soundName}:`, e);
    }
  }
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

function resetGame() {
  gameState = 'TITLE';
  currentDialogue = 0;  // Reset dialogue counter
  gameOver = false;
  score = 0;
  totalScore = 0;
  level = 1;
  collectedBalls = [];
  resetLevel(level);
}

// Add new function to draw speech bubble
function drawSpeechBubble(x, y, w, h, radius) {
  push();
  fill(255, 255, 255, 200); // Changed to white with some transparency
  stroke(255); // Changed to white
  strokeWeight(2);

  // Main bubble
  rect(x, y - h / 2, w, h, radius);

  // Pointer towards Dracula
  beginShape();
  vertex(x, y);
  vertex(x - 30, y);
  vertex(x, y - 30);
  endShape(CLOSE);

  pop();
} 