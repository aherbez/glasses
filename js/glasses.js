class DynamicGeo {
    constructor() {
        this.geo = new THREE.Geometry();
        this.geoDirty = false;
    
        this.uvScale = new THREE.Vector2(1,1);
        this.uvOffset = new THREE.Vector2(0,0);

        this.currColor = 0;
        this.numColors = 8;
    }

    _addFace(a, b, c) {
        this.geo.faces.push(new THREE.Face3(a, b, c));
    }

    _addUVs(uvs) {
        this.geo.faceVertexUvs[0].push(uvs.map(uv => uv.clone().multiply(this.uvScale).add(this.uvOffset)));
    }

    _finalizeGeo() {
        this.geo.verticesNeedUpdate = true;
        this.geo.elementsNeedUpdate = true;
        this.geo.computeFaceNormals();
        this.geoDirty = false;
    }

    toMesh(mat) {
        return new THREE.Mesh(this.geo, mat);
    }

    get mesh() {
        return this.geo;
    }

    get isDirty() {
        return this.geoDirty;
    }

    changeColor(dir) {
        this.currColor += dir;
        if (this.currColor < 0) this.currColor = this.numColors - 1;
        if (this.currColor >= this.numColors) this.currColor = 0;
    }

    // override
    updateGeo() {}

}

class WireBasedGeo extends DynamicGeo {
    constructor() {
        super();
        this.basePoints = [];
        this.currIndex = 0;

        this.frontUvs = this.makeQuadUVs(0, 1, 0.5, 0.75);
        this.topUvs = this.makeQuadUVs(0, 1, 0.75, 1);
        this.botUvs = this.makeQuadUVs(0, 1, 0.25, 0.5);
        this.backUvs = this.makeQuadUVs(0, 1, 0, 0.25);

        this.uvScale.setX(0.125);
        this.uvScale.setY(0.125);

        this.uvOffset.setX(0.125 * 0);
        this.uvOffset.setY(0.125 * 0);
    }

    nextVert() {
        this.currIndex = (this.currIndex + 1) % this.basePoints.length;
    }

    prevVert() {
        this.currIndex--;
        if (this.currIndex < 0) {
            this.currIndex = this.basePoints.length-1;
        }
    }

    makeQuadUVs(minX, maxX, minY, maxY) {        
        return [
            [   
                new THREE.Vector2(minX, maxY), 
                new THREE.Vector2(minX, minY), 
                new THREE.Vector2(maxX, maxY)],
            [
                new THREE.Vector2(minX, minY),
                new THREE.Vector2(maxX, minY),
                new THREE.Vector2(maxX, maxY)
            ]
        ];
    }

    get points() {
        return [...this.basePoints];
    }

    // overrides
    tweakVert(x, y, d) {}
    getHelperPos() {}
}

class Glasses extends DynamicGeo {
    constructor() {
        super();
        
        this.base = new THREE.Object3D();


        this.material = new THREE.MeshNormalMaterial({
            side: THREE.DoubleSide
        });
        this.lensMaterial = new THREE.MeshNormalMaterial();

        this.tex = new THREE.TextureLoader();
        this.tex.setCrossOrigin('anonymous');
        this.tex.load('http://www.adrianherbez.net/glasses/01/images/uv_mapper.jpg', (texture) => {
            
            console.log('loaded texture');
            this.material = new THREE.MeshBasicMaterial({
                map: texture
            });
            this.material.needsUpdate = true;

            this.lensMaterial = new THREE.MeshBasicMaterial({
                map: texture
            });
            this.material.needsUpdate = true;

            this.updateGeo();
        });

        this.editHelper = new THREE.AxesHelper(5);
        this.base.add(this.editHelper);
        this.editHelper.visible = false;


        this.eyeFrameGeo = new EyeFrameGeo();
        this.sideGeo = new FrameSideGeo();
        this.bridgeGeo = new FrameBridgeGeo();
        this.lensGeo = new LensGeo();
    
        this.updateGeo();

        document.addEventListener('keydown', this.onKeydown.bind(this));
        
        this.currentlyEditing = this.bridgeGeo; // this.eyeFrameGeo;   
    }

