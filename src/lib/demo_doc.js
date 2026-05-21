// Seed data for the demo website
// Stored as a single merged document so you can paste console.logged JSON directly.
// NAV_1, FOOTER_1, PAGE_1 are extracted automatically using svedit's traverse utility.

import { traverse } from 'svedit';
import { document_schema } from '$lib/document_schema.js';

const FULL_DOC = {
	"document_id": "page_1",
	"nodes": {
		"page_1": {
			"id": "page_1",
			"type": "page",
			"title": {
				"text": "Editable Website",
				"annotations": []
			},
			"description": {
				"text": "SvelteKit template for building CMS-free editable websites. Site owners can edit content directly in the layout - no CMS needed.",
				"annotations": []
			},
			"image": "page_image_1",
			"body": [
				"hero_1",
				"RtYpQwXsZvNmKjHgFdSaLe",
				"YTMHBcPkYXJMRUnuSAhrTDE",
				"UBNYngEBJYtDWgeabtDJqWW"
			],
			"nav": "nav_1",
			"footer": "footer_1"
		},
		"page_image_1": {
			"id": "page_image_1",
			"type": "image",
			"src": "",
			"mime_type": "",
			"width": 0,
			"height": 0,
			"alt": "",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "contain"
		},
		"hero_1": {
			"id": "hero_1",
			"type": "hero",
			"layout": 1,
			"colorset": 0,
			"title": {
				"text": "Imagine you could edit ✍️ your website live on the page",
				"annotations": []
			},
			"description": {
				"text": "Dream no more…",
				"annotations": []
			},
			"buttons": [
				"ccHVKDeyhrRVfKZCpXvxhac"
			]
		},
		"ccHVKDeyhrRVfKZCpXvxhac": {
			"id": "ccHVKDeyhrRVfKZCpXvxhac",
			"type": "button",
			"layout": 1,
			"href": "/#RtYpQwXsZvNmKjHgFdSaLe",
			"target": "_self",
			"label": {
				"text": "↓",
				"annotations": []
			}
		},
		"RtYpQwXsZvNmKjHgFdSaLe": {
			"id": "RtYpQwXsZvNmKjHgFdSaLe",
			"type": "feature",
			"layout": 1,
			"colorset": 0,
			"media": "VbNcMxZaQwErTyUiOpLkJh",
			"body": [
				"uqZnrCRbzCkBWmYNQYkFePY",
				"WsXcDfVgBhNjMkLqAzPeRt",
				"ywTQktXzgyRqzsUNXjZztQw",
				"WjasMkTrmjdrXTsDgeUHQap",
				"DxBvNYzBgktMyKjKkKyYcAN"
			]
		},
		"VbNcMxZaQwErTyUiOpLkJh": {
			"id": "VbNcMxZaQwErTyUiOpLkJh",
			"type": "image",
			"src": "cmde.webp",
			"mime_type": "image/webp",
			"width": 192,
			"height": 256,
			"alt": "Feature image",
			"scale": 1,
			"focal_point_x": 0.5329817181174089,
			"focal_point_y": 0.47301940896272265,
			"object_fit": "cover"
		},
		"uqZnrCRbzCkBWmYNQYkFePY": {
			"id": "uqZnrCRbzCkBWmYNQYkFePY",
			"type": "text",
			"layout": 5,
			"content": {
				"text": "Editing",
				"annotations": []
			}
		},
		"WsXcDfVgBhNjMkLqAzPeRt": {
			"id": "WsXcDfVgBhNjMkLqAzPeRt",
			"type": "text",
			"layout": 2,
			"content": {
				"text": "This is Editable Website",
				"annotations": []
			}
		},
		"ywTQktXzgyRqzsUNXjZztQw": {
			"id": "ywTQktXzgyRqzsUNXjZztQw",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "Press ⌘ / Ctrl + e to enter edit mode.\nClick where you want to edit.\nMove around with the arrow keys.\nChange anything you see!",
				"annotations": [
					{
						"start_offset": 6,
						"end_offset": 18,
						"node_id": "RezNUsxYmfpmFMezpgEbqYu"
					}
				]
			}
		},
		"RezNUsxYmfpmFMezpgEbqYu": {
			"id": "RezNUsxYmfpmFMezpgEbqYu",
			"type": "strong"
		},
		"WjasMkTrmjdrXTsDgeUHQap": {
			"id": "WjasMkTrmjdrXTsDgeUHQap",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "Bold, italics and links with ⌘ / Ctrl + b, i and k\nUndo with ⌘ / Ctrl + z\nSave changes with ⌘ / Ctrl + s\n(On this example page, changes are not persisted. On a real site, a logged in user would have their changes persisted to a database.)",
				"annotations": [
					{
						"start_offset": 29,
						"end_offset": 41,
						"node_id": "NhhsYbqTRzPtpQcHFUgwFhP"
					},
					{
						"start_offset": 43,
						"end_offset": 45,
						"node_id": "ypAZzWFdhamCaTMKmZMZPMm"
					},
					{
						"start_offset": 49,
						"end_offset": 50,
						"node_id": "wuyFjXptXyMvgYKUcvtTggC"
					},
					{
						"start_offset": 61,
						"end_offset": 73,
						"node_id": "ZWDXzUmKJbqDwJbNTbhEtWQ"
					},
					{
						"start_offset": 92,
						"end_offset": 104,
						"node_id": "zqyQQtSbzxtdTTsVTYuuXEh"
					},
					{
						"start_offset": 105,
						"end_offset": 238,
						"node_id": "CUTpvupqUbXQDyMjBczwfCj"
					},
					{
						"start_offset": 0,
						"end_offset": 4,
						"node_id": "PYHXbxRMREHBpAqxbdsUXzP"
					},
					{
						"start_offset": 6,
						"end_offset": 13,
						"node_id": "djTpcsEQTzfGMSRctKenpWt"
					},
					{
						"start_offset": 18,
						"end_offset": 23,
						"node_id": "eUteADFhxtenJraxpeprgHr"
					}
				]
			}
		},
		"NhhsYbqTRzPtpQcHFUgwFhP": {
			"id": "NhhsYbqTRzPtpQcHFUgwFhP",
			"type": "strong"
		},
		"ypAZzWFdhamCaTMKmZMZPMm": {
			"id": "ypAZzWFdhamCaTMKmZMZPMm",
			"type": "strong"
		},
		"wuyFjXptXyMvgYKUcvtTggC": {
			"id": "wuyFjXptXyMvgYKUcvtTggC",
			"type": "strong"
		},
		"ZWDXzUmKJbqDwJbNTbhEtWQ": {
			"id": "ZWDXzUmKJbqDwJbNTbhEtWQ",
			"type": "strong"
		},
		"zqyQQtSbzxtdTTsVTYuuXEh": {
			"id": "zqyQQtSbzxtdTTsVTYuuXEh",
			"type": "strong"
		},
		"CUTpvupqUbXQDyMjBczwfCj": {
			"id": "CUTpvupqUbXQDyMjBczwfCj",
			"type": "emphasis"
		},
		"PYHXbxRMREHBpAqxbdsUXzP": {
			"id": "PYHXbxRMREHBpAqxbdsUXzP",
			"type": "strong"
		},
		"djTpcsEQTzfGMSRctKenpWt": {
			"id": "djTpcsEQTzfGMSRctKenpWt",
			"type": "emphasis"
		},
		"eUteADFhxtenJraxpeprgHr": {
			"id": "eUteADFhxtenJraxpeprgHr",
			"type": "link",
			"href": "#",
			"target": "_self"
		},
		"DxBvNYzBgktMyKjKkKyYcAN": {
			"id": "DxBvNYzBgktMyKjKkKyYcAN",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "Looking for the admin panel? There isn't any! It's just you, and your content.",
				"annotations": []
			}
		},
		"YTMHBcPkYXJMRUnuSAhrTDE": {
			"id": "YTMHBcPkYXJMRUnuSAhrTDE",
			"type": "feature",
			"layout": 2,
			"colorset": 0,
			"media": "hqrrTdEbTPaqzEcYMczhBZb",
			"body": [
				"pCjecUjAFDGgGpgquwGrCdp",
				"qDAyeabdhVEXjBWXyyqfUPb",
				"QVXhuysTRgRyQHVQnfTVCpV",
				"NjNteBhckwxGAUfbYRMGrDz"
			]
		},
		"hqrrTdEbTPaqzEcYMczhBZb": {
			"id": "hqrrTdEbTPaqzEcYMczhBZb",
			"type": "image",
			"src": "michael.webp",
			"mime_type": "image/webp",
			"width": 192,
			"height": 256,
			"alt": "Feature image",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "cover"
		},
		"pCjecUjAFDGgGpgquwGrCdp": {
			"id": "pCjecUjAFDGgGpgquwGrCdp",
			"type": "text",
			"layout": 2,
			"content": {
				"text": "Hello, I’m Michael",
				"annotations": []
			}
		},
		"qDAyeabdhVEXjBWXyyqfUPb": {
			"id": "qDAyeabdhVEXjBWXyyqfUPb",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "Since 2011 I’ve been taming web browsers to behave correctly and predictably when editing rich text.",
				"annotations": [
					{
						"start_offset": 21,
						"end_offset": 40,
						"node_id": "gnbpgBsBYZqEwRxqRZSMHdd"
					}
				]
			}
		},
		"gnbpgBsBYZqEwRxqRZSMHdd": {
			"id": "gnbpgBsBYZqEwRxqRZSMHdd",
			"type": "link",
			"href": "https://letsken.com/michael/how-to-implement-a-web-based-rich-text-editor-in-2023",
			"target": "_blank"
		},
		"QVXhuysTRgRyQHVQnfTVCpV": {
			"id": "QVXhuysTRgRyQHVQnfTVCpV",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "I want you to be able to launch websites that anyone can edit. No more calls asking you to update someone’s WordPress site! They’ll be able to do it themselves.",
				"annotations": []
			}
		},
		"NjNteBhckwxGAUfbYRMGrDz": {
			"id": "NjNteBhckwxGAUfbYRMGrDz",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "Most CMSs are too complex for clients and too restrictive for developers. Change every pixel of your site, create new content types, or integrate 3rd party data. Everything you can do with Svelte, you can do with Editable Website.",
				"annotations": []
			}
		},
		"UBNYngEBJYtDWgeabtDJqWW": {
			"id": "UBNYngEBJYtDWgeabtDJqWW",
			"type": "hero",
			"colorset": 0,
			"title": {
				"text": "I love it! How can I get it?",
				"annotations": []
			},
			"description": {
				"text": "This is an an initial preview of Editable Website. There’s more to do before you can use it in production. Be the first to hear when it’s ready:",
				"annotations": []
			},
			"buttons": [
				"PvpNcGKnqTTBbvbRZeDUYSN"
			],
			"layout": 3
		},
		"PvpNcGKnqTTBbvbRZeDUYSN": {
			"id": "PvpNcGKnqTTBbvbRZeDUYSN",
			"type": "button",
			"layout": 1,
			"href": "https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform?usp=dialog",
			"target": "_blank",
			"label": {
				"text": "Join the Technical Preview",
				"annotations": []
			}
		},
		"nav_1": {
			"id": "nav_1",
			"type": "nav",
			"logo": "nav_logo",
			"nav_items": [
				"DDmmrQzcAxWJfdhatTbkRTh",
				"GyKyQvRAvkgnywmxTVgvrnF",
				"FKgjxHCeSbVZrdnPuxYkMYp"
			]
		},
		"nav_logo": {
			"id": "nav_logo",
			"type": "image",
			"src": "logo.svg",
			"mime_type": "image/svg+xml",
			"width": 100,
			"height": 100,
			"alt": "Logo",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "cover"
		},
		"DDmmrQzcAxWJfdhatTbkRTh": {
			"id": "DDmmrQzcAxWJfdhatTbkRTh",
			"type": "nav_item",
			"layout": 1,
			"href": "/#RtYpQwXsZvNmKjHgFdSaLe",
			"target": "_self",
			"label": {
				"text": "Try it",
				"annotations": []
			}
		},
		"GyKyQvRAvkgnywmxTVgvrnF": {
			"id": "GyKyQvRAvkgnywmxTVgvrnF",
			"type": "nav_item",
			"layout": 1,
			"href": "/#YTMHBcPkYXJMRUnuSAhrTDE",
			"target": "_self",
			"label": {
				"text": "About",
				"annotations": []
			}
		},
		"FKgjxHCeSbVZrdnPuxYkMYp": {
			"id": "FKgjxHCeSbVZrdnPuxYkMYp",
			"type": "nav_item",
			"layout": 2,
			"href": "https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform",
			"target": "_blank",
			"label": {
				"text": "Join the Technical Preview",
				"annotations": []
			}
		},
		"footer_1": {
			"id": "footer_1",
			"type": "footer",
			"logo": "footer_logo",
			"copyright": {
				"text": "© Editable Website",
				"annotations": []
			},
			"footer_link_columns": [
				"fcSSWQUTYajjknPChgGsPZz",
				"footer_column_2",
				"footer_column_3"
			],
			"logo_max_width": 88,
			"logo_aspect_ratio": 1
		},
		"footer_logo": {
			"id": "footer_logo",
			"type": "image",
			"src": "logo.svg",
			"mime_type": "image/svg+xml",
			"width": 100,
			"height": 100,
			"alt": "Logo",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "cover"
		},
		"fcSSWQUTYajjknPChgGsPZz": {
			"id": "fcSSWQUTYajjknPChgGsPZz",
			"type": "footer_link_column",
			"footer_links": [
				"EtcfbabRCtPSvSpfFfjPeza",
				"WVvBSREFCThNYcpgvfUnWkF",
				"eDAnnFjNdZpzYMtpSqReBxf",
				"GwPeRFYtAyrcCMfpuyzdWZp"
			],
			"label": {
				"text": "On this page",
				"annotations": []
			}
		},
		"EtcfbabRCtPSvSpfFfjPeza": {
			"id": "EtcfbabRCtPSvSpfFfjPeza",
			"type": "footer_link",
			"href": "/#hero_1",
			"target": "_self",
			"label": {
				"text": "Opening",
				"annotations": []
			}
		},
		"WVvBSREFCThNYcpgvfUnWkF": {
			"id": "WVvBSREFCThNYcpgvfUnWkF",
			"type": "footer_link",
			"href": "/#RtYpQwXsZvNmKjHgFdSaLe",
			"target": "_self",
			"label": {
				"text": "Try it",
				"annotations": []
			}
		},
		"eDAnnFjNdZpzYMtpSqReBxf": {
			"id": "eDAnnFjNdZpzYMtpSqReBxf",
			"type": "footer_link",
			"href": "/#YTMHBcPkYXJMRUnuSAhrTDE",
			"target": "_self",
			"label": {
				"text": "About",
				"annotations": []
			}
		},
		"GwPeRFYtAyrcCMfpuyzdWZp": {
			"id": "GwPeRFYtAyrcCMfpuyzdWZp",
			"type": "footer_link",
			"href": "/#UBNYngEBJYtDWgeabtDJqWW",
			"target": "_self",
			"label": {
				"text": "Join",
				"annotations": []
			}
		},
		"footer_column_2": {
			"id": "footer_column_2",
			"type": "footer_link_column",
			"label": {
				"text": "GitHub",
				"annotations": []
			},
			"footer_links": [
				"uavzfSnSpTRrHSfJpbfvpsh",
				"footer_link_2_1"
			]
		},
		"uavzfSnSpTRrHSfJpbfvpsh": {
			"id": "uavzfSnSpTRrHSfJpbfvpsh",
			"type": "footer_link",
			"href": "https://github.com/michael/editable-website",
			"target": "_blank",
			"label": {
				"text": "Editable Website",
				"annotations": []
			}
		},
		"footer_link_2_1": {
			"id": "footer_link_2_1",
			"type": "footer_link",
			"href": "https://svedit.dev",
			"label": {
				"text": "Svedit",
				"annotations": []
			},
			"target": "_blank"
		},
		"footer_column_3": {
			"id": "footer_column_3",
			"type": "footer_link_column",
			"label": {
				"text": "Videos",
				"annotations": []
			},
			"footer_links": [
				"ewuBYPxRqFsJXffTuwqssXg",
				"cCMbgzNjRjVjrvWuHJCvJkx"
			]
		},
		"ewuBYPxRqFsJXffTuwqssXg": {
			"id": "ewuBYPxRqFsJXffTuwqssXg",
			"type": "footer_link",
			"href": "https://www.youtube.com/watch?v=T2RMYj_1g9E",
			"label": {
				"text": "Introduction",
				"annotations": []
			},
			"target": "_blank"
		},
		"cCMbgzNjRjVjrvWuHJCvJkx": {
			"id": "cCMbgzNjRjVjrvWuHJCvJkx",
			"type": "footer_link",
			"href": "https://youtu.be/o4kcABS-XH4?t=3226",
			"target": "_blank",
			"label": {
				"text": "Update 2025-10",
				"annotations": []
			}
		}
	}
};

