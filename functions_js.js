function run_game(quality){
// general vars
var world_index=0;
var World_size=5000;
var game_stage=0;
var allow_jump=1;
var init_cam_animation=World_size;
var mycanvas = $("#Renderer_canvas");
var innerHeight = $("#Renderer_canvas").height();
var innerWidth = $("#Renderer_canvas").width();
var current_map =1;
var maps_limit=2;
// controler settings
var speed=500;
var jump=10000;

//fps counters
var d = new Date();
var seconds=0;
var fps=0;

/********* 
Basics init START
*********/
// add physics wrapper
var microphysics = new THREEx.Microphysics();
microphysics.start();
// add keyboard listener
var keyboard = new THREEx.KeyboardState();

// scene, camera, renderer
var scene = new THREE.Scene();
if(quality==1){
	var renderer = new THREE.WebGLRenderer( {canvas: mycanvas.get(0),antialias: true });
}else if(quality==0){
	var renderer = new THREE.WebGLRenderer({canvas: mycanvas.get(0) });
}
renderer.setSize( innerWidth, innerHeight );
document.body.appendChild( renderer.domElement );
var camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, World_size*10 );
camera.position.set( -World_size, 0, 400);


// add light origin from 0,160,400(camera) lack of green
var pointLight = new THREE.PointLight(0xffaaff);
pointLight.position.set( -World_size, 0, 450);
scene.add(pointLight);


// add character (20 radius ball image)
if(quality==1){
	var characterGeometry = new THREE.SphereGeometry(20, 100, 100);
}else if(quality==0){
	var characterGeometry = new THREE.SphereGeometry(20);
}
var characterMaterial = new THREE.MeshLambertMaterial({ color: 0x00aaff });
var character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.set( -World_size, 30, 0);
microphysics.bindMesh(character,{physics: { restitution   : 0.2 }});
scene.add(character);


// add sandbox (World) (5000 radius skytexture image)
var skyTexture = new THREE.ImageUtils.loadTexture("images/night_sky_hd.jpg");
var World = new THREE.Mesh(
	new THREE.SphereGeometry(World_size*2, 300, 300), 
	new THREE.MeshBasicMaterial({ map:skyTexture, side: THREE.BackSide })
);
world_index=0;
scene.add(World);


// add gravity
microphysics.world().add(new vphy.LinearAccelerator({
  x   :  0,
  y   : -9.8*20,
  z   :  0
}));

/********* 
Basics init END
*********/



/********* 
Other Functions START
*********/
//Remove the world's children objects from the scene
function clear_world(){
	for ( var i = World.children.length - 1; i >= 0 ; i -- ) {
		World.remove(World.children[ i ]);
	}
	microphysics = new THREEx.Microphysics();
	microphysics.start();
	microphysics.bindMesh(character,{physics: { restitution   : 0.2 }});
	microphysics.world().add(new vphy.LinearAccelerator({
	  x   :  0,
	  y   : -9.8*20,
	  z   :  0
	}));
	world_index=0;
}

// reset the game
function reset_game(){
	microphysics.body(character).setPosition(-World_size,0,0);
	microphysics.body(character).setVelocity(0,0,0);
	microphysics.body(character).accelerate(0,0,0);
	pointLight.position.set(-World_size,0,450);
	camera.position.set(-World_size,0,400);
	microphysics.body(character).accelerate(0,0,0);
	game_stage=0;
	$('#messages').html('');
}
/********* 
Other Functions END
*********/



/********* 
Map init START
*********/
	/********* 
	Map materials START
	*********/
//make land function
function makeborder(side) {
	var border = new THREE.Mesh(
		new THREE.BoxGeometry(200,World_size,50),
		new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0 })
		
	); 
	if(side=='start'){
	
		border.position.set(-150 -World_size,0,0);
		
		var starting_block = new THREE.Mesh(
			new THREE.BoxGeometry(100,270,50),
			new THREE.MeshLambertMaterial({ color: 0x0000ff})
		); 
		starting_block.position.set(world_index*100 -World_size,-155,0);
		microphysics.bindMesh(starting_block,{physics: { restitution   : 0 }});
		microphysics.body(starting_block).events.on('contact', function(event, otherBody){
			allow_jump=1;
		});
		World.add(starting_block);
		world_index++;
		
	}else if(side=='end'){
	
		var finish_block = new THREE.Mesh(
			new THREE.BoxGeometry(100,270,50),
			new THREE.MeshLambertMaterial({ color: 0xff0000})
		); 
		finish_block.position.set(world_index*100 -World_size,-155,0);
		microphysics.bindMesh(finish_block,{physics: { restitution   : 0 }});
		microphysics.body(finish_block).events.on('contact', function(event, otherBody){
			allow_jump=1;
			game_stage =3;
		});
		World.add(finish_block);
		
		world_index++;
		border.position.set(world_index*100 +50 -World_size,0,0);
		
	}
	microphysics.bindMesh(border,{physics: { restitution   : 0 }});
	World.add(border);
	
}
//make land function
function makeland(quantity, transparent) {
	for(var i =0; i<quantity; i++){
		if(transparent==0){
			//upper land 
			var land_upper = new THREE.Mesh(
				new THREE.BoxGeometry(100,50,50),
				new THREE.MeshLambertMaterial({ color: 0x1ef896 })
				
			); 
			land_upper.position.set(world_index*100 -World_size,-45,0);
			microphysics.bindMesh(land_upper,{physics: { restitution   : 0.1 }});
			microphysics.body(land_upper).events.on('contact', function(event, otherBody){
				allow_jump=1;
			});
			World.add(land_upper);
			
			
			
			// bottom land
			var land_bottom = new THREE.Mesh(
				new THREE.BoxGeometry(100,220,50),
				new THREE.MeshLambertMaterial({ color: 0xaa7243 })
				
			); 
			land_bottom.position.set(world_index*100 -World_size,-180,0);
			microphysics.bindMesh(land_bottom,{physics: { restitution   : 0.5 }});
			World.add(land_bottom);
		}
		world_index++;
	}
}
//make land function
function makeice(quantity, transparent) {
	for(var i =0; i<quantity; i++){
		if(transparent==0){
			//upper land 
			var land_upper = new THREE.Mesh(
				new THREE.BoxGeometry(100,50,50),
				new THREE.MeshLambertMaterial({ color: 0x1e98f6 })
				
			); 
			land_upper.position.set(world_index*100 -World_size,-45,0);
			microphysics.bindMesh(land_upper,{physics: { restitution   : 0.8 }});
			microphysics.body(land_upper).events.on('contact', function(event, otherBody){
				allow_jump=1;
			});
			World.add(land_upper);
			
			
			
			// bottom land
			var land_bottom = new THREE.Mesh(
				new THREE.BoxGeometry(100,220,50),
				new THREE.MeshLambertMaterial({ color: 0xaa7273 })
				
			); 
			land_bottom.position.set(world_index*100 -World_size,-180,0);
			microphysics.bindMesh(land_bottom,{physics: { restitution   : 0.5 }});
			World.add(land_bottom);
		}
		world_index++;
	}
}
	/********* 
	Map materials END
	*********/

	/********* 
	Map structure START
	*********/
