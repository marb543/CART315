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
steps in real life, as the steps they play through in the game are actual instructions about how to make an item.

Here are some key elements of the Sewing Master game.

- Avatar Customization : Players can customize their avatars. Including chnaging their clothes, hair accessories
-
-