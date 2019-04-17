/*jshint esversion: 6 */
  
  var MainGame = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function MainGame (){
      Phaser.Scene.call(this, { key: 'mainGame'});
    },

    init: function (){
      
    },

    preload: function(){
      let width = this.cameras.main.width;
      let height = this.cameras.main.height; 
      let progressBar = this.add.graphics();
      let progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(80, 270, 320, 50);
      let loadingText = this.make.text({
        x: width/2,
        y: height/2 -50,
        text: 'Loading...',
        style: {
          font: '20px monospace',
          fill: '#ffffff'
        }
      });
      loadingText.setOrigin(0.5,0.5);
      let percentText = this.make.text({
        x: width/2,
        y: height/2 +20,
        text: "0%",
        style: {
          font: '18px monospace',
          fill: '#ffffff'
        }
      });
      percentText.setOrigin(0.5,0.5);
      let assetText = this.make.text({
        x: width/2,
        y: height/2+50,
        text: '',
        style: {
          font: '18px monospace',
          fill: '#ffffff'
        }
      });
      assetText.setOrigin(0.5,0.5);

      this.load.on('progress', function(value){
        percentText.setText(parseInt(value*100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect((80), 280,300*value, 30);
      });

      this.load.on('fileprogress', function(file){
        assetText.setText('Loading asset: ' + file.key);
      });

      this.load.on('complete', function(){
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
      });

      this.load.audio('coinCollectSound', 'assets/sounds/coin.wav');
      this.load.audio('bgm1', 'assets/music/falco.mp3');
      this.load.audio('bgm2', 'assets/music/africa.mp3');
      this.load.audio('bgm3', 'assets/music/bsbiwantit.mp3');
      this.load.audio('bgm4', 'assets/music/everybody_wants.mp3');
      this.load.audio('bgm5', 'assets/music/fiveonit.mp3');
      this.load.image('bg', 'assets/backgroundImage.png');
      this.load.image('side','assets/backgroundImage.png');
      this.load.image('coin','assets/sprites/star-coin.png');
      this.load.svg('ladder', 'assets/sprites/ladder.svg', {width: 70, height: 70});
      this.load.svg('boulder', 'assets/sprites/boulder.svg', {width: 70, height: 70});
      this.load.spritesheet('man', 'assets/sprites/adventurer-Sheet.png', {frameWidth: 50, frameHeight: 37 });
      this.load.spritesheet('tiles', 'assets/sprites/tiles.png',{frameWidth: 70, frameHeight: 70 });
    },
    
  
    create: function(){   

      // ladders 
      let ladderGroup;
      
      // terrain
      let bottomLayerGroup, sideSprite, rockLayerGroup;

      // keyboard listeners
      let ctrl = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
      let xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      let qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      
      // add background music
      this.music = {};
      for (let i = 1; i < 6; i++){
        this.music['song'+i] = this.sound.add('bgm'+i, {loop: true});
      }

      //play random song on start 
      this.music.nowPlaying = this.music['song'+ Phaser.Math.Between(1,5)];
      this.music.nowPlaying.play();
      
      // add sound fx
      let coinCollectSound = this.sound.add('coinCollectSound');
      this.fx = coinCollectSound;

      // add background image
      this.add.image(735,630,'bg');
    
      // create timer
      this.timer = this.time.addEvent({
        delay: 60000 ,
        repeat: 60        
      });

      // add side sprites for bounding
      sideSprite = this.physics.add.staticGroup();
      sideSprite.create(-735,630,'side');
      sideSprite.create(2205,630,'side');

      // create sprite groups function
      let createSpriteGroup = (x,y,sprite,frame,objectType,objectGroup, height=false, depth= 0)=>{
        objectGroup = objectType.create(x,y,sprite,frame);
        objectGroup.setOffset(17.5,17.5);
        objectGroup.body.width = 35; 
        objectGroup.body.height = 35;
        if (height === true){
          objectGroup.displayHeight = 35;
          objectGroup.displayWidth = 35;
        }
        if (depth !==0){
          objectGroup.setDepth(depth);
        }
        return objectGroup;
      };
    
      // create sprite groups
      bottomLayerGroup = this.physics.add.staticGroup();
      dirtLayerGroup = this.physics.add.staticGroup();
      ladderGroup = this.physics.add.staticGroup();
      rockLayerGroup = this.physics.add.group();

      // draw top layer
      for (let x = 17.5; x < 1470; x+=35)
      {
        createSpriteGroup(x, 192.5, 'tiles', [2], dirtLayerGroup, 'topObj',true,1);
      }

       // generate dirt layers  
      for (let i = 0, y = 227.5; i < 28; i++)
      {
        for (let j = 0, x = 17.5; j < 42; j++)
        {
        createSpriteGroup(x,y,'tiles',[4],dirtLayerGroup,'groundObj',true,1);
          x+=35;
        }
        y+=35;
      }

      // generate lower ground tiles
      for (let j = 0, x = 0; j < 42; j++)
          {
            createSpriteGroup(x,1225,'tiles',[14],bottomLayerGroup,'bottomObj',false,1);
            x+=70;
          }

      bottomGroup = bottomLayerGroup.getChildren();
      bottomGroup.forEach(a=> {a.setSize(70,70); a.setOffset(-2,-2);});

      // generate rocks
      let numRocks = 20;
      let dirt = dirtLayerGroup.getChildren();
      for (let i = 0; i < numRocks; i++){
        let newRandom = Phaser.Math.RND.between(0,dirt.length-1);
        let x = dirt[newRandom].x;
        let y = dirt[newRandom].y;
        dirt[newRandom].destroy();
        let newRock = rockLayerGroup.create(x+5,y,'boulder');
        newRock.body.height = 35;
        newRock.body.width = 30;
        newRock.setOffset(15,-2);
        newRock.setMass(100);
        newRock.enableBody();
         }

        
      // check if player is crushed
      let rockCrush = (player,group) => {
        group.body.setVelocityX(0);
        if (group.body.hitTest(player.x,player.y)) {
         this.anims.remove('idle');
         this.anims.pauseAll();
         this.anims.play('crushed', player);
         player.on('animationcomplete', ()=> {
          this.pauseText.visible = false;
          this.scene.pause();
          this.scene.launch("pauseScene", { nowPlaying: this.music.nowPlaying, gameState: 'crush', musicObj: this.music, fx: this.fx});
         }, this);

        }
       };

      // generate coins 
      this.coinsLeft = 0;
      let  coinQuantity = 10;
      this.coinsLeft = coinQuantity;
      coinGroup = this.physics.add.staticGroup();
      let generateCoins = (coinQuantity) =>{ 
        let max = dirtLayerGroup.getChildren().length-1;
        for (let x = 0; x < coinQuantity; x++){
          let index = Phaser.Math.RND.between(0, max);
          let x = dirtLayerGroup.getChildren()[index].x;
          let y = dirtLayerGroup.getChildren()[index].y;
          let newObj = coinGroup.create(x,y,'coin');
          newObj.setDepth(0);
            }
       };
      generateCoins(coinQuantity);
      
      // ping for coins
      let distToCoin = (x,y,distance) => {
        let coins = coinGroup.getChildren();
        let dirt = dirtLayerGroup.getChildren();
        for (let i = 0; i < coins.length; i++){
          if(coins[i].active && Phaser.Math.Distance.Between(x,y, coins[i].x,coins[i].y) <= distance){
            let closestX = coins[i].x, closestY = coins[i].y;
            for (let i = 0; i < dirt.length; i++){
            if (dirt[i].x === closestX && dirt[i].y === closestY){
                dirt[i].setTint(0xff0000);
              }
            }
          }
        }
      };
 
      // ping for coin locations
      xKey.on('up', () => { 
        distToCoin(player.x,player.y,250); 
      });
      
       // make the player
      this.player = this.physics.add.sprite(45,140,'man');
      player = this.player;
      player.setCollideWorldBounds(false).setScale(2).setSize(15,15).setOffset(15,20);
    
      // player animations
      this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('man', { start: 0, end: 3 }),
        frameRate: 10,
      });
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('man', { start: 8, end: 12}),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: 'swipe',
        frames: this.anims.generateFrameNumbers('man', { start: 26, end: 29}),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: 'crouch',
        frames: [{key:'man', frame: 59}],
        frameRate: 20
      });
      this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('man', { start:14, end: 21 }),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: 'crushed',
        frames: this.anims.generateFrameNumbers('man', { start:64, end: 68}),
        duration: 20000
      });

      // camera views
      this.cameras.main.setViewport(0,0,490,630);
      this.cameras.main.startFollow(player);
      this.cameras.main.setBounds(0,0,1470,1260);

      // set up cursor
      cursors = this.input.keyboard.createCursorKeys();

      // collider function between player and ground
      let digDirt = (player, group) => {
        let touching = group.body.touching;
        if (cursors.shift.isDown){
          if (touching.left === true && cursors.right.isDown) {
              group.disableBody(this,this);
          } else if (touching.up === true && cursors.down.isDown){
              group.disableBody(this,this);
          } else if (touching.right === true && cursors.left.isDown){
              group.disableBody(this,this);
          } else if (touching.down === true && cursors.up.isDown){
              group.disableBody(this,this);
          }
          }    
        };

      // collect coin function
      let collectCoin = (player,group) => {
        if (ctrl.isDown){
          group.disableBody(this,this);
          coinCollectSound.play();
          this.coinsLeft--;
          coinsText.setText('Coins Left: ' + this.coinsLeft);
        }
      };
      
      
      // function to make ladder above player      
      // -- TODO -- make this less shitty =D
      // this currently isn't working and that's okay, for now...
      let createLadder = () =>{
        let ladders = ladderGroup.getChildren();
        console.log(player.y);
         if (player.y > 210){
          if (ladders.length == 0){
            let newLadder = ladderGroup.create(player.x,player.y-35,'ladder');
            newLadder.body.height = 35;
            newLadder.body.width = 35;
            
            console.log("("+newLadder.x+","+newLadder.y+")");
        
          }
          for (i =0; i < ladders.length; i++){
            let playerX = player.x, playerY = player.y;
            let ladderX = ladders[i].x, ladderY = ladders[i].y;
            if (playerX !== ladderX && playerY !== ladderY){
            let newLadder = ladderGroup.create(player.x,player.y,'ladder');
            newLadder.body.height = 35;
            newLadder.body.width = 35;
            console.log("("+newLadder.x+","+newLadder.y+")");
            }  
          }
        }
      };
        
      let randomDirt = () =>{
        let dirt = dirtLayerGroup.getChildren();
        let randomNum = Phaser.Math.RND.between(0, dirt.length-1);
       };

      // make ladder above player when Q key is pressed.
      qKey.on('up', ()=>{ createLadder(); randomDirt();});
    
      // function for climbing
      let letsClimb = (player,group) =>{
        player.body.gravity.y = 0;
        player.body.setVelocityY(0);
        if ( cursors.up.isDown){
          player.body.setVelocityY(-200);
          } else if (cursors.down.isDown){
            player.body.setVelocityY(200);
          }
      };

      // add colliders and overlaps
      this.physics.add.collider(player, dirtLayerGroup, digDirt);
      this.physics.add.collider(player, sideSprite);
      this.physics.add.collider(player, bottomLayerGroup);
      this.physics.add.overlap(player, coinGroup, collectCoin, null, this);
      this.physics.add.overlap(player, ladderGroup, letsClimb );
      this.physics.add.collider(dirtLayerGroup, rockLayerGroup);
      this.physics.add.collider(rockLayerGroup, sideSprite);
      this.physics.add.collider(bottomLayerGroup, rockLayerGroup);
      this.physics.add.collider(player, rockLayerGroup, rockCrush);

      // screen text
      coinsText = this.add.text( 16,40, 'Coins Left: '+ this.coinsLeft, { fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
      coinsText.setScrollFactor(0).setDepth(2);
      timerText = this.add.text( 16,10,'Time: 0' , {fontFamily: 'verdana', fontSize: '18px', fill: '#fff'});
      timerText.setScrollFactor(0).setDepth(2);
      this.pauseText = this.add.text( 425, 10, 'Pause', {fontFamily: 'verdana', fontSize: '18px', fill: '#fff', 'align': 'right'});
      this.pauseText.setScrollFactor(0).setDepth(3).setInteractive();
      

      // pause the game on click and tell the pause screen scene which song is currently playing as well as the current
      // game state (paused, win, or lose)
      this.pauseText.on('pointerup', () => {
        this.pauseText.visible = false;
        this.scene.pause();
        this.scene.launch('pauseScene', { coinCollectSound: coinCollectSound, nowPlaying: this.music.nowPlaying, gameState: 'paused',  musicObj: this.music });
      });
      
      // resume handler
      // if the music was switched in the pause menu, set music.nowPlaying to the new track
       this.events.on('resume', (data) => {
        let soundsArr = data.scene.sound.sounds; 
        for (let i = 0; i < soundsArr.length; i++){
          if (soundsArr[i].isPlaying){
            this.music.nowPlaying = soundsArr[i];
          }
         }
        });

    },
    
    update: function(){
    
      // controls
      if (cursors.left.isDown && player.body.onFloor()){
        player.body.setVelocityX(-200);
        player.anims.play('walk',true);
        player.flipX = true;
      } else if (cursors.left.isDown){
        player.body.setVelocityX(-200);
        player.flipX = true;
      } else if (cursors.right.isDown && player.body.onFloor()){
        player.body.setVelocityX(200);
        player.anims.play('walk',true);
        player.flipX = false;
      } else if (cursors.right.isDown){
        player.body.setVelocityX(200);
        player.flipX = false;
      } else if (cursors.down.isDown){
        player.anims.play('crouch',true);
      } else{
      player.body.setVelocityX(0);
      player.anims.play('idle', true);
      }
      if (( cursors.space.isDown || cursors.up.isDown) && player.body.onFloor()){
        player.setVelocityY(-300);
        player.anims.play('jump',true);
      }
      if (!player.body.onFloor()){
        player.anims.play('jump',true);
      }
      
      // show pause text when returning from pause screen if it is not visible
      if (!this.pauseText.visible){
        this.pauseText.visible = true;
      }

  
      // timer
      mins = 60-this.timer.repeatCount;
      seconds = this.timer.getElapsedSeconds();
      milli = (this.timer.elapsed * 10).toString();
      
      if (mins < 10){
        mins = "0"+mins;
      }
      if (seconds <10){
        seconds = "0" + seconds.toString().substr(0,1);
        milli = milli.substr(1,2);
      }
      if (seconds >= 10){
        seconds = this.timer.getElapsedSeconds().toString().substr(0,2);
        milli = milli.substr(2,2);
      }
    
      timerText.setText('Time: ' + mins + ":" + seconds + ":" + milli);


        // if there are no coins left, tell pause scene that the game is over and the player won
        if (this.coinsLeft == 0){
          this.pauseText.visible = false;
          this.scene.pause();
          this.scene.launch("pauseScene", {  musicObj: this.music, nowPlaying: this.music.nowPlaying, gameState: 'win', time: mins+":"+seconds+":"+milli });
        }
      
      } 
  });



  // class for pause and end game scene
  var PauseScene = new Phaser.Class({
  
    Extends: Phaser.Scene,

    initialize:
    function PauseScene(){
      Phaser.Scene.call(this, { key: 'pauseScene'});
    },

    // get passed data from main game scene and assign to variable for use in this scene
    init: function (data){
      this.nowPlaying = data.nowPlaying;
      this.gameState = data.gameState;
      this.time = data.time;
      this.music = data.musicObj;
      this.coinCollectSound = data.coinCollectSound;
    },

    preload: function(){
      this.load.image('pauseOverlay', 'assets/images/pauseOverlay.png');
      this.load.image('restartButton', 'assets/buttons/restart.png');
      this.load.image('resumeButton', 'assets/buttons/resume.png');
      this.load.image('toggleMusic', 'assets/buttons/toggleMusic.png');
      this.load.image('toggleSounds', 'assets/buttons/toggleSounds.png');
      this.load.image('changeSong', 'assets/buttons/changeSong.png');
    },

    create: function(){
      
      // for positioning things
      let canvas = this.sys.game.canvas;
                  
      // load background image (just a white rectangle)
      pauseOverlay = this.add.image(0,0, 'pauseOverlay').setOrigin(0,0).setAlpha(0.6);
      
      coinCollectSound = this.coinCollectSound;

      // show what song is currently playing
      let songName;
      let nowPlayingText = this.add.text(16, canvas.height-40,"Now Playing: ", { fontFamily: 'monospace', fontSize: '16px', fill:'#000'});
      let songBank = {'bgm1':'falco','bgm2':'africa','bgm3':'bsb','bgm4':'tears4fears','bgm5':'igot5onit'};
      let findName = () =>{
        for (var key in songBank){
          if (this.nowPlaying.key === key){
           songName = songBank[key];
          nowPlayingText.setText("Now Playing: " + songName);
          }
        }
      };
      findName();
      
      // let player know game is paused
      gameStatusText = this.add.text ( (canvas.width/2)-100, (canvas.height/2)-250, '', { fontFamily: 'verdana', fontSize: '48px', fill: '#000'} );
      if (this.gameState == 'paused'){
        gameStatusText.setText(' Paused');
      }
      
      // pause menu buttons

      // resume game button
      resumeButton = this.add.image( canvas.width/2,gameStatusText.y+160, 'resumeButton').setScale(0.25);
      resumeButton.setInteractive();
      resumeButton.on('pointerup', () =>{
        this.scene.resume('mainGame');
        this.scene.sleep();
      });
      
      // restart game button
      restartButton = this.add.image(canvas.width/2, resumeButton.y+60, 'restartButton').setScale(0.25);
      restartButton.setInteractive();
      restartButton.on('pointerup', () =>{
        this.nowPlaying.stop();
        this.scene.start('mainGame');
      });
      
      // toggle background music button
      toggleMusicButton = this.add.image(restartButton.x,restartButton.y+60, 'toggleMusic').setScale(0.25);
      toggleMusicButton.setInteractive();
      toggleMusicButton.on('pointerup', () =>{
        if (this.nowPlaying.isPlaying){
          this.nowPlaying.pause();
        } else if (this.nowPlaying.isPaused) {
            this.nowPlaying.resume();
        }
      });

      // toggle sound fx button
      toggleSoundsButton = this.add.image(toggleMusicButton.x,toggleMusicButton.y+60,'toggleSounds').setScale(0.25);
      toggleSoundsButton.setInteractive();
      toggleSoundsButton.on('pointerup', () =>{
       if (coinCollectSound.config.mute){
         coinCollectSound.config.mute = false;
         toggleSoundsButton.setTint(0xA0A0A0);
       } else if (!this.coinCollectSound.config.mute){
         coinCollectSound.config.mute = true;
         toggleSoundsButton.clearTint();
        
         }
      });

      // change background music button
      changeSongButton = this.add.image(toggleSoundsButton.x,toggleSoundsButton.y+60,'changeSong').setScale(0.25);
      changeSongButton.setInteractive();
      changeSongButton.on('pointerup', () =>{
        this.nowPlaying.stop();
        this.nowPlaying =  this.music['song'+ Phaser.Math.Between(1,5)];
        this.nowPlaying.play();
        console.log("changed song to: " + this.nowPlaying.key);
        findName();
      });

    
      // tell the player how long it took to collect the coins
      let time = this.time;  
      let timeText = this.add.text( gameStatusText.x-20, gameStatusText.y+70, 'Your Time: '+time, { fontFamily: 'verdana', fontSize: '24px', fill: '#000'} );
      timeText.visible = false;

        
      // check to see if the player won, lost, or paused and show appropriate text
      if (this.gameState ==='win'){
        gameStatusText.setText("You Win!");
        timeText.visible = true;
        resumeButton.removeInteractive();
      } else if (this.gameState === 'lose'){
        gameStatusText.setText("You Lose!");   // a relic from a more simple time. Keeping this in just in case. 
        resumeButton.removeInteractive();
      } else if (this.gameState === 'crush'){
        gameStatusText.setText("Crushed!");
        this.nowPlaying.stop();
        resumeButton.removeInteractive();
      }
    },

    update: function () {
      // grey out toggle buttons for music and sound when they are disabled
      if (this.coinCollectSound !== undefined){
        if (this.coinCollectSound.config.mute){
          toggleSoundsButton.setTint(0xA0A0A0);
        } else if (!this.coinCollectSound.config.mute){
          toggleSoundsButton.clearTint();
          }
      }

       this.nowPlaying.isPlaying?toggleMusicButton.clearTint():toggleMusicButton.setTint(0xA0A0A0);

    }
  });
  


const config = {
  type: Phaser.Auto,
  width: 490,
  height: 630,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y:300 },
      debug: true
    }
  },
  scene: [MainGame, PauseScene]
};

// game
const game = new Phaser.Game(config);