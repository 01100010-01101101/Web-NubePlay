// Configuración de Karma: ejecuta las pruebas Jasmine (src/tests/**/*.spec.js[x]) en Chrome.
// webpack + Babel transforman el JSX, y babel-plugin-istanbul instrumenta el código para la cobertura.
const ARCHIVOS_PRUEBA = "src/tests/**/*.spec.@(js|jsx)";

module.exports = function (config) {
    config.set({
        frameworks: ["jasmine", "webpack"],

        files: [{ pattern: ARCHIVOS_PRUEBA, watched: false }],

        preprocessors: {
            [ARCHIVOS_PRUEBA]: ["webpack"]
        },

        webpack: {
            mode: "development",
            devtool: "inline-source-map",
            resolve: { extensions: [".js", ".jsx"] },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        // El proyecto es "type": "module": permite imports sin extensión (./App en vez de ./App.jsx).
                        resolve: { fullySpecified: false },
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    ["@babel/preset-env", { targets: { chrome: "100" } }],
                                    ["@babel/preset-react", { runtime: "automatic" }]
                                ],
                                // Solo se mide la cobertura del código de la aplicación, no de las pruebas.
                                plugins: [["istanbul", { exclude: ["src/tests/**"] }]]
                            }
                        }
                    }
                ]
            }
        },

        reporters: ["spec", "coverage"],

        coverageReporter: {
            dir: "coverage",
            reporters: [
                { type: "html", subdir: "html" },
                { type: "text-summary" },
                { type: "text", subdir: ".", file: "resumen.txt" }
            ]
        },

        browsers: ["ChromeHeadless"],
        singleRun: true,
        client: {
            jasmine: { random: false }
        }
    });
};
