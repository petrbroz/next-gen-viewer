import { THREE, OrbitControls, EXRLoader, EffectComposer, RenderPass, OutlinePass } from './dependencies.js';
import { Model } from './model.js';

export interface IViewerOptions {
    /** Optional URL for fetching viewer assets such as environment maps. */
    assetsUrl?: string;
}

export interface ISelectionItem {
    modelId: number;
    objectId: number;
}

/**
 * Main viewer class.
 */
export class Viewer extends EventTarget {
    protected scene: THREE.Scene;
    protected camera: THREE.Camera;
    protected renderer: THREE.WebGLRenderer;
    protected controls: OrbitControls;
    protected composer: EffectComposer;
    protected raycaster: THREE.Raycaster;
    protected selection: ISelectionItem[];
    protected envMap?: THREE.Texture;

    /**
     * Initializes new viewer in given canvas element.
     * @param {HTMLCanvasElement} canvas Hosting canvas element.
     * @param {IViewerOptions} [options] Additional viewer options.
     */
    constructor(protected canvas: HTMLCanvasElement, protected options?: IViewerOptions) {
        super();
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

    protected initializeScene(): THREE.Scene {
        const scene = new THREE.Scene();
        return scene;
    }

    protected initializeCamera(): THREE.Camera {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        return camera;
    }

    protected initializeRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMappingExposure = 1.5;

        const assetsUrl = this.options?.assetsUrl || '../assets';
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        new EXRLoader()
            .setDataType(THREE.FloatType)
            .load(assetsUrl + '/environments/neurathen_rock_castle_1k.exr', (texture) => {
                const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                this.envMap = exrCubeRenderTarget.texture;
                this.updateEnvironment();
                texture.dispose();
                pmremGenerator.dispose();
            });

        return renderer;
    }

    protected initializeEffects(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): EffectComposer {
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        composer.addPass(renderPass);
        const outlinePass = new OutlinePass(renderer.getDrawingBufferSize(new THREE.Vector2()), scene, camera);
        outlinePass.edgeStrength = 6.0;
        outlinePass.edgeThickness = 3.0;
        composer.addPass(outlinePass);
        return composer;
    }

    protected initializeControls(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls {
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

    protected updateEnvironment() {
        this.scene.background = this.envMap || null;
        this.scene.traverse((obj: THREE.Object3D) => {
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
    public addModel(model: Model) {
        this.scene.add(model);
        this.updateEnvironment();
    }

    /**
     * Retrieves model by its ID.
     * @param modelId Model ID.
     */
    public getModel(modelId: number): Model {
        return this.scene.getObjectById(modelId) as Model;
    }

    /**
     * Removes model from the viewer scene.
     * @param {Model} model Model to be added.
     */
    public removeModel(model: Model) {
        this.selection = this.selection.filter(item => item.modelId !== model.id);
        this.scene.remove(model);
    }

    /**
     * Removes all loaded models.
     */
    public removeModels() {
        for (const child of this.scene.children) {
            this.removeModel(child as Model);
        }
    }

    /**
     * Start the rendering loop.
     */
    public start() {
        const render = () => {
            this.onRender();
            requestAnimationFrame(render);
        }
        render();
    }

    public onRender() {
        this.controls.update();
        this.composer.render();
    }

    public onResize() {
        const { clientWidth, clientHeight } = this.canvas;
        if (this.camera instanceof THREE.PerspectiveCamera) {
            this.camera.aspect = clientWidth / clientHeight;
            this.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(clientWidth, clientHeight);
    }

    public onClick(ev: MouseEvent) {
        const coords = new THREE.Vector2(
            (ev.clientX / this.canvas.clientWidth) * 2 - 1,
            -(ev.clientY / this.canvas.clientHeight) * 2 + 1
        )
        this.raycaster.setFromCamera(coords, this.camera);
        const selection: ISelectionItem[] = [];
        for (const model of this.scene.children) {
            const intersections = this.raycaster.intersectObject(model, true);
            if (intersections.length > 0) {
                selection.push({ modelId: model.id, objectId: parseInt(intersections[0].object.name) });
            }
        }
        this.setSelection(selection);
    }

    public setSelection(list: ISelectionItem[]) {
        this.selection = list.slice();
        const pass = this.composer.passes.find(pass => pass instanceof OutlinePass) as OutlinePass;
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

    public getSelection(): ISelectionItem[] {
        return this.selection.slice();
    }

    public * enumSelection(): IterableIterator<ISelectionItem> {
        for (const item of this.selection) {
            yield { ...item };
        }
    }
}