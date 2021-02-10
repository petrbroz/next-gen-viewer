import { THREE, OrbitControls, EXRLoader, EffectComposer, RenderPass, OutlinePass } from './dependencies.js';
/**
 * Main viewer class.
 */
export class Viewer extends EventTarget {
    /**
     * Initializes new viewer in given canvas element.
     * @param {HTMLCanvasElement} canvas Hosting canvas element.
     */
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.scene = this.initializeScene();
        this.camera = this.initializeCamera();
        this.renderer = this.initializeRenderer(canvas);
        this.composer = this.initializeEffects(this.renderer, this.scene, this.camera);
        this.controls = this.initializeControls(this.camera, canvas);
        this.raycaster = new THREE.Raycaster();
        this.selection = [];
        this.canvas.addEventListener('click', this.onClick.bind(this));
        this.canvas.addEventListener('resize', this.onResize.bind(this));
    }
    initializeScene() {
        const scene = new THREE.Scene();
        return scene;
    }
    initializeCamera() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        return camera;
    }
    initializeRenderer(canvas) {
        const renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMappingExposure = 1.5;
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        new EXRLoader()
            .setDataType(THREE.FloatType)
            .load('../env/neurathen_rock_castle_1k.exr', (texture) => {
            const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
            this.envMap = exrCubeRenderTarget.texture;
            this.updateEnvironment();
            texture.dispose();
            pmremGenerator.dispose();
        });
        return renderer;
    }
    initializeEffects(renderer, scene, camera) {
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        composer.addPass(renderPass);
        const outlinePass = new OutlinePass(renderer.getDrawingBufferSize(new THREE.Vector2()), scene, camera);
        outlinePass.edgeStrength = 6.0;
        outlinePass.edgeThickness = 3.0;
        composer.addPass(outlinePass);
        return composer;
    }
    initializeControls(camera, canvas) {
        const controls = new OrbitControls(camera, canvas);
        // controls.enableDamping = true;
        // controls.dampingFactor = 0.05;
        // controls.screenSpacePanning = false;
        // controls.minDistance = 10;
        // controls.maxDistance = 100;
        // controls.maxPolarAngle = Math.PI / 2;
        controls.update();
        return controls;
    }
    updateEnvironment() {
        this.scene.background = this.envMap || null;
        this.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
                obj.material.envMap = this.envMap || null;
                obj.material.roughness = 0.5; // Just testing...
                obj.material.needsUpdate = true;
            }
        });
    }
    /**
     * Adds model to the viewer scene.
     * @param {Model} model Model to be added.
     */
    addModel(model) {
        this.scene.add(model);
        this.updateEnvironment();
    }
    /**
     * Retrieves model by its ID.
     * @param modelId Model ID.
     */
    getModel(modelId) {
        return this.scene.getObjectById(modelId);
    }
    /**
     * Removes model from the viewer scene.
     * @param {Model} model Model to be added.
     */
    removeModel(model) {
        this.selection = this.selection.filter(item => item.modelId !== model.id);
        this.scene.remove(model);
    }
    /**
     * Start the rendering loop.
     */
    start() {
        const render = () => {
            this.onRender();
            requestAnimationFrame(render);
        };
        render();
    }
    onRender() {
        this.controls.update();
        this.composer.render();
    }
    onResize() {
        const { clientWidth, clientHeight } = this.canvas;
        if (this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = clientWidth / clientHeight;
            this.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(clientWidth, clientHeight);
    }
    onClick(ev) {
        const coords = new THREE.Vector2((ev.clientX / this.canvas.clientWidth) * 2 - 1, -(ev.clientY / this.canvas.clientHeight) * 2 + 1);
        this.raycaster.setFromCamera(coords, this.camera);
        const selection = [];
        for (const model of this.scene.children) {
            const intersections = this.raycaster.intersectObject(model, true);
            if (intersections.length > 0) {
                selection.push({ modelId: model.id, objectId: parseInt(intersections[0].object.name) });
            }
        }
        this.setSelection(selection);
    }
    setSelection(list) {
        this.selection = list.slice();
        const pass = this.composer.passes.find(pass => pass instanceof OutlinePass);
        if (pass) {
            // TODO: optimize the performance
            pass.selectedObjects = [];
            for (const item of this.selection) {
                const model = this.scene.getObjectById(item.modelId);
                if (!model) {
                    continue;
                }
                const obj = model.getObjectByName(item.objectId.toString());
                if (!obj) {
                    continue;
                }
                pass.selectedObjects.push(obj);
            }
        }
        this.dispatchEvent(new Event('selection-changed'));
    }
    getSelection() {
        return this.selection.slice();
    }
    *enumSelection() {
        for (const item of this.selection) {
            yield Object.assign({}, item);
        }
    }
}
