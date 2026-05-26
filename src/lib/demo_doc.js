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
				"four_columns_1",
				"cta_hero_1"
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
				"hero_button_1"
			]
		},
		"hero_button_1": {
			"id": "hero_button_1",
			"type": "button",
			"layout": 1,
			"href": "#four_columns_1",
			"target": "_self",
			"label": {
				"text": "↓",
				"annotations": []
			}
		},
		"four_columns_1": {
			"id": "four_columns_1",
			"type": "four_columns_with_intro",
			"intro": [
				"four_columns_intro_1"
			],
			"columns": [
				"descriptive_media_card_1",
				"descriptive_media_card_2",
				"descriptive_media_card_3",
				"descriptive_media_card_4"
			]
		},
		"four_columns_intro_1": {
			"id": "four_columns_intro_1",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "Erfahren Sie, wie der gezielte Einsatz von künstlicher Intelligenz Ihr Unternehmen nachhaltig stärkt, indem herkömmliche Arbeitsabläufe durch die Digitalisierung von Backprozessen effizienter, präziser und zukunftssicher gestaltet werden.",
				"annotations": []
			}
		},
		"descriptive_media_card_1": {
			"id": "descriptive_media_card_1",
			"type": "descriptive_media_card",
			"media": "descriptive_media_card_1_media",
			"body": [
				"descriptive_media_card_1_title",
				"descriptive_media_card_1_body"
			],
			"buttons": [
				"descriptive_media_card_1_button"
			]
		},
		"descriptive_media_card_1_media": {
			"id": "descriptive_media_card_1_media",
			"type": "image",
			"src": "cmde.webp",
			"mime_type": "image/webp",
			"width": 768,
			"height": 1024,
			"alt": "Wissen sichern",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "cover"
		},
		"descriptive_media_card_1_title": {
			"id": "descriptive_media_card_1_title",
			"type": "text",
			"layout": 4,
			"content": {
				"text": "Wissen sichern",
				"annotations": []
			}
		},
		"descriptive_media_card_1_body": {
			"id": "descriptive_media_card_1_body",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "• Wissen aus der Backstube\n• Rezepte\n• Traditionelles Handwerk",
				"annotations": []
			}
		},
		"descriptive_media_card_1_button": {
			"id": "descriptive_media_card_1_button",
			"type": "button",
			"layout": 1,
			"href": "#cta_hero_1",
			"target": "_self",
			"label": {
				"text": "Auswählen",
				"annotations": []
			}
		},
		"descriptive_media_card_2": {
			"id": "descriptive_media_card_2",
			"type": "descriptive_media_card",
			"media": "descriptive_media_card_2_media",
			"body": [
				"descriptive_media_card_2_title",
				"descriptive_media_card_2_body"
			],
			"buttons": [
				"descriptive_media_card_2_button"
			]
		},
		"descriptive_media_card_2_media": {
			"id": "descriptive_media_card_2_media",
			"type": "image",
			"src": "michael.webp",
			"mime_type": "image/webp",
			"width": 1431,
			"height": 1908,
			"alt": "Alte Backöfen digitalisieren",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "cover"
		},
		"descriptive_media_card_2_title": {
			"id": "descriptive_media_card_2_title",
			"type": "text",
			"layout": 4,
			"content": {
				"text": "Alte Backöfen digitalisieren",
				"annotations": []
			}
		},
		"descriptive_media_card_2_body": {
			"id": "descriptive_media_card_2_body",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "• Nachrüsten\n• Sensordaten\n• Prozessoptimierung",
				"annotations": []
			}
		},
		"descriptive_media_card_2_button": {
			"id": "descriptive_media_card_2_button",
			"type": "button",
			"layout": 1,
			"href": "#cta_hero_1",
			"target": "_self",
			"label": {
				"text": "Auswählen",
				"annotations": []
			}
		},
		"descriptive_media_card_3": {
			"id": "descriptive_media_card_3",
			"type": "descriptive_media_card",
			"media": "descriptive_media_card_3_media",
			"body": [
				"descriptive_media_card_3_title",
				"descriptive_media_card_3_body"
			],
			"buttons": [
				"descriptive_media_card_3_button"
			]
		},
		"descriptive_media_card_3_media": {
			"id": "descriptive_media_card_3_media",
			"type": "image",
			"src": "colbourns.webp",
			"mime_type": "image/webp",
			"width": 2890,
			"height": 1790,
			"alt": "Backfehler vermeiden",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "cover"
		},
		"descriptive_media_card_3_title": {
			"id": "descriptive_media_card_3_title",
			"type": "text",
			"layout": 4,
			"content": {
				"text": "Backfehler vermeiden",
				"annotations": []
			}
		},
		"descriptive_media_card_3_body": {
			"id": "descriptive_media_card_3_body",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "• Vernetzung von Daten\n• Frühwarnsystem\n• Handlungsableitungen",
				"annotations": []
			}
		},
		"descriptive_media_card_3_button": {
			"id": "descriptive_media_card_3_button",
			"type": "button",
			"layout": 1,
			"href": "#cta_hero_1",
			"target": "_self",
			"label": {
				"text": "Auswählen",
				"annotations": []
			}
		},
		"descriptive_media_card_4": {
			"id": "descriptive_media_card_4",
			"type": "descriptive_media_card",
			"media": "descriptive_media_card_4_media",
			"body": [
				"descriptive_media_card_4_title",
				"descriptive_media_card_4_body"
			],
			"buttons": [
				"descriptive_media_card_4_button"
			]
		},
		"descriptive_media_card_4_media": {
			"id": "descriptive_media_card_4_media",
			"type": "image",
			"src": "tomorrow-vc.webp",
			"mime_type": "image/webp",
			"width": 1746,
			"height": 1616,
			"alt": "Intelligenter Zugriff auf Wissen",
			"scale": 1,
			"focal_point_x": 0.5,
			"focal_point_y": 0.5,
			"object_fit": "cover"
		},
		"descriptive_media_card_4_title": {
			"id": "descriptive_media_card_4_title",
			"type": "text",
			"layout": 4,
			"content": {
				"text": "Intelligenter Zugriff auf Wissen",
				"annotations": []
			}
		},
		"descriptive_media_card_4_body": {
			"id": "descriptive_media_card_4_body",
			"type": "text",
			"layout": 1,
			"content": {
				"text": "• Chatbot\n• Wissen auf Knopfdruck\n• Intelligente Abfragen",
				"annotations": []
			}
		},
		"descriptive_media_card_4_button": {
			"id": "descriptive_media_card_4_button",
			"type": "button",
			"layout": 1,
			"href": "#cta_hero_1",
			"target": "_self",
			"label": {
				"text": "Auswählen",
				"annotations": []
			}
		},
		"cta_hero_1": {
			"id": "cta_hero_1",
			"type": "hero",
			"layout": 3,
			"colorset": 0,
			"title": {
				"text": "I love it! How can I get it?",
				"annotations": []
			},
			"description": {
				"text": "This is an initial preview of Editable Website. There’s more to do before you can use it in production. Be the first to hear when it’s ready:",
				"annotations": []
			},
			"buttons": [
				"cta_button_1"
			]
		},
		"cta_button_1": {
			"id": "cta_button_1",
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