    changeColor(dir) {
        if (this.currentlyEditing === this.bridgeGeo) {
            this.bridgeGeo.changeColor(dir);
        }

        if (this.currentlyEditing === this.eyeFrameGeo) {
            this.eyeFrameGeo.changeColor(dir);
        }

        if (this.currentlyEditing === this.sideGeo) {
            this.sideGeo.changeColor(dir);
        }
    }

    changeLensColor(dir) {
        this.lensGeo.changeColor(dir);
    }

    setEditMode(mode) {
        switch (mode) {
            case 0:
                this.currentlyEditing = null;
                break;
            case 1:
                this.currentlyEditing = this.bridgeGeo;
                break;
            case 2:
                this.currentlyEditing = this.eyeFrameGeo;
                break;
            case 3:
                this.currentlyEditing = this.sideGeo;
                break;
        }

        this._updateAxesWidget();
    }

    _updateAxesWidget() {
        if (this.currentlyEditing !== null) {
            this.editHelper.visible = true;
            
            if (this.currentlyEditing === this.bridgeGeo) {
                this.editHelper.position.copy(this.bridgeRight.position.clone().add(this.bridgeGeo.getHelperPos()));
            }

            if (this.currentlyEditing === this.eyeFrameGeo) {
                this.editHelper.position.copy(this.eyeRight.position.clone().add(this.eyeFrameGeo.getHelperPos()));
            }

            if (this.currentlyEditing === this.sideGeo) {
                this.editHelper.position.copy(this.sideRight.position.clone().add(this.sideGeo.getHelperPos()));
            }

        } else {
            this.editHelper.visible = false;
        }
    }

    onKeydown(evt) {

        let tweakAmt = 0.2;

        let geoDirty = false;
        switch (evt.keyCode) {
            case 32:
                // this.currentlyEditing = this.sideGeo;
                break;
            case 65:
                //left
                this.currentlyEditing?.tweakVert(-tweakAmt, 0, 0);
                geoDirty = true;
                break;
            case 68:
                // right
                this.currentlyEditing?.tweakVert(tweakAmt, 0, 0);
                geoDirty = true;
                break;
            case 87:
                // up
                this.currentlyEditing?.tweakVert(0, tweakAmt, 0);
                geoDirty = true;
                break;
            case 83:
                // down
                this.currentlyEditing?.tweakVert(0, -tweakAmt, 0);
                geoDirty = true;
                break;
            case 81:
                // prev
                this.currentlyEditing?.prevVert();
                break;
            case 69:
                // next
                this.currentlyEditing?.nextVert();
                break;
            case 90:
                // less thick
                this.currentlyEditing?.tweakVert(0, 0, -tweakAmt);
                geoDirty = true;
                break;
            case 88:
                // more thick
                this.currentlyEditing?.tweakVert(0, 0, tweakAmt);
                geoDirty = true;
                break;
        }

        if (geoDirty) this.updateGeo();
        this._updateAxesWidget();
    }

    get isDirty() {
        return this.eyeFrameGeo.isDirty || this.sideGeo.isDirty;
    }

    get root() {
        return this.base;
    }

    _updatePositions() {
        this.eyeRight.position.x = 3.5;
        this.eyeRight.position.z = 7.4;

        this.eyeLeft.position.x = -3.5;
        this.eyeLeft.scale.x = -1;
        this.eyeLeft.position.z = 7.4;

        this.sideRight.position.x = 6;
        this.sideLeft.position.x = -6;
        this.sideLeft.scale.x = -1;

        this.bridgeRight.position.z = 7.4;
        this.bridgeLeft.position.z = 7.4;
        this.bridgeLeft.scale.x = -1;

        this.lensRight.position.x = 3.5;
        this.lensRight.position.z = 7.5;

        this.lensLeft.position.x = -3.5;
        this.lensLeft.position.z = 7.5;
        this.lensLeft.scale.x = -1;
    }

