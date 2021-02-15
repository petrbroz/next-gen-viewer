import { Viewer, Model } from 'next-gen-viewer';

let viewer = new Viewer(document.getElementById('viewport') as HTMLCanvasElement, { assetsUrl: '../../../assets' });
viewer.start();
Model.load('../../../assets/models/rac_basic_sample_project/glb-draco/model.glb', { draco: true, metadata: true })
    .then(model => viewer.addModel(model))
    .catch(err => alert(err));