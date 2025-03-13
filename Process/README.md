# Process Journal

## Tiny Game | 01.23.25


### Dumb Ways to Fall Level 1 Design :  
 
I began the design of the first level of my small platformer game. I first got familiar with the elements of PocketPlatform which is a tool on itch.io that allows users to quickly design a platformer game with the look and the feel of a Mario game. I first began with exploring how to set the background of the game, and added decorative elements like clouds. I also wanted to interact with dangerous objects of the game like the fire spots so when the player touches them he instantly restarts the level because the character instantly died. 

![This is a photo of the level 1](./Media/TinyThing1.png)
 
I then continued to design the first level. I got more familiar with other objects of the game such as ice  blocks which are slippery to make it harder for the player to reach the end of the level. I also added an enemy to the beginner to the game as well as an underground passage where the player can collect double 
ability to jump. 

![This is a photo of the level 1](./Media/TinyThing2.png)
 
As I continued the design of the first level I have encountered issues like trying to make a challenging enough level for the player. I feel like so far the level that I have designed is a bit too easy so I found the portal object in the platform designer and placed it in the secret passage  which would teleport the player to the end of the level. I also added blocks that disappear when they are touched. 

![This is a photo of the level 1](./Media/TinyThing3.png)

For the end of the level I added some difficulty to the game which is to place secret objects on blocks which when touched, instantly kill the player. I also placed a sign which instructs the player to find a secret passage. I also added a second portal to the beginning which is easier to reach if the player falls from the ice blocks. 

![This is a photo of the level 1](./Media/TinyThing4.png)
 
### Level 2 Design :  
 
For the design of the second level I have begun making it look pretty by adding clouds. 

![This is a photo of the level 2](./Media/TinyThing5.png)

I continued the design of the second level by making it winter themed. I added an underground passage with enemies that the player will have to cross if he wishes to collect coins. In fact, I implemented a coin system for this level . There is also a hole in the blocks so if the player falls through to the right he 
instantly dies.  

![This is a photo of the level 2](./Media/TinyThing6.png)
 
While continuing to work on the level, I have added a rocket launcher so when the player jumps on blocks to the end of the level, he has to do so quickly enough or he will get eliminated. The player must also jump on the purple blocks quickly enough because the purple blocks disappear when they are touched. 

![This is a photo of the level 2](./Media/TinyThing7.png)
 
Finally to end the level, I have put fire and spiky blocks so if the player falls he instantly restarts the level. If quick enough, the player can also collect coins . However, this part of the level is a trap because it’s virtually impossible for the player to get to the end of the level. 

![This is a photo of the level 2](./Media/TinyThing8.png)
 
We tested my game in class, and people loved it. They even tried to speed run the game. 

## floatSquare | 01.30.25

### Prototyping with Unity :  

For this first Unity prototype, I have had a lot of issues with instaling Unity on my laptop. I have reinstalled the program several times and have changed editor versions. I have found that version 6000.0.34f1 works best on my computer. I also had to disable roles of Windows Defender because my Unity Projects were not building. Finally, I had to reinstall packages to make my project run without errors.

Since I have spent so much time debugging Unity , and my project, I did not have time to build an in-depth prototype on Unity. Instead, I have focused on learning the basics of Unity by following a 2D tutorial, and trying to replicate the same result on my end on unity. Here is the tutorial that I have followed for this prototype : https://www.youtube.com/watch?v=XtQMytORBmM&ab_channel=GameMaker%27sToolkit. In the future, I wish to modify this game to create a improved and more intresting version of floppy bird, a well-loved game that I used to play on my phone when I was younger.

![This is a photo of my first Unity Prototype](./Media/floatSquare_1.png)

I started my prototype by creating a Bird GameObject, and setting the .png bird image  as the Sprite Rendere Image. I also added a RigidBody object which would allow me to move the bird object.

![This is a photo of my first Unity Prototype](./Media/floatSquare_2.png)

I added a Circle Collider on my Bird object. I also created a script BirdScript which would allow me to control the bird object with the touch of the space bar. As you see, I was having issues with the script file that was not recognizing the 2DRigidBody.

![This is a photo of my first Unity Prototype](./Media/floatSquare_3.png)

Here is a screenshot of my BirdScript.cs file where the Update method implements control of the KeyCode.Space.

![This is a photo of my first Unity Prototype](./Media/floatSquare_4.png)

I started by creating A Pipe GameObject with two GameObjects inside it including a Top Pipe and a Bottom Pipe. Each GameObject has a Pipe .png image set inside a Sprite Rendered. Also, each Pipe has a Script file to control the speed and position.

![This is a photo of my first Unity Prototype](./Media/floatSquare_5.png)

Here is a screenshot of the PipeMoveScript which controls the speed and transforms the position of each pipe.

![This is a photo of my first Unity Prototype](./Media/floatSquare_6.png)

I created a prefabricated object Pipe which contains the Top and Bottom Pipe objects. I also created a PipeSpawner script which geneartes Pipe objects as you play the game.

## floatSquare part 2 | 02.06.25

### Prototyping with Unity :  

I decided to continue working on my protype from last week this week, because the game was 
missing things like a points system, a game over system, and more controls.
Here is a screenshot of what the game looks like at the beginning of this 
prototype with the bird jumping through pipes.

![This is a photo of my second Unity Prototype](./Media/floatSquare_7.png)

To make sure the bird disappears after it touches the pipe that is not in between
the pipes.

