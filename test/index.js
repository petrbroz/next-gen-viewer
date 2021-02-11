import { Viewer, Model } from '../lib/index.js';

const viewer = new Viewer(document.getElementById('viewport'));
viewer.start();

const dropdown = document.getElementById('model');
dropdown.addEventListener('change', function () {
    viewer.removeModels();
    Model.load(dropdown.value, { draco: true, metadata: true })
        .then(model => {
            viewer.addModel(model);
        })
        .catch(err => alert(err));
});
dropdown.dispatchEvent(new Event('change'));

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