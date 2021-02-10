export interface IProperty {
    name: string;
    category: string;
    value: string;
}
export declare class Metadata {
    protected attrs: object[];
    protected avs: number[];
    protected ids: string[];
    protected offs: number[];
    protected vals: string[];
    protected constructor(attrs: object[], avs: number[], ids: string[], offs: number[], vals: string[]);
    static load(baseUrl: string): Promise<Metadata>;
    getProperties(id: number): IProperty[];
}
//# sourceMappingURL=metadata.d.ts.map