    updateGeo() {
        if (this.eyeRight) {
            this.base.remove(this.eyeRight);
        }
        if (this.eyeLeft) {
            this.base.remove(this.eyeLeft);
        }

        this.eyeFrameGeo.updateGeo();
        
        this.eyeRight = this.eyeFrameGeo.toMesh(this.material);
        this.base.add(this.eyeRight);
        this.eyeLeft = this.eyeFrameGeo.toMesh(this.material);
        this.base.add(this.eyeLeft);
    
        if (this.sideRight) {
            this.base.remove(this.sideRight);
        }
        if (this.sideLeft) {
            this.base.remove(this.sideLeft);
        }
        this.sideGeo.updateGeo();

        this.sideRight = this.sideGeo.toMesh(this.material);
        this.base.add(this.sideRight);
        this.sideLeft = this.sideGeo.toMesh(this.material);
        this.base.add(this.sideLeft);

        if (this.bridgeRight) {
            this.base.remove(this.bridgeRight);
        }
        if (this.bridgeLeft) {
            this.base.remove(this.bridgeLeft);
        }
        this.bridgeGeo.updateGeo();
        this.bridgeRight = this.bridgeGeo.toMesh(this.material);
        this.base.add(this.bridgeRight);
        this.bridgeLeft = this.bridgeGeo.toMesh(this.material);
        this.base.add(this.bridgeLeft);

        if (this.lensRight) {
            this.base.remove(this.lensRight);
        }
        if (this.lensLeft) {
            this.base.remove(this.lensLeft);
        }
        this.lensGeo.points = this.eyeFrameGeo.points;
        this.lensGeo.updateGeo();
        this.lensRight = this.lensGeo.toMesh(this.material);
        this.base.add(this.lensRight);
        this.lensLeft = this.lensGeo.toMesh(this.material);
        this.base.add(this.lensLeft);

        this._updatePositions();
    }
}

class LensGeo extends DynamicGeo {
    constructor() {
        super();

        this.uvScale.setX(0.125);
        this.uvScale.setY(0.125);

        this.uvOffset.setX(0.125 * 0);
        this.uvOffset.setY(0.125 * 1);

    }

    set points(pts) {
        this.basePoints = pts;
    }

    changeColor(dir) {
        super.changeColor(dir);

        this.uvOffset.setX(0.125 * this.currColor);
        this.updateGeo();
    }

    updateGeo() {
        let g = this.geo;
        g.vertices = [];
        g.faces = [];
        g.faceVertexUvs[0] = [];

        let accum = [0,0];

        let uExtents = [Infinity, -Infinity];
        let vExtents = [Infinity, -Infinity];

        this.basePoints.forEach(p => {
            let newPt = new THREE.Vector3(p[0], p[1], 0);
            accum[0] += p[0];
            accum[1] += p[1];

            uExtents[0] = Math.min(uExtents[0], p[0]);
            uExtents[1] = Math.max(uExtents[1], p[0]);

            vExtents[0] = Math.min(vExtents[0], p[1]);
            vExtents[1] = Math.max(vExtents[1], p[1]);

            g.vertices.push(newPt);
        });

        let center = new THREE.Vector3(accum[0], accum[1], 0);
        center.multiplyScalar(1 / this.basePoints.length);
        g.vertices.push(center);

        let uTotal = uExtents[1] - uExtents[0];
        let vTotal = vExtents[1] - vExtents[0];

        let scaleVect = new THREE.Vector2(1/(uExtents[1] - uExtents[0]), 1/(vExtents[1] - vExtents[0]));

        for (let i=0; i < this.basePoints.length; i++) {
            let nextI = (i+1) % this.basePoints.length;

            this._addFace(i, this.basePoints.length, nextI);
            
            let uv0 = new THREE.Vector2(this.basePoints[i][0], this.basePoints[i][1]);
            let uv1 = new THREE.Vector2(0.5, 0.5);
            let uv2 = new THREE.Vector2(this.basePoints[nextI][0], this.basePoints[nextI][1]);
            
            uv0.multiply(scaleVect).add(uv1);
            uv2.multiply(scaleVect).add(uv1);

            // g.faceVertexUvs[0].push([uv0, uv1, uv2]);
            this._addUVs([uv0, uv1, uv2]);
        }

        this._finalizeGeo();

    }
}

class FrameBridgeGeo extends WireBasedGeo {
    constructor() {
        super();
        
        this.basePoints = [
            [0, 1.2, 0.4],
            [0.368, 1.164, 0.4],
            [0.817, 1.046, 0.4]
        ];
        
        this.thickness = 0.2;

        this.updateGeo();
    }

