import { THREE, OrbitControls, EffectComposer } from './dependencies.js';
import { Model } from './model.js';
export interface ISelectionItem {
    modelId: number;
    objectId: number;
}
/**
 * Main viewer class.
 */
export declare class Viewer extends EventTarget {
    protected canvas: HTMLCanvasElement;
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
     */
    constructor(canvas: HTMLCanvasElement);
    protected initializeScene(): THREE.Scene;
    protected initializeCamera(): THREE.Camera;
    protected initializeRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer;
    protected initializeEffects(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): EffectComposer;
    protected initializeControls(camera: THREE.Camera, canvas: HTMLCanvasElement): OrbitControls;
    protected updateEnvironment(): void;
    /**
     * Adds model to the viewer scene.
     * @param {Model} model Model to be added.
     */
    addModel(model: Model): void;
    /**
     * Retrieves model by its ID.
     * @param modelId Model ID.
     */
    getModel(modelId: number): Model;
    /**
     * Removes model from the viewer scene.
     * @param {Model} model Model to be added.
     */
    removeModel(model: Model): void;
    /**
     * Start the rendering loop.
     */
    start(): void;
    onRender(): void;
    onResize(): void;
    onClick(ev: MouseEvent): void;
    setSelection(list: ISelectionItem[]): void;
    getSelection(): ISelectionItem[];
    enumSelection(): IterableIterator<ISelectionItem>;
}
//# sourceMappingURL=viewer.d.ts.map