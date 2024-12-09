import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

scene.background = new THREE.Color('#00FFFF');

const listener = new THREE.AudioListener();
camera.add( listener );

const audioElement = document.getElementById( 'music' );
audioElement.play();

const positionalAudio = new THREE.PositionalAudio( listener );
positionalAudio.setMediaElementSource( audioElement );
positionalAudio.setRefDistance( 1 );
positionalAudio.setDirectionalCone( 180, 230, 0.1 );


const helper = new PositionalAudioHelper( positionalAudio, 10);
helper.rotation.y = -250;
positionalAudio.add( helper );

const loader = new GLTFLoader();

const dirtTexture = new THREE.TextureLoader().load('Assets/dirt.jpg');
dirtTexture.wrapS = THREE.RepeatWrapping;
dirtTexture.wrapT = THREE.RepeatWrapping;
dirtTexture.repeat.set(50, 50);

const dirtMaterial = new THREE.MeshStandardMaterial({ map: dirtTexture });
const dirtGeometry = new THREE.PlaneGeometry(100, 100);
const dirt = new THREE.Mesh(dirtGeometry, dirtMaterial);
dirt.rotation.x = -Math.PI / 2;
scene.add(dirt);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new PointerLockControls( camera, renderer.domElement );

controls.pointerSpeed = 0.5;

document.addEventListener('click', () => {
    controls.lock();
}, false);
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const onKeyDown = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
};

const onKeyUp = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};



document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();




camera.position.set(0, 1.6, 5);

const clock = new THREE.Clock();

let model;

loader.load('Assets/mountain.glb', function (gltf) {
    model = gltf.scene;
    model.scale.set(20, 20, 20); // Set the scale here
    model.position.set(50, 0, 0); // Set the position here
    model.rotation.y = 349;
    model.position.y= -0.1;
    scene.add(model);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
    console.log('An error happened');
});

loader.load('Assets/BoomBox.glb', function (gltf) {
    const BoomBox = gltf.scene;
    BoomBox.position.set(37, 0, 2); // Set the position here
    BoomBox.rotation.y = 185;
    BoomBox.traverse((child) => {
        if (child.isMesh) {
            child.material.map = dirtTexture;
        }
    }
    );
    BoomBox.add(positionalAudio);
    scene.add(BoomBox);

    renderer.setAnimationLoop(animate);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
    console.log('An error happened');
});

const light = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(light);

const light2 = new THREE.DirectionalLight(0xffffff, 1);
light2.position.set(0, 1, 1);
scene.add(light2);

function animate() {
    controls.update();

    if (controls.isLocked) {
        const delta = clock.getDelta();
        velocity.x -= velocity.x * 40.0 * delta;
        velocity.z -= velocity.z * 40.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(+velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }

    renderer.render( scene, camera );
}