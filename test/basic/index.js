import { Viewer, Model } from '../../lib/index.js';

const models = document.getElementById('models');
const properties = document.getElementById('properties');
const viewer = new Viewer(document.getElementById('viewport'), { assetsUrl: '../../assets' });
viewer.start();

// Load model selected in the dropdown
models.addEventListener('change', function () {
    viewer.removeModels();
    properties.innerHTML = '';
    properties.style.display = 'none';
    Model.load(models.value, { draco: true, metadata: true })
        .then(model => {
            viewer.addModel(model);
        })
        .catch(err => alert(err));
});
models.dispatchEvent(new Event('change'));

// When an object is selected in the viewer, show its metadata in a simple UI
viewer.addEventListener('selection-changed', async function () {
    const selection = viewer.getSelection();
    if (selection.length === 1) {
        const item = selection[0];
        const model = viewer.getModel(item.modelId);
        if (model) {
            const metadata = await model.getMetadata();
            const props = metadata.getProperties(item.objectId);
            console.log('Model', item.modelId, 'object', item.objectId, 'props', props);
            properties.innerHTML = '<ul>' + props.map(prop => `<li>${prop.name}: ${prop.value}</li>`).join('') + '</ul>';
            properties.style.display = 'block';
        }
    } else {
        properties.innerHTML = '';
        properties.style.display = 'none';
    }
});