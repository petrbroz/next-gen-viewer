import { THREE, GLTFLoader, DRACOLoader, MeshoptDecoder } from './dependencies.js';
import { Metadata } from './metadata.js';

export interface IModelLoadOptions {
    /**
     * Load the model using the Draco compression.
     */
    draco?: boolean;

    /**
     * Load metadata pre-emptively. Otherwise, the metadata will be loaded
     * when it is first requested.
     */
    metadata?: boolean;
}

/**
 * Model representing a specific viewable output of a design.
 */
export class Model extends THREE.Object3D {
    protected metadata?: Promise<Metadata>;

    protected constructor(protected baseUrl: string) {
        super();
    }

    /**
     * Loads glTF model from specific location.
     * @param {string} url Model location.
     * @param {IModelLoadOptions} [options] Additional loading options.
     */
    public static load(url: string, options?: IModelLoadOptions): Promise<Model> {
        return new Promise<Model>(function (resolve, reject) {
            const loader = new GLTFLoader();
            if (options?.draco) {
                const draco = new DRACOLoader();
                draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
                loader.setDRACOLoader(draco);
            }
            loader.setMeshoptDecoder(MeshoptDecoder);
            loader.load(url, function onLoad(gltf) {
                const baseUrl = url.substr(0, url.lastIndexOf('/'));
                const model = new Model(baseUrl);
                model.children.push(gltf.scene);
                if (options?.metadata) {
                    model.metadata = Metadata.load(baseUrl + '/..');
                }
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
    getMetadata(): Promise<Metadata> {
        if (!this.metadata) {
            this.metadata = Metadata.load(this.baseUrl + '/..');
        }
        return this.metadata;
    }
}