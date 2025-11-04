import * as path from "node:path";
import * as process from "node:process";
import { generateApi } from "swagger-typescript-api";

await generateApi({
    url: "http://localhost:8080/swagger/doc.json",
    output: path.resolve(process.cwd(), "src", "api"),
    fileName: "ColabriAPI.ts",
    hooks: {
        onCreateRouteName: (routeNameInfo, rawRouteInfo) => {

            //throw new Error(`Custom route names are not supported. Encountered route: ${rawRouteInfo.method} ${rawRouteInfo.path}`);

            console.log(`Generating route name for: ${rawRouteInfo.method} ${rawRouteInfo.route}`);

            // Generate a name based on the route
            let name = rawRouteInfo.route;

            // Check if the name ends on a parameter like "/{id}"
            const endsWithParam = /\/\{[^}]+\}$/.test(name);
            // Based on this, determine if the route is plural or singular
            let plural = !endsWithParam;

            // Remove all parameters like "{id}"
            name = name.replace(/{[^}]+}/g, '');

            // Remove all "/" and make the next character uppercase
            name = name.split('/').map((part, index) => {
                if (index === 0) return part.toLowerCase();
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }).join('');

            // Remove all "-" and capitalize the next character
            name = name.replace(/-./g, (match) => match.charAt(1).toUpperCase());

            // Capitalize the first letter of the name
            name = name.charAt(0).toUpperCase() + name.slice(1);


            // Get the method in lowercase
            const method = rawRouteInfo.method.toLowerCase();

            // For POST, DELETE, PUT, PATCH methods, treat the name as singular
            if (method === 'post' || method === 'delete' || method === 'put' || method === 'patch' ) {
                plural = false;
            }

            // If the root ends with "s" and is plural, keep it. If singular and ends with "s", remove it.
            if (!plural && name.endsWith('s')) {
                name = name.slice(0, -1);
            }

            console.log(`Generated route name: ${method}${name}`);
            return {
                usage: `${method}${name}`,
                original: `${method}${name}`,
                duplicate: false
            };
        },
    },
});