![This is a photo of my second Unity Prototype](./Media/floatSquare_8.png)

In this message you can see me adding a box collider in between the space of both pipes.
I will also be adding a script file to the middle of the prefabricated
pipe object.

![This is a photo of my second Unity Prototype](./Media/floatSquare_9.png)

In this script, I am adding a getter for a Logic tag script. To make sure this works 
in Unity, I need to add a Logic tag.

![This is a photo of my second Unity Prototype](./Media/floatSquare_10.png)

In the SampleScene I am adding a new text object after a score text object.
I also added a Restart button under the GameOver text which triggers the game 
restard when pressed.

![This is a photo of my second Unity Prototype](./Media/floatSquare_11.png)

The LogicScript.cs file is responsible for implementing the game logic.
It implements logic like score increase, game restard, and game over.

![This is a photo of my second Unity Prototype](./Media/floatSquare_12.png)

## Sewing Master | 02.13.25

### Prototyping with Storyboard :

![This is a photo of Storyboard prototype](./Media/SewingMaster.jpeg)

For this week, I decided to try a new form of prototyping with StoryBoard. This 
is a prototype for a sewing game. The sewing game would be available for tablet-type devices and will allow users to play through different levels 
of sewing an item . At the same time users are encouraged to follow the game
steps in real life, as the steps they play through in the game are actual instructions about how to sew an item while they learn the basics of the sewing skills.

Here are some key elements of the Sewing Master game.

- Avatar Customization : Players can customize their avatars. Including changing their clothes, hair accessories
- Increased difficulty with the levels : As the player progresses
in their knowledge with sewing, and completes more levels, the difficulty 
of the game increases. 
- Possibility to select different stiching and Sewing Machine tools according
to the tools that the user has at home : This would allow for better learning 
for the player as it would be easier for them to follow the same steps in real life as they learn to use their tools.
- Possibility to learn extra points : Players can earn extra points by submitting pictures of their finished product to the game.
- Unlock exclusive levels with new patterns and tutorials by competing with other users globally : This would encourage players to complete more levels of the game and rank higher on the global leaderboard.

## Light Orbs | 02.20.25

### Prototyping with Storyboard :

![This is a photo of Storyboard prototype](./Media/light_orbs-1.jpeg)

For today's week I had the idea to create a game prototype where a player 
plays as a light orb where light is a limited resource . As the player 
goes through a labyrinth light from their orb which is their character.
The player must collect lights as they go though the labyrinth. Shasow monsters
roam the labyrinth, and steal your light source. Can you escape these shadow 
monsters and reach the end of the tunnel before you run out of light ?

# Gameplay 

- Some parts of the tunnel only appear when you shine enough light
on them.
- Enemies can sense your movement, and steal your light as you move 
through shadows 
- Staying too long in one place dims your light of your orb.
- You can dim or increase your glow as you go through the tunnel.
- Levels increase difficulty as you move through them 
- As the level number increases, the number of monsters increase.
- Secret shadow paths are opened as the player advances through the tunnel.

## The Bat that Wasn't | 03.05.25

### Main Idea : 
For my first iteration prototype, I have chosen my idea of doing a 2D platformer video game where you play as a bat against mice.
I have gotten this idea in class while thinking of a funny plot twist for a horror-themed video game. In fact, the game would begin
as you, Dracula accidentally transforming into a mouse. Dracula would be forced to survive in a world of mice. However, when reaching
a higher level in the videogame Dracula would be able to transform into a bat. The game would be based around puzzles, and
trying to solve these puzzles. 

![This is a photo of the game cover prototype](./Media/bats_mice_cover.webp)

### Questions I am trying to answer : 

1. What would be an intresting name for my game ? 
2. What kind of puzzles, enemies, and obstacles can I integrate into the game ?
3. How many levels would my game be ?
4. How can I implement humour as a core feeling in my game to keep users engaged ?

### Describe the type of prototype :

This prototype is a look/feel and role concept with a closer look at 
main plotline and design of characters. My main goal for this prototype 
is to showcase the uniqueness of my 2D Platformer. Since my game centers 
around Dracula, and mice, I want my game to be in a humoristic gothic style.

![This is a photo of character design ](./Media/bats_mice_character_design.webp)

### Fidelity level of the prototype :

For this first prototype, I am currently dealing with fidelity at conceptual level.
I want to be closer to finishing brainstorming for the main elements of the game such as 
look, character design, name, main gameplay mechanics. This would allow me to work more
in detail with the visual aspect of the game in my next prototype as I will already have
my starting assets to begin developping each level.

![This is a photo of an example level for the game ](./Media/bats_mice_example_level.webp)

### Learned Lessons 
- Humoristic storylines, and an attractive level-design can make the game more engaging for players.
- Changing between the mice/bat form as Dracula could allow me to use different mechanics when it comes 
to navigating puzzle-style levels.
- Character development is crucial when it comes to game design. In fact, it makes the story feel more rich.

### Next Steps 
- Write a detailed storyline and  script for each of the levels.
- Create a first-level prototype applying the visual style of the first prototype.
- Reflect on game mechanics. What kind of functionalities will the game have. 
- Create and test the early transformation mechanic when Dracula turns into a mouse.


## Fang & Claw: A Grabby Situation | 03.13.25



![This is a demo of Fang & Claw prototype ](./Media/Fang&Claw-Prototype2.mp4)