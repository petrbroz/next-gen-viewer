import { THREE } from './dependencies.js';
import { Metadata } from './metadata.js';
/**
 * Model representing a specific viewable output of a design.
 */
export declare class Model extends THREE.Object3D {
    protected baseUrl: string;
    protected metadata?: Metadata;
    protected constructor(baseUrl: string);
    /**
     * Loads glTF model from specific location.
     * @param url Model location.
     */
    static load(url: string): Promise<Model>;
    /**
     * Retrieves model metadata.
     */
    getMetadata(): Promise<Metadata>;
}
//# sourceMappingURL=model.d.ts.map