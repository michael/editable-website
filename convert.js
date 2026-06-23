import fs from 'fs';

let content = fs.readFileSync('src/lib/demo_doc.js', 'utf-8');

const array_properties = ['buttons', 'content', 'body', 'gallery_items', 'items', 'blocks', 'nav_items', 'footer_items'];

for (const prop of array_properties) {
    const regex = new RegExp(`\\b${prop}:\\s*\\[([^\\]]*)\\]`, 'g');
    content = content.replace(regex, (match, inner) => {
        return `${prop}: {\n\t\tnodes: [${inner}],\n\t\tannotations: []\n\t}`;
    });
}

fs.writeFileSync('src/lib/demo_doc.js', content);