function Map_One(){
	makeborder('start');
	makeland(4,0); // 4 lands
	makeland(1,1); // 1 space
	makeland(3,0); // 3 lands 
	makeland(1,1); // 1 space
	makeland(2,0); // 2 lands 
	makeland(2,1); // 2 space
	makeland(1,0); // 1 land 
	makeland(1,1); // 1 space
	makeland(1,0); // 1 land
	makeland(2,1); // 2 space
	makeland(1,0); // 1 land
	makeland(4,1); // 4 space
	makeland(2,0); // 2 land
	makeland(4,1); // 4 space
	makeland(1,0); // 1 land
	makeland(4,1); // 4 space
	makeland(5,0); // 5 land
	makeland(5,1); // 5 space
	makeland(1,0); // 1 land
	makeborder('end');
}
function Map_Two(){
	makeborder('start');
	makeland(4,0); // 	4 	land
	makeland(5,1); // 	5 	space
	makeland(1,0); // 	1 	land
	makeland(2,1); // 	5 	space
	makeland(1,0); // 	1 	land
	makeland(3,1); // 	3 	space
	makeice(4,0); // 	4 	ice
	makeland(8,1); // 	5 	space
	makeland(1,0); // 	1 	land
	makeborder('end');
}
	/********* 
	Map structure END
	*********/
	Map_One();
/********* 
Map init END
*********/

// render loop
function render() {	
	if(game_stage==0){					// BEGINNING STAGE
		if(init_cam_animation==0){
			game_stage=1;
		}else{
			camera.position.set( -World_size +init_cam_animation, 0 +init_cam_animation/4, 400 +init_cam_animation/2);
			init_cam_animation-=World_size/50;
		}
	}else if (game_stage ==1){  		// MAIN GAME STAGE
		// keyboard commands		
		if( keyboard.pressed("A") ) {
			if(camera.position.x > -World_size){
				microphysics.body(character).accelerate(-speed,0,0);
			}
		}
		if( keyboard.pressed("D") ) {
			if(camera.position.x < World_size){
				microphysics.body(character).accelerate(speed,0,0);
			}
		}
		if( keyboard.pressed("W") || keyboard.pressed("space") ) {
			if(allow_jump == 1){
				microphysics.body(character).accelerate(0,jump,0);
				allow_jump=0;
			}
		}
		if( keyboard.pressed("R") ) {
			reset_game();
		}
		
		if(pointLight.position.y < -100){
			game_stage=2;
		}
		// center the light and camera
		var pos = microphysics.body(character).getPosition();
		pointLight.position.set( pos[0], pos[1], 450);
		camera.position.set(pos[0], pos[1], 400);
		
		// limit the movement speed
		var vel = microphysics.body(character).getVelocity();
		if(vel[0] >5) { vel[0]=4.99; }
		if(vel[1] >5) { vel[0]=4.99; }
		microphysics.body(character).setVelocity(vel[0],vel[1],0);
		
	}else if (game_stage ==2){				// GAME OVER STAGE
		var pos = microphysics.body(character).getPosition();
		if(pos[2]>= 400 || pos[1] < -200){
			reset_game();
		}else{
			microphysics.body(character).setPosition(pos[0], pos[1], pos[2]+5);
		}
		
		// center the light and camera
		var pos = microphysics.body(character).getPosition();
		pointLight.position.set( pos[0], pos[1], 450);
		camera.position.set(pos[0], pos[1], 400);
	}else if (game_stage ==3){				// GAME WINNER STAGE
		if(current_map != maps_limit){
			$('#messages').html("<center>WINNER ! ! ! <br><span id='submessage'>Press ENTER for the Next map<br/>Press R for reset</span></center>");
			
			if( keyboard.pressed("enter") ) {
				clear_world();
				Map_Two();
				init_cam_animation=World_size;
				reset_game();
				//current_map += 1:
			}
		}else{
			$('#messages').html("<center>WINNER ! ! ! <br><span id='submessage'>Congratulations you finished the game<br/>Press R for reset</span></center>");
		}
		if( keyboard.pressed("R") ) {
			reset_game();
		}
	}

	
	microphysics.update();   
	renderer.render(scene, camera);
	requestAnimationFrame(render);
	
	
	
}
render();

}


$( document ).ready(function() {
    run_game(0);
});
