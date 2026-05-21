// Seed data for the demo presentation.
// Stored as a single merged document so you can paste console.logged JSON directly.

import { traverse } from 'svedit';
import { document_schema } from '$lib/document_schema.js';

const FULL_DOC = {
	"document_id": "page_1",
	"nodes": {
		"page_1": {
			"id": "page_1",
			"type": "page",
			"body": [
				"hero_1",
				"RtYpQwXsZvNmKjHgFdSaLe",
				"YTMHBcPkYXJMRUnuSAhrTDE",
				"UBNYngEBJYtDWgeabtDJqWW"
			]
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
			"href": "#RtYpQwXsZvNmKjHgFdSaLe",
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
		}
	}
};



const page_nodes_list = traverse('page_1', document_schema, FULL_DOC.nodes);
const page_nodes = {};
for (const node of page_nodes_list) {
	page_nodes[node.id] = node;
}
export const PAGE_1 = { document_id: 'page_1', nodes: page_nodes };
export const demo_doc = PAGE_1;
