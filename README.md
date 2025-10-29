#  colabri-web

This project contains the main front end of the Colabri platform. It produces an optimized static bundle. The following tech stack is leveraged:

- **React**: The main framework to build the UI.
- **vite**: To efficiently develop and build the bundle. 
- **MUI**: 

## Create Swagger Types

In order to create the TypeScript types from the swagger:

> npx swagger-typescript-api generate --path http://localhost:8080/swagger/doc.json --output="./src/api" --name="ColabriAPI.ts"


## Build

To create an optimized build
> yarn build