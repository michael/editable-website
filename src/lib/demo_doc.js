// Hardcoded demo_doc for static deployment
// This replaces the database seed for demo purposes
export const demo_doc = {
    "document_id": "page_1",
    "nodes": {
        "fknRwUGjuUxkHGnnFcQzYBv": {
            "id": "fknRwUGjuUxkHGnnFcQzYBv",
            "type": "strong"
        },
        "hero_1": {
            "id": "hero_1",
            "type": "hero",
            "layout": 1,
            "title": {
                "text": "This is not an ordinary website",
                "annotations": []
            },
            "description": {
                "text": "I'll show you why. All you need is a computer with a physical keyboard. Ready?",
                "annotations": [
                    {
                        "start_offset": 53,
                        "end_offset": 70,
                        "node_id": "fknRwUGjuUxkHGnnFcQzYBv"
                    }
                ]
            },
            "buttons": []
        },
        "feature_1_image": {
            "id": "feature_1_image",
            "type": "image",
            "src": "/sample-images/1.jpg",
            "width": 800,
            "height": 600,
            "alt": "Feature image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "feature_1_intro_heading": {
            "id": "feature_1_intro_heading",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "Press ⌘+E",
                "annotations": []
            }
        },
        "vAhBcybjFJsXPkmRQrwWPaT": {
            "id": "vAhBcybjFJsXPkmRQrwWPaT",
            "type": "strong"
        },
        "uqxqsNMvMMNkyekKbMezJkg": {
            "id": "uqxqsNMvMMNkyekKbMezJkg",
            "type": "highlight"
        },
        "feature_1_outro_paragraph": {
            "id": "feature_1_outro_paragraph",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Or Ctrl+E if you are on Windows or Linux. You can move the cursor with the arrow keys or make selections with the mouse. You can edit anything you see on the screen.",
                "annotations": [
                    {
                        "start_offset": 3,
                        "end_offset": 9,
                        "node_id": "vAhBcybjFJsXPkmRQrwWPaT"
                    },
                    {
                        "start_offset": 129,
                        "end_offset": 142,
                        "node_id": "uqxqsNMvMMNkyekKbMezJkg"
                    }
                ]
            }
        },
        "GjYMCGyPdWVrmkGcWazPTAJ": {
            "id": "GjYMCGyPdWVrmkGcWazPTAJ",
            "type": "strong"
        },
        "TKBzGfCyPtcywrWNafpMFUx": {
            "id": "TKBzGfCyPtcywrWNafpMFUx",
            "type": "strong"
        },
        "BYnvjBNEvJqBdqQmUyeUzgn": {
            "id": "BYnvjBNEvJqBdqQmUyeUzgn",
            "type": "strong"
        },
        "kJNavahEZGWKeAtWTgEQqnp": {
            "id": "kJNavahEZGWKeAtWTgEQqnp",
            "type": "strong"
        },
        "WjasMkTrmjdrXTsDgeUHQap": {
            "id": "WjasMkTrmjdrXTsDgeUHQap",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "For basic text formatting use ⌘+B (Bold) ⌘+I (Italic) and ⌘+K to turn text into a link. To undo accidental changes press ⌘+Z.",
                "annotations": [
                    {
                        "start_offset": 30,
                        "end_offset": 33,
                        "node_id": "GjYMCGyPdWVrmkGcWazPTAJ"
                    },
                    {
                        "start_offset": 41,
                        "end_offset": 44,
                        "node_id": "TKBzGfCyPtcywrWNafpMFUx"
                    },
                    {
                        "start_offset": 58,
                        "end_offset": 61,
                        "node_id": "BYnvjBNEvJqBdqQmUyeUzgn"
                    },
                    {
                        "start_offset": 121,
                        "end_offset": 124,
                        "node_id": "kJNavahEZGWKeAtWTgEQqnp"
                    }
                ]
            }
        },
        "feature_1": {
            "id": "feature_1",
            "type": "feature",
            "layout": 1,
            "image": "feature_1_image",
            "intro": [
                "feature_1_intro_heading"
            ],
            "outro": [
                "feature_1_outro_paragraph",
                "WjasMkTrmjdrXTsDgeUHQap"
            ]
        },
        "HWcSGEAsZyfeQFjgvKrMpZc": {
            "id": "HWcSGEAsZyfeQFjgvKrMpZc",
            "type": "text",
            "layout": 5,
            "content": {
                "text": "EDITING",
                "annotations": []
            }
        },
        "heading_1": {
            "id": "heading_1",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "Add, select, and move blocks",
                "annotations": []
            }
        },
        "nEMtsBhedGGXSTRtThSrbUa": {
            "id": "nEMtsBhedGGXSTRtThSrbUa",
            "type": "strong"
        },
        "uNNkhjBKaWDxGAwDDzeWmpz": {
            "id": "uNNkhjBKaWDxGAwDDzeWmpz",
            "type": "strong"
        },
        "paragraph_1": {
            "id": "paragraph_1",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Click the little dashed horizontal gap after this section. You should see a big blinking cursor. ",
                "annotations": [
                    {
                        "start_offset": 76,
                        "end_offset": 95,
                        "node_id": "nEMtsBhedGGXSTRtThSrbUa"
                    },
                    {
                        "start_offset": 17,
                        "end_offset": 38,
                        "node_id": "uNNkhjBKaWDxGAwDDzeWmpz"
                    }
                ]
            }
        },
        "CpCARDQGFNdNtTqtJmGUgfU": {
            "id": "CpCARDQGFNdNtTqtJmGUgfU",
            "type": "strong"
        },
        "tEvwCCrEaGqPWeStQxZZrGQ": {
            "id": "tEvwCCrEaGqPWeStQxZZrGQ",
            "type": "strong"
        },
        "nZKHXbhVMgzydvcHWkjvuHp": {
            "id": "nZKHXbhVMgzydvcHWkjvuHp",
            "type": "strong"
        },
        "FfuaXJcFQGwfTNMuzXWCyUr": {
            "id": "FfuaXJcFQGwfTNMuzXWCyUr",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Press Enter. This creates a new block. While the whole block is still selected press Ctrl+Alt+Down to select the next block type. Many blocks support multiple layouts. Switch them with Ctrl+Alt+Right.",
                "annotations": [
                    {
                        "start_offset": 6,
                        "end_offset": 11,
                        "node_id": "CpCARDQGFNdNtTqtJmGUgfU"
                    },
                    {
                        "start_offset": 85,
                        "end_offset": 98,
                        "node_id": "tEvwCCrEaGqPWeStQxZZrGQ"
                    },
                    {
                        "start_offset": 185,
                        "end_offset": 199,
                        "node_id": "nZKHXbhVMgzydvcHWkjvuHp"
                    }
                ]
            }
        },
        "fgdUqhtVCdcEbjHwKmKCgqe": {
            "id": "fgdUqhtVCdcEbjHwKmKCgqe",
            "type": "strong"
        },
        "GxDRTsjzaqFJfNRcENDCqTU": {
            "id": "GxDRTsjzaqFJfNRcENDCqTU",
            "type": "strong"
        },
        "RQJJwzbjfRzeePxsnUpkebc": {
            "id": "RQJJwzbjfRzeePxsnUpkebc",
            "type": "strong"
        },
        "dwMqDGUwHVvVkdzahPEWDuR": {
            "id": "dwMqDGUwHVvVkdzahPEWDuR",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Select multiple whole blocks by dragging from a top-level block gap. Press Cmd+X to cut these sections. Now select another top-level gap and paste them with Cmd+V. This works everywhere, including the top-level nav and the footer links.",
                "annotations": [
                    {
                        "start_offset": 75,
                        "end_offset": 80,
                        "node_id": "fgdUqhtVCdcEbjHwKmKCgqe"
                    },
                    {
                        "start_offset": 157,
                        "end_offset": 162,
                        "node_id": "GxDRTsjzaqFJfNRcENDCqTU"
                    },
                    {
                        "start_offset": 32,
                        "end_offset": 67,
                        "node_id": "RQJJwzbjfRzeePxsnUpkebc"
                    }
                ]
            }
        },
        "KGdTbszPsbFNkrPMbGSJwpX": {
            "id": "KGdTbszPsbFNkrPMbGSJwpX",
            "type": "strong"
        },
        "gRAyWEXjtgjxsZcFPTFNwTw": {
            "id": "gRAyWEXjtgjxsZcFPTFNwTw",
            "type": "strong"
        },
        "uNprzMQcMQztTppEeTKssBd": {
            "id": "uNprzMQcMQztTppEeTKssBd",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Pro tip: To select the enclosing block, press ESC multiple times. Useful when you currently edit text, but want to change the layout at a higher level.",
                "annotations": [
                    {
                        "start_offset": 46,
                        "end_offset": 49,
                        "node_id": "KGdTbszPsbFNkrPMbGSJwpX"
                    },
                    {
                        "start_offset": 0,
                        "end_offset": 8,
                        "node_id": "gRAyWEXjtgjxsZcFPTFNwTw"
                    }
                ]
            }
        },
        "prose_1": {
            "id": "prose_1",
            "type": "prose",
            "layout": 1,
            "content": [
                "HWcSGEAsZyfeQFjgvKrMpZc",
                "heading_1",
                "paragraph_1",
                "FfuaXJcFQGwfTNMuzXWCyUr",
                "dwMqDGUwHVvVkdzahPEWDuR",
                "uNprzMQcMQztTppEeTKssBd"
            ]
        },
        "AHXsSZcYYwnXKYzHbDnSRRh": {
            "id": "AHXsSZcYYwnXKYzHbDnSRRh",
            "type": "text",
            "layout": 5,
            "content": {
                "text": "IMAGES",
                "annotations": []
            }
        },
        "gallery_1_intro_text": {
            "id": "gallery_1_intro_text",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "Add images to a gallery",
                "annotations": []
            }
        },
        "MqTMgFwNJjMjvwQRbBsRbXB": {
            "id": "MqTMgFwNJjMjvwQRbBsRbXB",
            "type": "strong"
        },
        "pmWcAFvaSjAXwBRUHCDQThJ": {
            "id": "pmWcAFvaSjAXwBRUHCDQThJ",
            "type": "strong"
        },
        "DpajqNKpCCFFqZHtbttRRwM": {
            "id": "DpajqNKpCCFFqZHtbttRRwM",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Open a folder on your computer that has some images. Select a couple and copy them with ⌘+C. Now put the cursor after an image in the gallery below. Paste your images with ⌘+V.",
                "annotations": [
                    {
                        "start_offset": 88,
                        "end_offset": 91,
                        "node_id": "MqTMgFwNJjMjvwQRbBsRbXB"
                    },
                    {
                        "start_offset": 172,
                        "end_offset": 175,
                        "node_id": "pmWcAFvaSjAXwBRUHCDQThJ"
                    }
                ]
            }
        },
        "SkRzjYjZtzJYCDksZKAZFZs": {
            "id": "SkRzjYjZtzJYCDksZKAZFZs",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "You can also replace images, by selecting an image and then paste.",
                "annotations": []
            }
        },
        "jEhPHUyzqvpNeSHYfKCkYgS": {
            "id": "jEhPHUyzqvpNeSHYfKCkYgS",
            "type": "image",
            "src": "/sample-images/2.jpg",
            "width": 800,
            "height": 600,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "wtvHDBrCzJVgacTaJqAwNJk": {
            "id": "wtvHDBrCzJVgacTaJqAwNJk",
            "type": "gallery_item",
            "image": "jEhPHUyzqvpNeSHYfKCkYgS"
        },
        "ZjdBYZdXQedwuTdVFGHdDEj": {
            "id": "ZjdBYZdXQedwuTdVFGHdDEj",
            "type": "image",
            "src": "/sample-images/3.jpg",
            "width": 800,
            "height": 600,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.6705601092896176,
            "focal_point_y": 0.4532274590163934,
            "object_fit": "cover"
        },
        "TQRANBXMrzXXZTtzxAYhhZf": {
            "id": "TQRANBXMrzXXZTtzxAYhhZf",
            "type": "gallery_item",
            "image": "ZjdBYZdXQedwuTdVFGHdDEj"
        },
        "CYZFDvXrnaqxAKrErdZtgTF": {
            "id": "CYZFDvXrnaqxAKrErdZtgTF",
            "type": "image",
            "src": "/sample-images/4.jpg",
            "width": 800,
            "height": 600,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.6223360655737706,
            "focal_point_y": 0.5899931693989071,
            "object_fit": "cover"
        },
        "beUAyJnBJXjTAKhxdYKntGJ": {
            "id": "beUAyJnBJXjTAKhxdYKntGJ",
            "type": "gallery_item",
            "image": "CYZFDvXrnaqxAKrErdZtgTF"
        },
        "eacGfUcvXCCcCkkRVJEzVQA": {
            "id": "eacGfUcvXCCcCkkRVJEzVQA",
            "type": "image",
            "src": "/sample-images/5.jpg",
            "width": 800,
            "height": 600,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "nHBtjKafchwuYjvfWRKfyPB": {
            "id": "nHBtjKafchwuYjvfWRKfyPB",
            "type": "gallery_item",
            "image": "eacGfUcvXCCcCkkRVJEzVQA"
        },
        "qpYkBxBfWxnHPXaHEYqmkNK": {
            "id": "qpYkBxBfWxnHPXaHEYqmkNK",
            "type": "image",
            "src": "/sample-images/6.jpg",
            "width": 800,
            "height": 600,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "SwVVZbqrUVwkbyRmfSfCTjH": {
            "id": "SwVVZbqrUVwkbyRmfSfCTjH",
            "type": "gallery_item",
            "image": "qpYkBxBfWxnHPXaHEYqmkNK"
        },
        "asBnEpdtbyJQCEvNWuyADWR": {
            "id": "asBnEpdtbyJQCEvNWuyADWR",
            "type": "image",
            "src": "/sample-images/7.jpg",
            "width": 800,
            "height": 600,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "tyPwGsNvAepCesRRspqreba": {
            "id": "tyPwGsNvAepCesRRspqreba",
            "type": "gallery_item",
            "image": "asBnEpdtbyJQCEvNWuyADWR"
        },
        "BPdekRaDEUcQZqtEwPwBvyu": {
            "id": "BPdekRaDEUcQZqtEwPwBvyu",
            "type": "gallery",
            "layout": 1,
            "intro": [
                "AHXsSZcYYwnXKYzHbDnSRRh",
                "gallery_1_intro_text",
                "DpajqNKpCCFFqZHtbttRRwM",
                "SkRzjYjZtzJYCDksZKAZFZs"
            ],
            "gallery_items": [
                "wtvHDBrCzJVgacTaJqAwNJk",
                "TQRANBXMrzXXZTtzxAYhhZf",
                "beUAyJnBJXjTAKhxdYKntGJ",
                "nHBtjKafchwuYjvfWRKfyPB",
                "SwVVZbqrUVwkbyRmfSfCTjH",
                "tyPwGsNvAepCesRRspqreba"
            ],
            "outro": []
        },
        "FMmrrRxdfRzhujVmergnVxA": {
            "id": "FMmrrRxdfRzhujVmergnVxA",
            "type": "text",
            "layout": 5,
            "content": {
                "text": "Links",
                "annotations": []
            }
        },
        "AjbSGnXVcWpHBurCTrKxYSs": {
            "id": "AjbSGnXVcWpHBurCTrKxYSs",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "Link to other pages",
                "annotations": []
            }
        },
        "XnqUnfKXhvagBBEtfBHkCMS": {
            "id": "XnqUnfKXhvagBBEtfBHkCMS",
            "type": "link",
            "href": "https://mutter.co",
            "target": "_blank"
        },
        "mNdyyHZgUEQBdRQUQVsuryV": {
            "id": "mNdyyHZgUEQBdRQUQVsuryV",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Johannes Mutter and I have already launched a few sites that are in-place editable.",
                "annotations": [
                    {
                        "start_offset": 0,
                        "end_offset": 15,
                        "node_id": "XnqUnfKXhvagBBEtfBHkCMS"
                    }
                ]
            }
        },
        "link_collection_item_2_image": {
            "id": "link_collection_item_2_image",
            "type": "image",
            "src": "/sample-images/colbourns.webp",
            "width": 800,
            "height": 600,
            "alt": "Customization",
            "scale": 1.1046221254112045,
            "focal_point_x": 0.44171255631911605,
            "focal_point_y": 0.5189998480012166,
            "object_fit": "cover"
        },
        "link_collection_item_2": {
            "id": "link_collection_item_2",
            "type": "link_collection_item",
            "href": "https://colbourns.com",
            "target": "_blank",
            "image": "link_collection_item_2_image",
            "preline": {
                "text": "Flooring design",
                "annotations": []
            },
            "title": {
                "text": "Colbourns",
                "annotations": []
            },
            "description": {
                "text": "London-based designer of premium-quality, elegant rugs.",
                "annotations": []
            }
        },
        "ReRqxYxMdAUVaMuudfJhzsS": {
            "id": "ReRqxYxMdAUVaMuudfJhzsS",
            "type": "image",
            "src": "/sample-images/tomorrow-vc.webp",
            "width": 800,
            "height": 600,
            "alt": "Svedit documentation",
            "scale": 1,
            "focal_point_x": 0.37967324276969855,
            "focal_point_y": 0.928836332684825,
            "object_fit": "cover"
        },
        "YnBCBuemwpaUxQwHrFJNgMW": {
            "id": "YnBCBuemwpaUxQwHrFJNgMW",
            "type": "link_collection_item",
            "href": "https://tomorrow.vc",
            "target": "_blank",
            "image": "ReRqxYxMdAUVaMuudfJhzsS",
            "preline": {
                "text": "VENtURE CAPITAL",
                "annotations": []
            },
            "title": {
                "text": "Visionaries Tomorrow",
                "annotations": []
            },
            "description": {
                "text": "An early-stage industrial deep tech fund.",
                "annotations": []
            }
        },
        "SwaNBGTTykjgVTHJsUCgHuB": {
            "id": "SwaNBGTTykjgVTHJsUCgHuB",
            "type": "image",
            "src": "/sample-images/gluecksmaurer.webp",
            "width": 800,
            "height": 600,
            "alt": "Getting started",
            "scale": 1,
            "focal_point_x": 0.36639671907333987,
            "focal_point_y": 0.5451422665369637,
            "object_fit": "cover"
        },
        "AVydYvhksUBMjCSEccZJGXa": {
            "id": "AVydYvhksUBMjCSEccZJGXa",
            "type": "link_collection_item",
            "href": "https://gluecksmaurer.de",
            "target": "_blank",
            "image": "SwaNBGTTykjgVTHJsUCgHuB",
            "preline": {
                "text": "Real Estate",
                "annotations": []
            },
            "title": {
                "text": "Glücksmaurer",
                "annotations": []
            },
            "description": {
                "text": "Innovative real estate agent in Worms, Germany.",
                "annotations": []
            }
        },
        "vbjEnekAgSwRBffjUXUBCxM": {
            "id": "vbjEnekAgSwRBffjUXUBCxM",
            "type": "strong"
        },
        "YqbRJjNqVrWGnSyKNjHjtpq": {
            "id": "YqbRJjNqVrWGnSyKNjHjtpq",
            "type": "strong"
        },
        "zNnBwMTsCRnDkJmDKGzAPsD": {
            "id": "zNnBwMTsCRnDkJmDKGzAPsD",
            "type": "strong"
        },
        "fDzAKPaVuZXPrmxUwktkSzU": {
            "id": "fDzAKPaVuZXPrmxUwktkSzU",
            "type": "strong"
        },
        "bCJcAyERSdbjXEPNbPQEpmg": {
            "id": "bCJcAyERSdbjXEPNbPQEpmg",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Click on one of the cards above. It will show a little link preview at the bottom of the card. Click edit or press Cmd+K to bring up the link editor. Change the url you want to link to and press Enter.",
                "annotations": [
                    {
                        "start_offset": 0,
                        "end_offset": 5,
                        "node_id": "vbjEnekAgSwRBffjUXUBCxM"
                    },
                    {
                        "start_offset": 55,
                        "end_offset": 67,
                        "node_id": "YqbRJjNqVrWGnSyKNjHjtpq"
                    },
                    {
                        "start_offset": 115,
                        "end_offset": 120,
                        "node_id": "zNnBwMTsCRnDkJmDKGzAPsD"
                    },
                    {
                        "start_offset": 195,
                        "end_offset": 200,
                        "node_id": "fDzAKPaVuZXPrmxUwktkSzU"
                    }
                ]
            }
        },
        "RNEtTPYtgVXzkqRsaJxVyDb": {
            "id": "RNEtTPYtgVXzkqRsaJxVyDb",
            "type": "strong"
        },
        "rTNFjAJQKBQdktmmZBgrvNq": {
            "id": "rTNFjAJQKBQdktmmZBgrvNq",
            "type": "highlight"
        },
        "eHMzaBPMwqEkvrZFvRCsRKB": {
            "id": "eHMzaBPMwqEkvrZFvRCsRKB",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Now is a good time to save your changes with Cmd+S.",
                "annotations": [
                    {
                        "start_offset": 45,
                        "end_offset": 50,
                        "node_id": "RNEtTPYtgVXzkqRsaJxVyDb"
                    },
                    {
                        "start_offset": 22,
                        "end_offset": 39,
                        "node_id": "rTNFjAJQKBQdktmmZBgrvNq"
                    }
                ]
            }
        },
        "link_collection_1": {
            "id": "link_collection_1",
            "type": "link_collection",
            "layout": 1,
            "intro": [
                "FMmrrRxdfRzhujVmergnVxA",
                "AjbSGnXVcWpHBurCTrKxYSs",
                "mNdyyHZgUEQBdRQUQVsuryV"
            ],
            "link_collection_items": [
                "link_collection_item_2",
                "YnBCBuemwpaUxQwHrFJNgMW",
                "AVydYvhksUBMjCSEccZJGXa"
            ],
            "outro": [
                "bCJcAyERSdbjXEPNbPQEpmg",
                "eHMzaBPMwqEkvrZFvRCsRKB"
            ]
        },
        "hqrrTdEbTPaqzEcYMczhBZb": {
            "id": "hqrrTdEbTPaqzEcYMczhBZb",
            "type": "image",
            "src": "/sample-images/michael.jpg",
            "width": 682,
            "height": 1024,
            "alt": "Feature image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "feature_2_intro_heading": {
            "id": "feature_2_intro_heading",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "Hello, I'm Michael",
                "annotations": []
            }
        },
        "RrpSjGbCdmKKSgjedcufHWu": {
            "id": "RrpSjGbCdmKKSgjedcufHWu",
            "type": "strong"
        },
        "tEdhDXtJUrYJnMjrUWFYjNS": {
            "id": "tEdhDXtJUrYJnMjrUWFYjNS",
            "type": "strong"
        },
        "jByjZepmsrsgWCbRGRbRGrM": {
            "id": "jByjZepmsrsgWCbRGRbRGrM",
            "type": "highlight"
        },
        "feature_2_outro_paragraph": {
            "id": "feature_2_outro_paragraph",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "And you just tried Editable Website. I made it for developers who want to control the structure and layout in code, while allowing site owners to edit content in a way that's intuitive, fun, and \"just works.\"",
                "annotations": [
                    {
                        "start_offset": 19,
                        "end_offset": 35,
                        "node_id": "RrpSjGbCdmKKSgjedcufHWu"
                    },
                    {
                        "start_offset": 51,
                        "end_offset": 61,
                        "node_id": "tEdhDXtJUrYJnMjrUWFYjNS"
                    },
                    {
                        "start_offset": 195,
                        "end_offset": 208,
                        "node_id": "jByjZepmsrsgWCbRGRbRGrM"
                    }
                ]
            }
        },
        "SRHjbCFGMEvETHGsPTMwkhr": {
            "id": "SRHjbCFGMEvETHGsPTMwkhr",
            "type": "strong"
        },
        "grqHKByVFQSDZhumJjqvPxE": {
            "id": "grqHKByVFQSDZhumJjqvPxE",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "If you're not a programmer, but a curious tinkerer who is not afraid of step-by-step technical instructions, this might be for you as well.",
                "annotations": [
                    {
                        "start_offset": 34,
                        "end_offset": 50,
                        "node_id": "SRHjbCFGMEvETHGsPTMwkhr"
                    }
                ]
            }
        },
        "YTMHBcPkYXJMRUnuSAhrTDE": {
            "id": "YTMHBcPkYXJMRUnuSAhrTDE",
            "type": "feature",
            "layout": 1,
            "image": "hqrrTdEbTPaqzEcYMczhBZb",
            "intro": [
                "feature_2_intro_heading"
            ],
            "outro": [
                "feature_2_outro_paragraph",
                "grqHKByVFQSDZhumJjqvPxE"
            ]
        },
        "HCwAqVNTtuCzcJxYAyuSbPR": {
            "id": "HCwAqVNTtuCzcJxYAyuSbPR",
            "type": "strong"
        },
        "yegxmDUThczhsnzmQtKxGSy": {
            "id": "yegxmDUThczhsnzmQtKxGSy",
            "type": "strong"
        },
        "WypFyWvQzSeNxMkPQJNmxmv": {
            "id": "WypFyWvQzSeNxMkPQJNmxmv",
            "type": "highlight"
        },
        "PvpNcGKnqTTBbvbRZeDUYSN": {
            "id": "PvpNcGKnqTTBbvbRZeDUYSN",
            "type": "button",
            "layout": 1,
            "href": "https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform?usp=dialog",
            "target": "_blank",
            "label": {
                "text": "Sign up",
                "annotations": []
            }
        },
        "UBNYngEBJYtDWgeabtDJqWW": {
            "id": "UBNYngEBJYtDWgeabtDJqWW",
            "type": "hero",
            "title": {
                "text": "Join the waitlist",
                "annotations": []
            },
            "description": {
                "text": "Sign up to be notified when Editable Website is ready. I’ll invite the first few sign-ups to a face-to-face conversation.",
                "annotations": [
                    {
                        "start_offset": 95,
                        "end_offset": 120,
                        "node_id": "HCwAqVNTtuCzcJxYAyuSbPR"
                    },
                    {
                        "start_offset": 14,
                        "end_offset": 22,
                        "node_id": "yegxmDUThczhsnzmQtKxGSy"
                    },
                    {
                        "start_offset": 28,
                        "end_offset": 44,
                        "node_id": "WypFyWvQzSeNxMkPQJNmxmv"
                    }
                ]
            },
            "buttons": [
                "PvpNcGKnqTTBbvbRZeDUYSN"
            ],
            "layout": 3
        },
        "nav_logo": {
            "id": "nav_logo",
            "type": "image",
            "src": "/sample-images/logo.svg",
            "width": 100,
            "height": 100,
            "alt": "Logo",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "nav_item_1": {
            "id": "nav_item_1",
            "type": "nav_item",
            "layout": 1,
            "href": "/#prose_1",
            "label": {
                "text": "Editing",
                "annotations": []
            },
            "target": "_self"
        },
        "nav_item_2": {
            "id": "nav_item_2",
            "type": "nav_item",
            "layout": 1,
            "href": "/#BPdekRaDEUcQZqtEwPwBvyu",
            "label": {
                "text": "Images",
                "annotations": []
            },
            "target": "_self"
        },
        "nav_item_4": {
            "id": "nav_item_4",
            "type": "nav_item",
            "layout": 1,
            "href": "/#link_collection_1",
            "label": {
                "text": "Links",
                "annotations": []
            },
            "target": "_self"
        },
        "HGXFbpfvSREjXTrvUnMpkWu": {
            "id": "HGXFbpfvSREjXTrvUnMpkWu",
            "type": "nav_item",
            "layout": 2,
            "href": "#UBNYngEBJYtDWgeabtDJqWW",
            "target": "_self",
            "label": {
                "text": "Sign up",
                "annotations": []
            }
        },
        "nav_1": {
            "id": "nav_1",
            "type": "nav",
            "logo": "nav_logo",
            "nav_items": [
                "nav_item_1",
                "nav_item_2",
                "nav_item_4",
                "HGXFbpfvSREjXTrvUnMpkWu"
            ]
        },
        "footer_logo": {
            "id": "footer_logo",
            "type": "image",
            "src": "/sample-images/logo.svg",
            "width": 100,
            "height": 100,
            "alt": "Logo",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "WVvBSREFCThNYcpgvfUnWkF": {
            "id": "WVvBSREFCThNYcpgvfUnWkF",
            "type": "footer_link",
            "href": "/#prose_1",
            "target": "_self",
            "label": {
                "text": "Editing",
                "annotations": []
            }
        },
        "eDAnnFjNdZpzYMtpSqReBxf": {
            "id": "eDAnnFjNdZpzYMtpSqReBxf",
            "type": "footer_link",
            "href": "/#BPdekRaDEUcQZqtEwPwBvyu",
            "target": "_self",
            "label": {
                "text": "Images",
                "annotations": []
            }
        },
        "GwPeRFYtAyrcCMfpuyzdWZp": {
            "id": "GwPeRFYtAyrcCMfpuyzdWZp",
            "type": "footer_link",
            "href": "/#link_collection_1",
            "target": "_self",
            "label": {
                "text": "Links",
                "annotations": []
            }
        },
        "fcSSWQUTYajjknPChgGsPZz": {
            "id": "fcSSWQUTYajjknPChgGsPZz",
            "type": "footer_link_column",
            "footer_links": [
                "WVvBSREFCThNYcpgvfUnWkF",
                "eDAnnFjNdZpzYMtpSqReBxf",
                "GwPeRFYtAyrcCMfpuyzdWZp"
            ],
            "label": {
                "text": "Demo",
                "annotations": []
            }
        },
        "uavzfSnSpTRrHSfJpbfvpsh": {
            "id": "uavzfSnSpTRrHSfJpbfvpsh",
            "type": "footer_link",
            "href": "https://github.com/michael/editable-website",
            "target": "_blank",
            "label": {
                "text": "Source Code",
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
        "footer_column_2": {
            "id": "footer_column_2",
            "type": "footer_link_column",
            "label": {
                "text": "Resources",
                "annotations": []
            },
            "footer_links": [
                "uavzfSnSpTRrHSfJpbfvpsh",
                "footer_link_2_1"
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
        "footer_1": {
            "id": "footer_1",
            "type": "footer",
            "logo": "footer_logo",
            "copyright": {
                "text": "Copyright © Editable Website",
                "annotations": []
            },
            "footer_link_columns": [
                "fcSSWQUTYajjknPChgGsPZz",
                "footer_column_2",
                "footer_column_3"
            ]
        },
        "page_1": {
            "id": "page_1",
            "type": "page",
            "body": [
                "hero_1",
                "feature_1",
                "prose_1",
                "BPdekRaDEUcQZqtEwPwBvyu",
                "link_collection_1",
                "YTMHBcPkYXJMRUnuSAhrTDE",
                "UBNYngEBJYtDWgeabtDJqWW"
            ],
            "nav": "nav_1",
            "footer": "footer_1"
        }
    }
};