    changeColor(dir) {
        super.changeColor(dir);

        this.uvOffset.setX(0.125 * this.currColor);
        this.updateGeo();
    }

    tweakVert(x, y, d) {
        this.basePoints[this.currIndex][0] += x;
        this.basePoints[this.currIndex][1] += y;
        this.basePoints[this.currIndex][2] += d;

        this.basePoints[0][0] = 0;
    }

    _addLoop(p) {
        // console.log(`adding ${p}`);

        let g = this.geo;

        let curr = new THREE.Vector3(p[0], p[1], 0);
        let l = curr.clone().normalize().multiplyScalar(p[2]/2);

        let depthOffset = new THREE.Vector3(0, 0, 0.2);

        g.vertices.push(curr.clone().add(l).add(depthOffset));
        g.vertices.push(curr.clone().sub(l).add(depthOffset));
        g.vertices.push(curr.clone().sub(l));
        g.vertices.push(curr.clone().add(l));
    }

    updateGeo() {

        let g = this.geo;
        g.vertices = [];
        g.faces = [];
        g.faceVertexUvs[0] = [];

        this.basePoints.forEach(this._addLoop.bind(this));

        for (let i=0; i < this.basePoints.length-1; i++) {

            let curr = i * 4;
            let next = ((i + 1) % this.basePoints.length) * 4;

            // front faces
            g.faces.push(new THREE.Face3(curr, curr+1, next));
            g.faces.push(new THREE.Face3(curr+1, next+1, next));
            this._addUVs(this.frontUvs[0]);
            this._addUVs(this.frontUvs[1]);

            // outer faces
            g.faces.push(new THREE.Face3(curr+3, curr, next+3));
            g.faces.push(new THREE.Face3(curr, next, next+3));
            this._addUVs(this.topUvs[0]);
            this._addUVs(this.topUvs[1]);

            // inner faces
            g.faces.push(new THREE.Face3(curr+1, curr+2, next+1));
            g.faces.push(new THREE.Face3(curr+2, next+2, next+1));
            this._addUVs(this.botUvs[0]);
            this._addUVs(this.botUvs[1]);
            
            // back faces
            g.faces.push(new THREE.Face3(next+3, next+2, curr+3));
            g.faces.push(new THREE.Face3(next+2, curr+2, curr+3));
            this._addUVs(this.backUvs[0]);
            this._addUVs(this.backUvs[1]);

        }

        this._finalizeGeo();
    }

    getHelperPos() {
        return new THREE.Vector3(this.basePoints[this.currIndex][0], this.basePoints[this.currIndex][1], 0);
    }
}

class FrameSideGeo extends WireBasedGeo {
    constructor() {
        super();

        this.basePoints = [
            [0.731, 7.382, 0.42],
            [0.887, 4.227, 0.42],
            [0.951, 1.525, 0.42],
            [0.951, -0.194, 0.42],
            [1.10, -2.004, 0.42],
            [0.576, -3.167, 0.42],
            [-0.354, -4.525, 0.42],
            [-0.560, -4.895, 0.42]
        ];

        this.connectorDepth = 0.2;

        this.geoDirty = true;

    }


    changeColor(dir) {
        super.changeColor(dir);

        this.uvOffset.setX(0.125 * this.currColor);
        this.updateGeo();
    }

    tweakVert(x, y, d) {
        this.basePoints[this.currIndex][1] -= x;
        this.basePoints[this.currIndex][0] += y;
        this.basePoints[this.currIndex][2] += d;

        if (this.basePoints[this.currIndex][2] < 0.1) {
            this.basePoints[this.currIndex][2] = 0.1;
        }
    }

    getHelperPos() {
        return new THREE.Vector3(0, this.basePoints[this.currIndex][0], this.basePoints[this.currIndex][1]);
    }

    _addLoop(p, pNext, flip = false) {
        let g = this.geo;

        let curr = new THREE.Vector3(0, p[0], p[1]);
        let diff = new THREE.Vector3(0, pNext[0], pNext[1]);
        diff.sub(curr);

        let posX = new THREE.Vector3(1, 0, 0);
        diff.cross(posX);


        let l = diff.normalize().multiplyScalar(-p[2]/2);
        if (flip) {
            l.multiplyScalar(-1);
        }

        let depthOffset = new THREE.Vector3(0.2, 0, 0);

        g.vertices.push(curr.clone().add(l).add(depthOffset));
        g.vertices.push(curr.clone().sub(l).add(depthOffset));
        g.vertices.push(curr.clone().sub(l));
        g.vertices.push(curr.clone().add(l));
    }

