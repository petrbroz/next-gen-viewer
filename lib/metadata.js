export class Metadata {
    constructor(attrs, avs, ids, offs, vals) {
        this.attrs = attrs;
        this.avs = avs;
        this.ids = ids;
        this.offs = offs;
        this.vals = vals;
    }
    static async load(baseUrl) {
        async function loadAsset(url) {
            const resp = await fetch(url);
            if (resp.ok) {
                return resp.json();
            }
            else {
                throw new Error(await resp.text());
            }
        }
        const [attrs, avs, ids, offs, vals] = await Promise.all([
            loadAsset(baseUrl + '/objects_attrs.json'),
            loadAsset(baseUrl + '/objects_avs.json'),
            loadAsset(baseUrl + '/objects_ids.json'),
            loadAsset(baseUrl + '/objects_offs.json'),
            loadAsset(baseUrl + '/objects_vals.json')
        ]);
        return new Metadata(attrs, avs, ids, offs, vals);
    }
    getProperties(id) {
        let props = [];
        const avStart = 2 * this.offs[id];
        const avEnd = 2 * this.offs[id + 1];
        for (let i = avStart; i < avEnd; i += 2) {
            const attrOffset = this.avs[i];
            const valOffset = this.avs[i + 1];
            const attr = this.attrs[attrOffset];
            const value = this.vals[valOffset];
            props.push({ name: attr[0], category: attr[1], value });
        }
        return props;
    }
}
