import config from 'rollup-configured';

export default config({
    "project": {
        "demo": {
            "input": "demo/src/index.js",
            "html": "demo/src/index.html",
            "output": "demo/build",
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