    _addConnectorVerts() {
        let g = this.geo;
        
        let offset = new THREE.Vector3(-this.connectorDepth, 0, 0);

        let a = g.vertices[3].clone();
        a.setZ(a.z + g.vertices[0].x);
        
        let b = g.vertices[2].clone();
        b.setZ(b.z + g.vertices[1].x);

        let c = a.clone().add(offset);
        let d = b.clone().add(offset);
        let e = g.vertices[2].clone().add(offset);
        let f = g.vertices[3].clone().add(offset);

        g.vertices.push(a);
        g.vertices.push(b);
        g.vertices.push(c);
        g.vertices.push(d);
        g.vertices.push(e);
        g.vertices.push(f);
    }


    updateGeo() {

        let g = this.geo;
        g.vertices = [];
        g.faces = [];
        g.faceVertexUvs[0] = [];

        // this.basePoints.forEach(this._addLoop.bind(this));
        this.basePoints.forEach((p, i) => {
            if (i === this.basePoints.length - 1) {
                this._addLoop(p, this.basePoints[this.basePoints.length-2], true);
            } else {
                this._addLoop(p, this.basePoints[i+1]);
            }
        });

        this._addConnectorVerts();
        /*
            0--2--4--
            |  |  |
            1--3--5--

            A--C
            |  |
            B--D
        */
        let maxFace = 10; //
        for (let i=0; i < this.basePoints.length-1; i++) {

            let curr = i * 4;
            let next = ((i + 1) % this.basePoints.length) * 4;

            // front faces
            g.faces.push(new THREE.Face3(curr, curr+1, next));
            g.faces.push(new THREE.Face3(curr+1, next+1, next));
            this._addUVs(this.frontUvs[0]);
            this._addUVs(this.frontUvs[1]);            

            // outer faces
            g.faces.push(new THREE.Face3(curr+3, curr, next+3));
            g.faces.push(new THREE.Face3(curr, next, next+3));
            this._addUVs(this.topUvs[0]);
            this._addUVs(this.topUvs[1]);

            // inner faces
            g.faces.push(new THREE.Face3(curr+1, curr+2, next+1));
            g.faces.push(new THREE.Face3(curr+2, next+2, next+1));
            this._addUVs(this.botUvs[0]);
            this._addUVs(this.botUvs[1]);

            // back faces
            g.faces.push(new THREE.Face3(next+3, next+2, curr+3));
            g.faces.push(new THREE.Face3(next+2, curr+2, curr+3));
            this._addUVs(this.backUvs[0]);
            this._addUVs(this.backUvs[1]);
        }

        // cap off the end
        /*
            0-3
            |/|
            1-2
        */
        let lastFaceStart = (this.basePoints.length - 1) * 4;
        this._addFace(lastFaceStart, lastFaceStart+1, lastFaceStart+3);
        this._addFace(lastFaceStart+1, lastFaceStart+2, lastFaceStart+3);
        this._addUVs(this.backUvs[0]);
        this._addUVs(this.backUvs[1]);


        // add faces for connector bit
        let conStartI = lastFaceStart + 4;
        this._addFace(conStartI, 0, 3);
        this._addUVs(this.frontUvs[0]);
        this._addFace(conStartI+1, 2, 1);
        this._addUVs(this.frontUvs[0]);

        this._addFace(conStartI, conStartI+1, 0);
        this._addFace(conStartI+1, 1, 0);
        this._addUVs(this.frontUvs[0]);
        this._addUVs(this.frontUvs[1]);

        this._addFace(conStartI+2, conStartI+3, conStartI);
        this._addFace(conStartI+3, conStartI+1, conStartI);
        this._addUVs(this.frontUvs[0]);
        this._addUVs(this.frontUvs[1]);

        this._addFace(conStartI+5, conStartI+2, 3);
        this._addFace(conStartI+2, conStartI, 3);
        this._addUVs(this.topUvs[0]);
        this._addUVs(this.topUvs[1]);
        
        this._addFace(conStartI+3, conStartI+4, conStartI+1);
        this._addFace(conStartI+4, 2, conStartI+1);
        this._addUVs(this.botUvs[0]);
        this._addUVs(this.botUvs[1]);
        
        this._addFace(3, 2, conStartI+5);
        this._addFace(2, conStartI+4, conStartI+5);
        this._addUVs(this.backUvs[0]);
        this._addUVs(this.backUvs[1]);

        this._addFace(conStartI+5, conStartI+4, conStartI+2);
        this._addFace(conStartI+4, conStartI+3, conStartI+2);
        this._addUVs(this.frontUvs[0]);
        this._addUVs(this.frontUvs[1]);
        
        this._finalizeGeo();
    }
}


