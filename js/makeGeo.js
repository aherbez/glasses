
/**
 * Put your wild, weird, and wonderful code here!
 * 
 * Make sure that your makeGeo function:
 * 
 * - starts by creating a new THREE.Geometry()
 * - adds 3 or more vertices
 * - adds 1 or more faces
 * - returns the geometry object
 * 
 * Have fun!
 */

function makeGeo() {
    return makeGeoDynamicCube();
}

/**
 * Make a simple box using built-in functionality
 */
function makeBoxGeo() {
    let geo = new THREE.BoxGeometry(10, 10, 10);
    return geo;
}

/**
 * Make a simple box from scratch
 */
function makeGeoStaticCube() {
    let g = new THREE.Geometry();

    // add vertices
    g.vertices.push(new THREE.Vector3(-1, -1,  1));
    g.vertices.push(new THREE.Vector3(-1, -1, -1));
    g.vertices.push(new THREE.Vector3( 1, -1, -1));
    g.vertices.push(new THREE.Vector3( 1, -1,  1));
    g.vertices.push(new THREE.Vector3(-1,  1,  1));
    g.vertices.push(new THREE.Vector3(-1,  1, -1));
    g.vertices.push(new THREE.Vector3( 1,  1, -1));
    g.vertices.push(new THREE.Vector3( 1,  1,  1));
    
    // front
    g.faces.push(new THREE.Face3(4, 0, 3));
    g.faces.push(new THREE.Face3(4, 3, 7));
    // left
    g.faces.push(new THREE.Face3(4, 1, 0));
    g.faces.push(new THREE.Face3(5, 1, 4));
    // back
    g.faces.push(new THREE.Face3(5, 2, 1));
    g.faces.push(new THREE.Face3(6, 2, 5));
    // right
    g.faces.push(new THREE.Face3(2, 7, 3));
    g.faces.push(new THREE.Face3(2, 6, 7));
    // top
    g.faces.push(new THREE.Face3(5, 4, 7));
    g.faces.push(new THREE.Face3(6, 5, 7));
    // bottom
    g.faces.push(new THREE.Face3(1, 3, 0));
    g.faces.push(new THREE.Face3(2, 3, 1));
    
    return g;
}

/**
 * Make a box from scratch, with inputs
 */
function makeGeoDynamicCube() {

    let g = new THREE.Geometry();

    let w = parseFloat(document.getElementById("width").value) / 2;
    let h = parseFloat(document.getElementById("height").value) / 2;
    let d = parseFloat(document.getElementById("depth").value) / 2;

    // add vertices
    g.vertices.push(new THREE.Vector3(-w, -h,  d));
    g.vertices.push(new THREE.Vector3(-w, -h, -d));
    g.vertices.push(new THREE.Vector3( w, -h, -d));
    g.vertices.push(new THREE.Vector3( w, -h,  d));
    g.vertices.push(new THREE.Vector3(-w,  h,  d));
    g.vertices.push(new THREE.Vector3(-w,  h, -d));
    g.vertices.push(new THREE.Vector3( w,  h, -d));
    g.vertices.push(new THREE.Vector3( w,  h,  d));
    
    // front
    g.faces.push(new THREE.Face3(4, 0, 3));
    g.faces.push(new THREE.Face3(4, 3, 7));
    // left
    g.faces.push(new THREE.Face3(4, 1, 0));
    g.faces.push(new THREE.Face3(5, 1, 4));
    // back
    g.faces.push(new THREE.Face3(5, 2, 1));
    g.faces.push(new THREE.Face3(6, 2, 5));
    // right
    g.faces.push(new THREE.Face3(2, 7, 3));
    g.faces.push(new THREE.Face3(2, 6, 7));
    // top
    g.faces.push(new THREE.Face3(5, 4, 7));
    g.faces.push(new THREE.Face3(6, 5, 7));
    // bottom
    g.faces.push(new THREE.Face3(1, 3, 0));
    g.faces.push(new THREE.Face3(2, 3, 1));
    
    return g;
}







