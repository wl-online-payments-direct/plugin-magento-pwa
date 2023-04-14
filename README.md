# PWA Worldline Payment 

## Installation

1. Create an Empty PWA Studio Project by [Scaffolding](https://magento.github.io/pwa-studio/pwa-buildpack/scaffolding/)
2. `cd your_project/src` 
3. `mkdir @worldline` 
4.  copy module folder to `@worldline`
5. run command from root directory
   - for development: `yarn add link:src/@worldline/worldline-payment`  
   - for production: `yarn add file:src/@worldline/worldline-payment`
6. If `@worldline` is not in the list of trusted vendors, then add it to `your_project/package.json` in `pwa-studio` section. Example:
   
```json
   {
   "pwa-studio": {
       "targets": {
         "intercept": "./local-intercept.js"
       },
      "trusted-vendors": [
         "@worldline"
      ]
   }
   }
```
 
7. Run the Watch command: `yarn watch`.

## Release notes

#### 1.6.0
- Add surcharge functionality.

#### 1.5.0
- Support the 13.0.0 version of PWA.

#### 1.4.0
- Support the 12.7.0 version of PWA.
