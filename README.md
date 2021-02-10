# next-gen-viewer

Experimental next-gen Forge Viewer exploring different ways of modernizing or improving the current implementation, for example:

- supporting newer versions of three.js
- supporting ES6+ features like modules (and perhaps generators?)
- replacing callbacks with promises and async/await
- supporting TypeScript
- better supporting multi-model

> The `master` branch is automatically deployed to S3 and the test page can be accessed via https://petrbroz.s3-us-west-1.amazonaws.com/next-gen-viewer/test/index.html.

## Notes

- Nice
  - No bundling needed (customer applications can bundle everything if needed)
  - Auto-complete and type checking of three.js classes (at least in VSCode)
  - "Example" three.js components like OrbitControls loaded simply as ES6 modules
  - Env. maps using three.js PMREM and EXR loader
  - Selection highlighting using three.js post-processing effects
- Weird
  - TypeScript doesn't allow using `.ts` in import paths but if you use `.js`, it will try and find the corresponding `.ts` file; that's what the code does today
  - Types for different three.js experiments must be listed in _tsconfig.json_