class EyeFrameGeo extends WireBasedGeo {
    constructor() {
        super();
        
        this.basePoints = [
            [-1.787, 1.922, 0.43],
            [0, 2.111, 0.43],
            [1.344, 1.978, 0.43],
            [2.186, 1.287, 0.43],
            [2.464, 0.919, 0.43],
            [2.520, 0.300, 0.43],
            [2.498, -0.374, 0.43],
            [2.058, -1.500, 0.43],
            [1.021, -2.174, 0.43],
            [-0.773, -1.973, 0.43],
            [-1.899, -1.037, 0.43],
            [-2.473, 0.122, 0.43],
            [-2.584, 0.964, 0.43]
        ];

        this.geoDirty = true;

    }

    changeColor(dir) {
        super.changeColor(dir);

        this.uvOffset.setX(0.125 * this.currColor);
        this.updateGeo();
    }    

    tweakVert(x, y, d) {
        this.basePoints[this.currIndex][0] += x;
        this.basePoints[this.currIndex][1] += y;
        this.basePoints[this.currIndex][2] += d;
    }

    getHelperPos() {
        return new THREE.Vector3(this.basePoints[this.currIndex][0], this.basePoints[this.currIndex][1], 0);
    }

    _addLoop(p) {
        // console.log(`adding ${p}`);

        let g = this.geo;

        let curr = new THREE.Vector3(p[0], p[1], 0);
        let l = curr.clone().normalize().multiplyScalar(p[2]/2);

        let depthOffset = new THREE.Vector3(0, 0, 0.2);

        g.vertices.push(curr.clone().add(l).add(depthOffset));
        g.vertices.push(curr.clone().sub(l).add(depthOffset));
        g.vertices.push(curr.clone().sub(l));
        g.vertices.push(curr.clone().add(l));
    }

    updateGeo() {
        let g = this.geo;
        g.vertices = [];
        g.faces = [];
        g.faceVertexUvs[0] = [];

        this.basePoints.forEach(this._addLoop.bind(this));

        /*
            0--2--4--
            |  |  |
            1--3--5--

            A--C
            |  |
            B--D
        */
        for (let i=0; i < this.basePoints.length; i++) {

            let curr = i * 4;
            let next = ((i + 1) % this.basePoints.length) * 4;

            // front faces
            g.faces.push(new THREE.Face3(curr, curr+1, next));
            g.faces.push(new THREE.Face3(curr+1, next+1, next));
            this._addUVs(this.frontUvs[0]);
            this._addUVs(this.frontUvs[1]);

            // outer faces
            g.faces.push(new THREE.Face3(curr+3, curr, next+3));
            g.faces.push(new THREE.Face3(curr, next, next+3));
            this._addUVs(this.topUvs[0]);
            this._addUVs(this.topUvs[1]);

            // inner faces
            g.faces.push(new THREE.Face3(curr+1, curr+2, next+1));
            g.faces.push(new THREE.Face3(curr+2, next+2, next+1));
            this._addUVs(this.botUvs[0]);
            this._addUVs(this.botUvs[1]);

            // back faces
            g.faces.push(new THREE.Face3(next+3, next+2, curr+3));
            g.faces.push(new THREE.Face3(next+2, curr+2, curr+3));
            this._addUVs(this.backUvs[0]);
            this._addUVs(this.backUvs[1]);
        }

        this._finalizeGeo();
    }
}