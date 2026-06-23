import fs from 'fs';

let content = fs.readFileSync('src/lib/demo_doc.js', 'utf-8');

const section1Str = `		section_1: {
			id: 'section_1',
			type: 'section'
		},`;

content = content.replace('page_1: {', section1Str + '\n\t\tpage_1: {');

const page1BodyEndStr = `					'footer_1'
				],
				annotations: []`;

const page1BodyEndStrRepl = `					'footer_1'
				],
				annotations: [
					{
						start_offset: 0,
						end_offset: 3,
						node_id: 'section_1'
					}
				]`;

content = content.replace(page1BodyEndStr, page1BodyEndStrRepl);

fs.writeFileSync('src/lib/demo_doc.js', content);
