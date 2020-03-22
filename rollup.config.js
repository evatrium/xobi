import {config} from "./config/rollup";

export default config({
    "project": {
        "demo": {
            "preset": "dev",
            "input": "demo/src/index.js",
            "html": "demo/src/index.html",
            "output": "demo/build"
        },
        "lib": {
            "preset": "lib",
            "sourcemap":false,
            "input": ["src/index.js", "src/preact.js"],
            "output": ".",
            "external": ["preact", "preact/hooks", "preact/compat"],
        }
    }
});

