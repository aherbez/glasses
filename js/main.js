/**
 * Simple web-based CAD tool for modifying glasses
 * 
 * author: Adrian Herbez
 * adrianherbez.net
 * aherbez@gmail.com
*/

const WIDTH = 800;
const HEIGHT = 600;

let renderer, scene, camera, controls;
let material = null;
let exporter = null;
let objExporter = null;
let downloadLink = null;
let object = null;
let glasses = null;

function init()
{
    exporter = new THREE.STLExporter();
    downloadLink = document.createElement('a');
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    objExporter = new THREE.OBJExporter();

    let canvas = document.getElementById("editor");
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    
    const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );

    renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setClearColor(0xFFFFFF, 1.0);
    renderer.setSize(WIDTH, HEIGHT);

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    camera.position.set(0, 5, 20);
    controls.update();

    // using a MeshNormalMaterial makes it easy to see the shape
    material = new THREE.MeshNormalMaterial();

    /*
    material = new THREE.LineBasicMaterial( {
        color: 0xffffff,
        linewidth: 1,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin:  'round', //ignored by WebGLRenderer
        wireframe: true
    } );
    */

    glasses = new Glasses();
    scene.add(glasses.root);

    // updateGeo();
    render();
}

function editBridge() {
    glasses.setEditMode(1);
}

function editEyes() {
    glasses.setEditMode(2);
}

function editFrame() {
    glasses.setEditMode(3);
}

function changeColor(dir) {
    glasses.changeColor(dir);
}

function changeLensColor(dir) {
    glasses.changeLensColor(dir);
}


function render()
{
    renderer.render(scene, camera);

    if (glasses.isDirty) {
        glasses.updateGeo();
    }

    controls.update();
    requestAnimationFrame(render);
}

function exportSTL()
{
    
    let resultSTL = exporter.parse(glasses.root);
    downloadLink.href = URL.createObjectURL(new Blob([resultSTL], {type: 'text/plain'}));
    downloadLink.download = 'object.stl';
    downloadLink.click();
    
    /*
    let resultOBJ = objExporter.parse(glasses.root);
    downloadLink.href = URL.createObjectURL(new Blob([resultSTL], {type: 'text/plain'}));
    downloadLink.download = 'object.obj';
    downloadLink.click();
    */
}

window.onload = init;
