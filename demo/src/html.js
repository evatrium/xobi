module.exports = ({files, publicPath,}) => {
    const scripts = (files.js || [])
        .map(({fileName}) => {
            return `<script crossorigin="anonymous" src="${publicPath}${fileName}" type="module" async></script>`;
        })
        .join('\n');

    return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover"/>
    <title>xobi demo</title>
    <style>
        ${files.css ? files.css[0].source : ''}
    </style>
</head>
<body>
<div id="root"></div>
${scripts}
</body>
</html>
`;


};