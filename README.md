# next-gen-viewer

Experimental next-gen Forge Viewer exploring different ways of modernizing or improving the current implementation, for example:

- supporting newer versions of three.js
- supporting ES6+ features like modules (and perhaps generators?)
- replacing callbacks with promises and async/await
- supporting TypeScript
- better supporting multi-model

> The `master` branch is automatically deployed to S3 and a basic test page can be accessed via https://petrbroz.s3-us-west-1.amazonaws.com/next-gen-viewer/test/basic/index.html.

## Notes

- Worth mentioning
  - No bundling needed (customer applications can bundle everything if needed)
  - The only build step is the TypeScript transpilation
  - Auto-complete and type checking of three.js classes (at least in VSCode)
  - Auto-complete of the viewer API inside the sample app's code
  - Simple access to "example" three.js components like OrbitControls, loaded simply as ES6 modules
    - Env. maps loaded using three.js' PMREM and EXR loaders
    - Models loaded using three.js' glTF and Draco loaders
  - Selection highlighting using three.js' effect composer and outline pass
  - Models deployed to S3 are gzipped and uploaded with `Content-Encoding: gzip`
    - In case of _rme_advanced_sample_project_ it brings the size from 50MB down to ~1.5MB
- Weird
  - TypeScript doesn't allow using `.ts` in import paths but if you use `.js`, it will try and find the corresponding `.ts` file; that's what the code does today
  - Types for different three.js experiments must be listed in _tsconfig.json_
  - Draco binaries currently loaded on-demand from https://www.gstatic.com/draco/versioned/decoders/1.4.1