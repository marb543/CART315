let balls = [];
let claw;
let selectedBalls = [];
let collectedBalls = [];
let messages = {
  red: "You caught a red ball! Hot like fire! 🔥",
  blue: "You caught a blue ball! Cool as the ocean! 🌊",
  yellow: "You caught a yellow ball! Bright as the sun! ☀️",
  lost: "Oops! The ball slipped away! 😅"
};

function setup() {
  createCanvas(800, 400);
  // Generate random balls
  for (let i = 0; i < 15; i++) {
    balls.push({
      x: random(50, width - 250),
      y: random(100, height - 50),
      color: random(['red', 'blue', 'yellow']),
      size: 30,
      selected: false
    });
  }
  
  // Initialize claw
  claw = {
    x: width/2 - 100,
    y: 50,
    size: 40,
    open: true,
    speed: 5
  };
}

function draw() {
  background(220);
  
  // Draw machine border
  stroke(0);
  strokeWeight(4);
  noFill();
  rect(10, 10, width - 250, height - 20);
  
  // Draw collection area
  fill(255);
  rect(width - 230, 10, 220, height - 20);
  textSize(20);
  fill(0);
  noStroke();
  text("Collection Area", width - 200, 40);
  
  // Draw collected balls
  for (let i = 0; i < collectedBalls.length; i++) {
    let ball = collectedBalls[i];
    let row = Math.floor(i / 4);
    let col = i % 4;
    let x = width - 200 + (col * 40);
    let y = 80 + (row * 40);
    
    fill(ball.color);
    circle(x, y, ball.size);
  }
  
  // Update claw position based on arrow keys
  if (keyIsDown(LEFT_ARROW)) {
    claw.x = max(50, claw.x - claw.speed);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    claw.x = min(width - 250 - 50, claw.x + claw.speed);
  }
  if (keyIsDown(DOWN_ARROW)) {
    claw.y = min(height - 50, claw.y + claw.speed);
  }
  if (keyIsDown(UP_ARROW)) {
    claw.y = max(50, claw.y - claw.speed);
    
    // Move selected balls with claw
    for (let ball of selectedBalls) {
      ball.y = claw.y + 30;
    }
  }

  // Draw balls
  noStroke();
  for (let ball of balls) {
    fill(ball.color);
    if (ball.selected) {
      stroke(0);
      strokeWeight(2);
    } else {
      noStroke();
    }
    circle(ball.x, ball.y, ball.size);
  }
  
  // Draw claw
  stroke(0);
  strokeWeight(2);
  line(claw.x, 0, claw.x, claw.y);
  
  // Draw claw arms
  if (claw.open) {
    line(claw.x - 20, claw.y, claw.x - 10, claw.y + 20);
    line(claw.x + 20, claw.y, claw.x + 10, claw.y + 20);
  } else {
    line(claw.x - 15, claw.y, claw.x, claw.y + 20);
    line(claw.x + 15, claw.y, claw.x, claw.y + 20);
  }
}

function keyPressed() {
  if (key === ' ') {
    claw.open = !claw.open;
    
    // When opening the claw at the top, collect or drop balls
    if (claw.open && claw.y <= 50 && selectedBalls.length > 0) {
      for (let ball of selectedBalls) {
        if (random() < 0.25) { // 25% chance to lose the ball
          ball.selected = false;
          let index = selectedBalls.indexOf(ball);
          if (index > -1) {
            selectedBalls.splice(index, 1);
          }
          ball.y = random(100, height - 50);
          showMessage('lost');
        } else {
          // Successfully collected the ball
          collectedBalls.push({
            color: ball.color,
            size: ball.size
          });
          
          // Remove from active balls
          let ballIndex = balls.indexOf(ball);
          if (ballIndex > -1) {
            balls.splice(ballIndex, 1);
          }
        }
      }
      // Clear selected balls
      selectedBalls = [];
    }
    
    // Try to grab balls when closing the claw
    if (!claw.open) {
      for (let ball of balls) {
        let d = dist(claw.x, claw.y + 20, ball.x, ball.y);
        if (d < claw.size && !ball.selected) {
          ball.selected = true;
          selectedBalls.push(ball);
          ball.x = claw.x;
          ball.y = claw.y + 30;
          showMessage(ball.color);
        }
      }
    }
  }
}

function showMessage(color) {
  let messageDiv = document.getElementById('message');
  let messageText = document.getElementById('message-text');
  messageText.innerText = messages[color];
  messageDiv.style.display = 'block';
  messageDiv.style.backgroundColor = color === 'yellow' ? '#fff7d6' : color === 'red' ? '#ffebeb' : '#ebf5ff';
}

function closeMessage() {
  document.getElementById('message').style.display = 'none';
} 