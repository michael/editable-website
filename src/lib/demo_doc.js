// Seed data for the demo website
// Stored as a single merged document so you can paste console.logged JSON directly.
// NAV_1, FOOTER_1, PAGE_1 are extracted automatically using svedit's traverse utility.

import { traverse } from 'svedit';
import { document_schema } from '$lib/document_schema.js';

const FULL_DOC = {
    "document_id": "page_1",
    "nodes": {
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
        "RezNUsxYmfpmFMezpgEbqYu": {
            "id": "RezNUsxYmfpmFMezpgEbqYu",
            "type": "strong"
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
        "DxBvNYzBgktMyKjKkKyYcAN": {
            "id": "DxBvNYzBgktMyKjKkKyYcAN",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Looking for the admin panel? There isn't any! It's just you, and your content.",
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
        "HWcSGEAsZyfeQFjgvKrMpZc": {
            "id": "HWcSGEAsZyfeQFjgvKrMpZc",
            "type": "text",
            "layout": 5,
            "content": {
                "text": "Blocks",
                "annotations": []
            }
        },
        "heading_1": {
            "id": "heading_1",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "Build with blocks",
                "annotations": []
            }
        },
        "AmRQEvmJZPdcXuSgwRNsSzk": {
            "id": "AmRQEvmJZPdcXuSgwRNsSzk",
            "type": "strong"
        },
        "fuxtxNCceDRcdbcHhtqsYwJ": {
            "id": "fuxtxNCceDRcdbcHhtqsYwJ",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "In edit mode the dashed gaps let you add blocks.",
                "annotations": [
                    {
                        "start_offset": 17,
                        "end_offset": 28,
                        "node_id": "AmRQEvmJZPdcXuSgwRNsSzk"
                    }
                ]
            }
        },
        "MheDsAwTmfQDGqdkpMWgXUH": {
            "id": "MheDsAwTmfQDGqdkpMWgXUH",
            "type": "strong"
        },
        "XFwXMKjgMyyYRSemxHhemYh": {
            "id": "XFwXMKjgMyyYRSemxHhemYh",
            "type": "strong"
        },
        "wqkSZVmFDECjqksNpcRTVyz": {
            "id": "wqkSZVmFDECjqksNpcRTVyz",
            "type": "strong"
        },
        "dAEBKADbvfeaBMhNWgTjKNC": {
            "id": "dAEBKADbvfeaBMhNWgTjKNC",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Select the dashed gap below this paragraph to see a flashing purple cursor.\nPress Enter to add a block.\nChange text styles (paragraph > heading etc) with Ctrl + Shift + Right.",
                "annotations": [
                    {
                        "start_offset": 11,
                        "end_offset": 22,
                        "node_id": "MheDsAwTmfQDGqdkpMWgXUH"
                    },
                    {
                        "start_offset": 154,
                        "end_offset": 174,
                        "node_id": "XFwXMKjgMyyYRSemxHhemYh"
                    },
                    {
                        "start_offset": 82,
                        "end_offset": 87,
                        "node_id": "wqkSZVmFDECjqksNpcRTVyz"
                    }
                ]
            }
        },
        "kRSnDfvEsJkQjdrMZGSFQzt": {
            "id": "kRSnDfvEsJkQjdrMZGSFQzt",
            "type": "strong"
        },
        "PkjDmTSvXRPdtwcYmSUScYs": {
            "id": "PkjDmTSvXRPdtwcYmSUScYs",
            "type": "strong"
        },
        "zAmCJVJvxsvPMaqHkBgyaNx": {
            "id": "zAmCJVJvxsvPMaqHkBgyaNx",
            "type": "strong"
        },
        "tFBaRUUJkEmftcgEyEqTAVB": {
            "id": "tFBaRUUJkEmftcgEyEqTAVB",
            "type": "strong"
        },
        "dKDJFxDKresxkjMUZYKNuKn": {
            "id": "dKDJFxDKresxkjMUZYKNuKn",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Select one of the full width dashed gap to see a flashing purple cursor.\nPress Enter to create a new top-level block.\nCtrl + Shift + Down cycles through block types.\nAgain Ctrl + Shift + Right lets you flip through available layouts.",
                "annotations": [
                    {
                        "start_offset": 18,
                        "end_offset": 39,
                        "node_id": "kRSnDfvEsJkQjdrMZGSFQzt"
                    },
                    {
                        "start_offset": 79,
                        "end_offset": 84,
                        "node_id": "PkjDmTSvXRPdtwcYmSUScYs"
                    },
                    {
                        "start_offset": 118,
                        "end_offset": 137,
                        "node_id": "zAmCJVJvxsvPMaqHkBgyaNx"
                    },
                    {
                        "start_offset": 172,
                        "end_offset": 192,
                        "node_id": "tFBaRUUJkEmftcgEyEqTAVB"
                    }
                ]
            }
        },
        "rNjwbAzwSBeezHceJNjSdbq": {
            "id": "rNjwbAzwSBeezHceJNjSdbq",
            "type": "strong"
        },
        "dwMqDGUwHVvVkdzahPEWDuR": {
            "id": "dwMqDGUwHVvVkdzahPEWDuR",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "To move blocks, drag from a dashed gap to select multiple, then cut and paste like usual.",
                "annotations": [
                    {
                        "start_offset": 16,
                        "end_offset": 38,
                        "node_id": "rNjwbAzwSBeezHceJNjSdbq"
                    }
                ]
            }
        },
        "FGHDfRZMdeYQeVJBarNFeHa": {
            "id": "FGHDfRZMdeYQeVJBarNFeHa",
            "type": "strong"
        },
        "gkHzcWkcKRsYffDnwJtGnjG": {
            "id": "gkHzcWkcKRsYffDnwJtGnjG",
            "type": "strong"
        },
        "smJYScwGbZgRVDAJWhNGxvG": {
            "id": "smJYScwGbZgRVDAJWhNGxvG",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Pro tip: Press Esc to select the parent block. Useful when editing text but wanting to change the parent layout.",
                "annotations": [
                    {
                        "start_offset": 0,
                        "end_offset": 8,
                        "node_id": "FGHDfRZMdeYQeVJBarNFeHa"
                    },
                    {
                        "start_offset": 15,
                        "end_offset": 18,
                        "node_id": "gkHzcWkcKRsYffDnwJtGnjG"
                    }
                ]
            }
        },
        "xKmNqPrStVwYzAbCdEfGh": {
            "id": "xKmNqPrStVwYzAbCdEfGh",
            "type": "prose",
            "layout": 1,
            "colorset": 0,
            "content": [
                "HWcSGEAsZyfeQFjgvKrMpZc",
                "heading_1",
                "fuxtxNCceDRcdbcHhtqsYwJ",
                "dAEBKADbvfeaBMhNWgTjKNC",
                "dKDJFxDKresxkjMUZYKNuKn",
                "dwMqDGUwHVvVkdzahPEWDuR",
                "smJYScwGbZgRVDAJWhNGxvG"
            ]
        },
        "AHXsSZcYYwnXKYzHbDnSRRh": {
            "id": "AHXsSZcYYwnXKYzHbDnSRRh",
            "type": "text",
            "layout": 5,
            "content": {
                "text": "Media",
                "annotations": []
            }
        },
        "BfpsPAaqmJXnRrHzwJCSMHE": {
            "id": "BfpsPAaqmJXnRrHzwJCSMHE",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "Add images and videos",
                "annotations": []
            }
        },
        "DpajqNKpCCFFqZHtbttRRwM": {
            "id": "DpajqNKpCCFFqZHtbttRRwM",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Open a folder on your computer that has some images.\nSelect one and copy it to the clipboard.\nSelect the placeholder below and paste it.\nTo replace an image, select it first, then paste the new one on top.",
                "annotations": []
            }
        },
        "jEhPHUyzqvpNeSHYfKCkYgS": {
            "id": "jEhPHUyzqvpNeSHYfKCkYgS",
            "type": "image",
            "src": "user1-desktop.webp",
            "mime_type": "image/webp",
            "width": 200,
            "height": 150,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "wtvHDBrCzJVgacTaJqAwNJk": {
            "id": "wtvHDBrCzJVgacTaJqAwNJk",
            "type": "gallery_item",
            "media": "jEhPHUyzqvpNeSHYfKCkYgS"
        },
        "ZjdBYZdXQedwuTdVFGHdDEj": {
            "id": "ZjdBYZdXQedwuTdVFGHdDEj",
            "type": "image",
            "src": "user1-notebook.webp",
            "mime_type": "image/webp",
            "width": 200,
            "height": 150,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.6705601092896176,
            "focal_point_y": 0.4532274590163934,
            "object_fit": "cover"
        },
        "TQRANBXMrzXXZTtzxAYhhZf": {
            "id": "TQRANBXMrzXXZTtzxAYhhZf",
            "type": "gallery_item",
            "media": "ZjdBYZdXQedwuTdVFGHdDEj"
        },
        "UGfbRKEMbGwgcUjhpgXausS": {
            "id": "UGfbRKEMbGwgcUjhpgXausS",
            "type": "image",
            "src": "",
            "mime_type": "",
            "width": 800,
            "height": 600,
            "alt": "Sample image",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "HtSTZfjTcDSkttVaTUKMYAj": {
            "id": "HtSTZfjTcDSkttVaTUKMYAj",
            "type": "gallery_item",
            "media": "UGfbRKEMbGwgcUjhpgXausS"
        },
        "cMtzexVuqMWFgEpxhYjRQFq": {
            "id": "cMtzexVuqMWFgEpxhYjRQFq",
            "type": "strong"
        },
        "BKVAhVQRTzRGhGGqpfrQnsu": {
            "id": "BKVAhVQRTzRGhGGqpfrQnsu",
            "type": "strong"
        },
        "NKtUpjrVYCGaJWYKGACXprb": {
            "id": "NKtUpjrVYCGaJWYKGACXprb",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "You can even paste several images at once.\nSelect three or four from your computer and copy to the clipboard.\nNow select a vertical dashed area before or after an image above.\nPaste and all the images will be added in one go.",
                "annotations": [
                    {
                        "start_offset": 123,
                        "end_offset": 143,
                        "node_id": "cMtzexVuqMWFgEpxhYjRQFq"
                    },
                    {
                        "start_offset": 13,
                        "end_offset": 33,
                        "node_id": "BKVAhVQRTzRGhGGqpfrQnsu"
                    }
                ]
            }
        },
        "taTfSsusdNrNtvEEbwvvCPt": {
            "id": "taTfSsusdNrNtvEEbwvvCPt",
            "type": "image",
            "src": "pattern.svg",
            "mime_type": "image/svg+xml",
            "width": 1750,
            "height": 1000,
            "alt": "",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "vZpNjBJDjzQsgEDxbnjZqZn": {
            "id": "vZpNjBJDjzQsgEDxbnjZqZn",
            "type": "decoration",
            "media": "taTfSsusdNrNtvEEbwvvCPt",
            "media_max_width": 392,
            "media_aspect_ratio": 2.469
        },
        "tKWjTpQsZhnpjYxjkbxwfpf": {
            "id": "tKWjTpQsZhnpjYxjkbxwfpf",
            "type": "strong"
        },
        "UaGyncAczdzPgxVgFTWTKQq": {
            "id": "UaGyncAczdzPgxVgFTWTKQq",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "When you add images in the text flow, like the one above, you'll be able to change its size using the handles at the edges of the image.",
                "annotations": [
                    {
                        "start_offset": 102,
                        "end_offset": 122,
                        "node_id": "tKWjTpQsZhnpjYxjkbxwfpf"
                    }
                ]
            }
        },
        "yhaJyxTtEjzBeNfSTrSVMuV": {
            "src": "jellyfish.mp4",
            "mime_type": "video/mp4",
            "width": 1280,
            "height": 720,
            "alt": "",
            "scale": 1,
            "focal_point_x": 0.46228175811044075,
            "focal_point_y": 0.2649100629740638,
            "object_fit": "cover",
            "id": "yhaJyxTtEjzBeNfSTrSVMuV",
            "type": "video"
        },
        "VtypQSvWYZvrYAkuREkGeuS": {
            "id": "VtypQSvWYZvrYAkuREkGeuS",
            "type": "decoration",
            "media": "yhaJyxTtEjzBeNfSTrSVMuV",
            "media_max_width": 0,
            "media_aspect_ratio": 4.801
        },
        "HmvyYasKrgHfxrxJwJmMTWG": {
            "id": "HmvyYasKrgHfxrxJwJmMTWG",
            "type": "strong"
        },
        "QBraqQRMdNCQwQDjeSRDfwh": {
            "id": "QBraqQRMdNCQwQDjeSRDfwh",
            "type": "strong"
        },
        "xbVnQmJVjKxWrrybpMvCqEM": {
            "id": "xbVnQmJVjKxWrrybpMvCqEM",
            "type": "strong"
        },
        "RfqVZncyRmeDMUcnkdVvTJX": {
            "id": "RfqVZncyRmeDMUcnkdVvTJX",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "You can even paste short video clips onto any media placeholder. Currently .mp4 , .webm, and of course .gif are supported.",
                "annotations": [
                    {
                        "start_offset": 75,
                        "end_offset": 79,
                        "node_id": "HmvyYasKrgHfxrxJwJmMTWG"
                    },
                    {
                        "start_offset": 82,
                        "end_offset": 87,
                        "node_id": "QBraqQRMdNCQwQDjeSRDfwh"
                    },
                    {
                        "start_offset": 103,
                        "end_offset": 107,
                        "node_id": "xbVnQmJVjKxWrrybpMvCqEM"
                    }
                ]
            }
        },
        "BPdekRaDEUcQZqtEwPwBvyu": {
            "id": "BPdekRaDEUcQZqtEwPwBvyu",
            "type": "gallery",
            "layout": 1,
            "colorset": 0,
            "intro": [
                "AHXsSZcYYwnXKYzHbDnSRRh",
                "BfpsPAaqmJXnRrHzwJCSMHE",
                "DpajqNKpCCFFqZHtbttRRwM"
            ],
            "gallery_items": [
                "wtvHDBrCzJVgacTaJqAwNJk",
                "TQRANBXMrzXXZTtzxAYhhZf",
                "HtSTZfjTcDSkttVaTUKMYAj"
            ],
            "outro": [
                "NKtUpjrVYCGaJWYKGACXprb",
                "vZpNjBJDjzQsgEDxbnjZqZn",
                "UaGyncAczdzPgxVgFTWTKQq",
                "VtypQSvWYZvrYAkuREkGeuS",
                "RfqVZncyRmeDMUcnkdVvTJX"
            ]
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
        "XDMsYPfWXKqvhCMsEDWfDnx": {
            "id": "XDMsYPfWXKqvhCMsEDWfDnx",
            "type": "strong"
        },
        "VdjTDrdPmtXRuYKNUMeRmKK": {
            "id": "VdjTDrdPmtXRuYKNUMeRmKK",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Click on one of the cards below.\nA link preview appears at the bottom.\nClick “EDIT” or press ⌘ / Ctrl + k to bring up the link editor.",
                "annotations": [
                    {
                        "start_offset": 93,
                        "end_offset": 105,
                        "node_id": "XDMsYPfWXKqvhCMsEDWfDnx"
                    }
                ]
            }
        },
        "nprCMwYvJvUEmRaHBsxfgUd": {
            "id": "nprCMwYvJvUEmRaHBsxfgUd",
            "type": "image",
            "src": "gluecksmaurer.webp",
            "mime_type": "image/png",
            "width": 186,
            "height": 120,
            "alt": "",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "JUmgwJDKqdxVxJeBHkBdjVq": {
            "id": "JUmgwJDKqdxVxJeBHkBdjVq",
            "type": "link_collection_item",
            "href": "https://gluecksmaurer.de",
            "target": "_blank",
            "media": "nprCMwYvJvUEmRaHBsxfgUd",
            "preline": {
                "text": "Real estate",
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
        "link_collection_item_2_image": {
            "id": "link_collection_item_2_image",
            "type": "image",
            "src": "colbourns.webp",
            "mime_type": "image/png",
            "width": 180,
            "height": 112,
            "alt": "",
            "scale": 1,
            "focal_point_x": 0.5008655894886364,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "link_collection_item_2": {
            "id": "link_collection_item_2",
            "type": "link_collection_item",
            "href": "https://colbourns.com",
            "target": "_blank",
            "media": "link_collection_item_2_image",
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
            "src": "tomorrow-vc.webp",
            "mime_type": "image/png",
            "width": 218,
            "height": 202,
            "alt": "",
            "scale": 1,
            "focal_point_x": 0.5,
            "focal_point_y": 0.5,
            "object_fit": "cover"
        },
        "YnBCBuemwpaUxQwHrFJNgMW": {
            "id": "YnBCBuemwpaUxQwHrFJNgMW",
            "type": "link_collection_item",
            "href": "https://tomorrow.vc",
            "target": "_blank",
            "media": "ReRqxYxMdAUVaMuudfJhzsS",
            "preline": {
                "text": "Venture capital",
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
        "VqaqUWzRKUJrZzQYqqurggB": {
            "id": "VqaqUWzRKUJrZzQYqqurggB",
            "type": "link",
            "href": "https://mutter.co",
            "target": "_blank"
        },
        "kZQHRTYyJtbmsJfnXaRgVtZ": {
            "id": "kZQHRTYyJtbmsJfnXaRgVtZ",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "The cards above are links to examples of live in-place editable websites Johannes Mutter and I have already launched using this technology. You can see that any design is possible — it’s just HTML and CSS.",
                "annotations": [
                    {
                        "start_offset": 73,
                        "end_offset": 88,
                        "node_id": "VqaqUWzRKUJrZzQYqqurggB"
                    }
                ]
            }
        },
        "jLnPqRsTuVwXyZaBcDeFg": {
            "id": "jLnPqRsTuVwXyZaBcDeFg",
            "type": "link_collection",
            "layout": 1,
            "colorset": 0,
            "intro": [
                "FMmrrRxdfRzhujVmergnVxA",
                "AjbSGnXVcWpHBurCTrKxYSs",
                "VdjTDrdPmtXRuYKNUMeRmKK"
            ],
            "link_collection_items": [
                "JUmgwJDKqdxVxJeBHkBdjVq",
                "link_collection_item_2",
                "YnBCBuemwpaUxQwHrFJNgMW"
            ],
            "outro": [
                "kZQHRTYyJtbmsJfnXaRgVtZ"
            ]
        },
        "pkcwHuntQjySVjwuVNaSTge": {
            "id": "pkcwHuntQjySVjwuVNaSTge",
            "type": "text",
            "layout": 5,
            "content": {
                "text": "Built for developers, designed for everyone",
                "annotations": []
            }
        },
        "AQHAsyghanqZPmyutAJZBxM": {
            "id": "AQHAsyghanqZPmyutAJZBxM",
            "type": "text",
            "layout": 2,
            "content": {
                "text": "How does this work?",
                "annotations": []
            }
        },
        "vgwPcMefbMumuCsVyAPHhUz": {
            "id": "vgwPcMefbMumuCsVyAPHhUz",
            "type": "link",
            "href": "https://svelte.dev/docs/kit/introduction",
            "target": "_blank"
        },
        "qHveqveRzQxJzxGakaarEwb": {
            "id": "qHveqveRzQxJzxGakaarEwb",
            "type": "link",
            "href": "https://sqlite.org",
            "target": "_blank"
        },
        "sheNSfrhuAfrBWSKfvWPYGg": {
            "id": "sheNSfrhuAfrBWSKfvWPYGg",
            "type": "link",
            "href": "https://svelte.dev",
            "target": "_blank"
        },
        "NZHwrDvtUBdpyDMvRJEGPcc": {
            "id": "NZHwrDvtUBdpyDMvRJEGPcc",
            "type": "link",
            "href": "https://svedit.dev",
            "target": "_blank"
        },
        "PscvEBWBfhraXpPKjPPkCMC": {
            "id": "PscvEBWBfhraXpPKjPPkCMC",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "This site is powered by Svelte and Svedit — an open source rich text editor I’ve created. Editable Website builds on SvelteKit and SQLite to enable full websites with multiple pages and a persistent backend where only an admin can make changes.",
                "annotations": [
                    {
                        "start_offset": 117,
                        "end_offset": 126,
                        "node_id": "vgwPcMefbMumuCsVyAPHhUz"
                    },
                    {
                        "start_offset": 131,
                        "end_offset": 137,
                        "node_id": "qHveqveRzQxJzxGakaarEwb"
                    },
                    {
                        "start_offset": 24,
                        "end_offset": 30,
                        "node_id": "sheNSfrhuAfrBWSKfvWPYGg"
                    },
                    {
                        "start_offset": 35,
                        "end_offset": 41,
                        "node_id": "NZHwrDvtUBdpyDMvRJEGPcc"
                    }
                ]
            }
        },
        "hpXfpDueZmgNjRfMUBREPnh": {
            "id": "hpXfpDueZmgNjRfMUBREPnh",
            "type": "link",
            "href": "https://github.com/michael/editable-website",
            "target": "_blank"
        },
        "EsVdYMdJuVqGfqpQmMBCtap": {
            "id": "EsVdYMdJuVqGfqpQmMBCtap",
            "type": "text",
            "layout": 1,
            "content": {
                "text": "Take a look at the source code for this site.",
                "annotations": [
                    {
                        "start_offset": 19,
                        "end_offset": 30,
                        "node_id": "hpXfpDueZmgNjRfMUBREPnh"
                    }
                ]
            }
        },
        "XVJGXtwnQMvcrcuByAtcWNa": {
            "id": "XVJGXtwnQMvcrcuByAtcWNa",
            "type": "prose",
            "layout": 1,
            "colorset": 0,
            "content": [
                "pkcwHuntQjySVjwuVNaSTge",
                "AQHAsyghanqZPmyutAJZBxM",
                "PscvEBWBfhraXpPKjPPkCMC",
                "EsVdYMdJuVqGfqpQmMBCtap"
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
        "gnbpgBsBYZqEwRxqRZSMHdd": {
            "id": "gnbpgBsBYZqEwRxqRZSMHdd",
            "type": "link",
            "href": "https://letsken.com/michael/how-to-implement-a-web-based-rich-text-editor-in-2023",
            "target": "_blank"
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
        "ERqkusuryvGKBzKayXyhxXE": {
            "id": "ERqkusuryvGKBzKayXyhxXE",
            "type": "link",
            "href": "https://mutter.co",
            "target": "_blank"
        },
        "XCdmKqAtyRNPKKRZJaNUfyX": {
            "id": "XCdmKqAtyRNPKKRZJaNUfyX",
            "type": "link",
            "href": "https://keybits.net",
            "target": "_blank"
        },
        "yjdxqchTwgSjeTVgXeZhrrv": {
            "id": "yjdxqchTwgSjeTVgXeZhrrv",
            "type": "link",
            "href": "https://sonjastojanovic.com",
            "target": "_blank"
        },
        "TPsjXxZhtuyfJQRytAVcRgJ": {
            "id": "TPsjXxZhtuyfJQRytAVcRgJ",
            "type": "link",
            "href": "https://trails-shop.at",
            "target": "_blank"
        },
        "SUfVhRdtQwruDYJvgkETZxk": {
            "id": "SUfVhRdtQwruDYJvgkETZxk",
            "type": "link",
            "href": "https://postlmayrdesign.com",
            "target": "_blank"
        },
        "amXvCtNxBsTJFzfeTCpdMsN": {
            "id": "amXvCtNxBsTJFzfeTCpdMsN",
            "type": "link",
            "href": "https://aufreiter.co",
            "target": "_blank"
        },
        "PjwvEAbrZCxZFcqJqayVyhR": {
            "id": "PjwvEAbrZCxZFcqJqayVyhR",
            "type": "text",
            "layout": 5,
            "content": {
                "text": "Big thanks to Johannes Mutter for helping with concept, design, and engineering, Tom Atkins for support with positioning and copywriting, and Sonja Stojanovic for modelling and being the very first happy Editable Website user — followed by Trails, Postlmayr Design, Aufreiter Architektur, and many more.",
                "annotations": [
                    {
                        "start_offset": 14,
                        "end_offset": 29,
                        "node_id": "ERqkusuryvGKBzKayXyhxXE"
                    },
                    {
                        "start_offset": 81,
                        "end_offset": 91,
                        "node_id": "XCdmKqAtyRNPKKRZJaNUfyX"
                    },
                    {
                        "start_offset": 142,
                        "end_offset": 158,
                        "node_id": "yjdxqchTwgSjeTVgXeZhrrv"
                    },
                    {
                        "start_offset": 240,
                        "end_offset": 246,
                        "node_id": "TPsjXxZhtuyfJQRytAVcRgJ"
                    },
                    {
                        "start_offset": 248,
                        "end_offset": 264,
                        "node_id": "SUfVhRdtQwruDYJvgkETZxk"
                    },
                    {
                        "start_offset": 266,
                        "end_offset": 287,
                        "node_id": "amXvCtNxBsTJFzfeTCpdMsN"
                    }
                ]
            }
        },
        "wmrbpSFAFUmMRPDumcjKqpF": {
            "id": "wmrbpSFAFUmMRPDumcjKqpF",
            "type": "prose",
            "layout": 2,
            "colorset": 0,
            "content": [
                "PjwvEAbrZCxZFcqJqayVyhR"
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
            "href": "/#XVJGXtwnQMvcrcuByAtcWNa",
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
        "EtcfbabRCtPSvSpfFfjPeza": {
            "id": "EtcfbabRCtPSvSpfFfjPeza",
            "type": "footer_link",
            "href": "/#RtYpQwXsZvNmKjHgFdSaLe",
            "target": "_self",
            "label": {
                "text": "Editing",
                "annotations": []
            }
        },
        "WVvBSREFCThNYcpgvfUnWkF": {
            "id": "WVvBSREFCThNYcpgvfUnWkF",
            "type": "footer_link",
            "href": "/#xKmNqPrStVwYzAbCdEfGh",
            "target": "_self",
            "label": {
                "text": "Blocks",
                "annotations": []
            }
        },
        "eDAnnFjNdZpzYMtpSqReBxf": {
            "id": "eDAnnFjNdZpzYMtpSqReBxf",
            "type": "footer_link",
            "href": "/#BPdekRaDEUcQZqtEwPwBvyu",
            "target": "_self",
            "label": {
                "text": "Media",
                "annotations": []
            }
        },
        "GwPeRFYtAyrcCMfpuyzdWZp": {
            "id": "GwPeRFYtAyrcCMfpuyzdWZp",
            "type": "footer_link",
            "href": "/#jLnPqRsTuVwXyZaBcDeFg",
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
                "text": "© Editable Website",
                "annotations": []
            },
            "footer_link_columns": [
                "fcSSWQUTYajjknPChgGsPZz",
                "footer_column_2",
                "footer_column_3"
            ],
            "logo_max_width": 88
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
        "page_1": {
            "id": "page_1",
            "type": "page",
            "title": {
                "text": "",
                "annotations": []
            },
            "description": {
                "text": "",
                "annotations": []
            },
            "image": "page_image_1",
            "body": [
                "hero_1",
                "RtYpQwXsZvNmKjHgFdSaLe",
                "xKmNqPrStVwYzAbCdEfGh",
                "BPdekRaDEUcQZqtEwPwBvyu",
                "jLnPqRsTuVwXyZaBcDeFg",
                "XVJGXtwnQMvcrcuByAtcWNa",
                "YTMHBcPkYXJMRUnuSAhrTDE",
                "UBNYngEBJYtDWgeabtDJqWW",
                "wmrbpSFAFUmMRPDumcjKqpF"
            ],
            "nav": "nav_1",
            "footer": "footer_1"
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
const nav_root_id = page_node.nav;       // "nav_1"
const footer_root_id = page_node.footer; // "footer_1"

export const NAV_1 = extract_document(FULL_DOC.nodes, nav_root_id);
export const FOOTER_1 = extract_document(FULL_DOC.nodes, footer_root_id);

// PAGE_1 gets everything reachable from page_1, minus nav/footer subtrees
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

// Merged document for static deployment (Vercel demo)
export const demo_doc = {
    document_id: PAGE_1.document_id,
    nodes: { ...PAGE_1.nodes, ...NAV_1.nodes, ...FOOTER_1.nodes }
};
