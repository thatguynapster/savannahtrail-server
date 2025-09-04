# Getting Started
---
### Setting up and Running
---
1. Install the dependencies
    `npm install`
2. Setup the env variable
`  NODE_ENV=`
   An example can be found in .env.example

3. Run the application in development with the code
    `npm run start-dev`
    Server will start running on the address [http://localhost:${PORT}](http://localhost:${PORT})

4. To run the built version. Follow the steps below locally to build

    i. Run this code to increase the limit of V8 heap memory limit

    * linux  `export NODE_OPTIONS="--max-old-space-size=${size_in_kb}"`
    * windows `set NODE_OPTIONS="--max-old-space-size=${size_in_kb}"`

    ii.Run this to build the ts files into js `npm run build-prod`

    iii. Run this to start the built file `npm run start-prod`



#### 1. JS Rules
---
##### Plugins Used
* `eslint:recommended`
* `plugin:node/recommended`
* `plugin:security/recommended`
*  `prettier`

##### Guides / Docs
* [https://github.com/mysticatea/eslint-plugin-node#-rules](https://github.com/mysticatea/eslint-plugin-node#-rules)
* [https://github.com/nodesecurity/eslint-plugin-security#eslint-plugin-security](https://github.com/nodesecurity/eslint-plugin-security#eslint-plugin-security)


####  2. TS Rules
---
##### Plugins Used
* `eslint:recommended`
* `plugin:@typescript-eslint/recommended`
* `plugin:@typescript-eslint/recommended-requiring-type-checking`
*  `prettier`

##### Guides / Docs

* [https://typescript-eslint.io/rules/](https://typescript-eslint.io/rules/)
