import { Viewer, Model } from '../lib/index.js';

let viewer = new Viewer(document.getElementById('viewport'));
viewer.start();

// Load a model and start the rendering loop
Model.load('models/rac_basic_sample_project/glb/model.glb')
    .then(model => viewer.addModel(model))
    .catch(err => alert(err));

// When an object is selected in the viewer, show its metadata in a simple UI
viewer.addEventListener('selection-changed', async function () {
    const selection = viewer.getSelection();
    const ui = document.getElementById('properties');
    if (selection.length === 1) {
        const item = selection[0];
        const model = viewer.getModel(item.modelId);
        if (model) {
            const metadata = await model.getMetadata();
            const props = metadata.getProperties(item.objectId);
            console.log('Model', item.modelId, 'object', item.objectId, 'props', props);
            ui.innerHTML = '<ul>' + props.map(prop => `<li>${prop.name}: ${prop.value}</li>`).join('') + '</ul>';
            ui.style.display = 'block';
        }
    } else {
        ui.innerHTML = '';
        ui.style.display = 'none';
    }
});