// ---------------------------------------------------------------------------
// Extract sub-documents using svedit's traverse utility
// ---------------------------------------------------------------------------

/**
 * Extract a sub-document: traverse from root_id collecting all reachable nodes.
 */
function extract_document(nodes, root_id) {
	const node_list = traverse(root_id, document_schema, nodes);
	const sub_nodes = {};
	for (const node of node_list) {
		sub_nodes[node.id] = node;
	}
	return { document_id: root_id, nodes: sub_nodes };
}

const page_node = FULL_DOC.nodes['page_1'];
const nav_root_id = page_node.nav;
const footer_root_id = page_node.footer;

export const NAV_1 = extract_document(FULL_DOC.nodes, nav_root_id);
export const FOOTER_1 = extract_document(FULL_DOC.nodes, footer_root_id);

// PAGE_1 gets everything reachable from page_1, minus nav/footer subtrees.
const nav_ids = new Set(Object.keys(NAV_1.nodes));
const footer_ids = new Set(Object.keys(FOOTER_1.nodes));
const exclude = new Set([...nav_ids, ...footer_ids]);
const page_nodes_list = traverse('page_1', document_schema, FULL_DOC.nodes);
const page_nodes = {};
for (const node of page_nodes_list) {
	if (!exclude.has(node.id)) {
		page_nodes[node.id] = node;
	}
}
export const PAGE_1 = { document_id: 'page_1', nodes: page_nodes };

// Merged document for static deployment (Vercel demo).
export const demo_doc = {
	document_id: PAGE_1.document_id,
	nodes: { ...PAGE_1.nodes, ...NAV_1.nodes, ...FOOTER_1.nodes }
};
