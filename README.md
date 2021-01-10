# animlib

Library for recording browser-based animations.

Builds heavily on [d3](https://github.com/d3/d3). Recording of animations is performed using library [puppeteer](https://github.com/GoogleChrome/puppeteer) of Node.js, [ffmpeg](https://ffmpeg.org), and some trickery dealing with d3-transitions and internal timer of the browser (inspired by examples in [here](https://github.com/veltman/gifs) and [here](https://roadtolarissa.com/d3-mp4/)).

Used mainly for my own projects. That is, some parts of the program can be sloppily written. Usage at one's own risk!

Copyright (c) 2020 NoobQuant/Ville Voutilainen.

## Dependencies

### Animations
 
 - [d3](https://github.com/d3/d3) v5.15.1. Stored under *src/dependencies/d3*.
 - [d3-xyzoom](https://github.com/wiremind/d3-xyzoom) v1.5.0. Stored under *src/dependencies/d3-xyzoom*.

### Recording

Have following installed on your computer:
 - [ffmpeg](https://ffmpeg.org)
 - Node.js with libary [puppeteer](https://github.com/GoogleChrome/puppeteer)

## How to use:

- Create project folder, e.g. */projects/my_project* or somewhere outside the repo.
- For a new scene, copy a template *src/template.hrml*, move it project folder and rename file, e.g. <my_scene.html>.
- Specify js-import paths in scene file. Paths are relative to scene file path. If project folder is located in path */projects/my_project*, then paths are already correctly specified.
- Set up local server on a drive with access to project folder.
- Code the scene. Examples given in folder *mwes/*. Inspect in browser that everything works.
- Once done, make use *document.URL.includes('my_scene')* to hack browser internal timer (file name is included for sure in the document URL).
- In *record.ps1*, specify paths
    - pathToAnimaLib: Full path to animlib repo on local drive.  
    - pathToVids: Full path to local folder where recorded videos are put.
    - pathToPuppeteer: Full path path to node.js modules local folder *node_modules/puppeteer*. Puppeteer is used form this folder. 
    - seconds: How many secons to record.   
    - projectPathLocalHost: localhost URL to scene file.
    - outputVidName: Name for output video.
- Restart localhost connection to be sure.
- Set paths record.ps1. Run record.ps1 e.g. in PowerShell ISE.

## Documentation

Documentation forthcoming. Run *jsdoc -c jsdoc.json*.