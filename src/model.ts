import { THREE, GLTFLoader } from './dependencies.js';
import { Metadata } from './metadata.js';

/**
 * Model representing a specific viewable output of a design.
 */
export class Model extends THREE.Object3D {
    protected metadata?: Metadata;

    protected constructor(protected baseUrl: string) {
        super();
    }

    /**
     * Loads glTF model from specific location.
     * @param url Model location.
     */
    public static load(url: string): Promise<Model> {
        return new Promise<Model>(function (resolve, reject) {
            const loader = new GLTFLoader();
            loader.load(url, function onLoad(gltf) {
                const baseUrl = url.substr(0, url.lastIndexOf('/'));
                const model = new Model(baseUrl);
                model.children.push(gltf.scene);
                resolve(model);
            }, function onProgress(ev) {
                console.log((ev.loaded / ev.total * 100) + '% loaded');
            }, function onError(err) {
                reject(err);
            });
        });
    }

    /**
     * Retrieves model metadata.
     */
    async getMetadata(): Promise<Metadata> {
        if (!this.metadata) {
            this.metadata = await Metadata.load(this.baseUrl + '/..');
        }
        return this.metadata;
    }
}