// Seed data for the demo website
// Stored as a single merged document so you can paste console.logged JSON directly.
// NAV_1, FOOTER_1, PAGE_1 are extracted automatically using svedit's traverse utility.

import { traverse } from 'svedit';
import { document_schema } from '$lib/document_schema.js';

const FULL_DOC = {
	document_id: 'page_1',
	nodes: {
		vMaUqeqBAVSyPgDpnxWWPCK: {
			id: 'vMaUqeqBAVSyPgDpnxWWPCK',
			type: 'image',
			src: 'logo.svg',
			mime_type: 'image/svg+xml',
			width: 100,
			height: 100,
			alt: 'Logo',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		HyjHnPRuGUqPQYJQATcuKpP: {
			id: 'HyjHnPRuGUqPQYJQATcuKpP',
			type: 'heading_1',
			layout: 1,
			content: {
				text: 'Imagine you could edit your website live on the page',
				annotations: []
			}
		},
		GcUtrrnqbpxJJJuZvGyPfuk: {
			id: 'GcUtrrnqbpxJJJuZvGyPfuk',
			type: 'paragraph_xl',
			layout: 2,
			content: {
				text: 'Dream no more…',
				annotations: []
			}
		},
		MHcsYrCNDUyJxpyfzRNtpFk: {
			id: 'MHcsYrCNDUyJxpyfzRNtpFk',
			type: 'button',
			layout: 1,
			href: 'https://github.com/michael/editable-website#getting-started',
			target: '_blank',
			label: {
				text: 'Join the Technical Preview',
				annotations: []
			}
		},
		DpRXucgvAFRBDsVUJqSduSQ: {
			id: 'DpRXucgvAFRBDsVUJqSduSQ',
			type: 'button_group',
			buttons: ['MHcsYrCNDUyJxpyfzRNtpFk']
		},
		gRpPsPcYyMPRSWWDXxvNGAF: {
			id: 'gRpPsPcYyMPRSWWDXxvNGAF',
			type: 'prose',
			layout: 4,
			colorset: 0,
			content: ['HyjHnPRuGUqPQYJQATcuKpP', 'GcUtrrnqbpxJJJuZvGyPfuk', 'DpRXucgvAFRBDsVUJqSduSQ']
		},
		VbNcMxZaQwErTyUiOpLkJh: {
			id: 'VbNcMxZaQwErTyUiOpLkJh',
			type: 'image',
			src: 'cmde.webp',
			mime_type: 'image/webp',
			width: 192,
			height: 256,
			alt: 'Feature image',
			scale: 1,
			focal_point_x: 0.5329817181174089,
			focal_point_y: 0.47301940896272265,
			object_fit: 'cover'
		},
		eVNBZTZDFEfcPNkrZdEQBHm: {
			id: 'eVNBZTZDFEfcPNkrZdEQBHm',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'This is Editable Website',
				annotations: []
			}
		},
		RezNUsxYmfpmFMezpgEbqYu: {
			id: 'RezNUsxYmfpmFMezpgEbqYu',
			type: 'strong'
		},
		pmSDwGrMkaxGCDZMXambaYj: {
			id: 'pmSDwGrMkaxGCDZMXambaYj',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Press ⌘ / Ctrl + e to enter edit mode.\nClick where you want to edit.\nMove around with the arrow keys.\nChange anything you see!',
				annotations: [
					{
						start_offset: 6,
						end_offset: 18,
						node_id: 'RezNUsxYmfpmFMezpgEbqYu'
					}
				]
			}
		},
		NhhsYbqTRzPtpQcHFUgwFhP: {
			id: 'NhhsYbqTRzPtpQcHFUgwFhP',
			type: 'strong'
		},
		ypAZzWFdhamCaTMKmZMZPMm: {
			id: 'ypAZzWFdhamCaTMKmZMZPMm',
			type: 'strong'
		},
		wuyFjXptXyMvgYKUcvtTggC: {
			id: 'wuyFjXptXyMvgYKUcvtTggC',
			type: 'strong'
		},
		ZWDXzUmKJbqDwJbNTbhEtWQ: {
			id: 'ZWDXzUmKJbqDwJbNTbhEtWQ',
			type: 'strong'
		},
		zqyQQtSbzxtdTTsVTYuuXEh: {
			id: 'zqyQQtSbzxtdTTsVTYuuXEh',
			type: 'strong'
		},
		CUTpvupqUbXQDyMjBczwfCj: {
			id: 'CUTpvupqUbXQDyMjBczwfCj',
			type: 'emphasis'
		},
		PYHXbxRMREHBpAqxbdsUXzP: {
			id: 'PYHXbxRMREHBpAqxbdsUXzP',
			type: 'strong'
		},
		djTpcsEQTzfGMSRctKenpWt: {
			id: 'djTpcsEQTzfGMSRctKenpWt',
			type: 'emphasis'
		},
		eUteADFhxtenJraxpeprgHr: {
			id: 'eUteADFhxtenJraxpeprgHr',
			type: 'link',
			href: '#',
			target: '_self'
		},
		WjasMkTrmjdrXTsDgeUHQap: {
			id: 'WjasMkTrmjdrXTsDgeUHQap',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Bold, italics and links with ⌘ / Ctrl + b, i and k\nUndo with ⌘ / Ctrl + z\nSave changes with ⌘ / Ctrl + s\n(On this example page, changes are not persisted. On a real site, a logged in user would have their changes persisted to a database.)',
				annotations: [
					{
						start_offset: 29,
						end_offset: 41,
						node_id: 'NhhsYbqTRzPtpQcHFUgwFhP'
					},
					{
						start_offset: 43,
						end_offset: 45,
						node_id: 'ypAZzWFdhamCaTMKmZMZPMm'
					},
					{
						start_offset: 49,
						end_offset: 50,
						node_id: 'wuyFjXptXyMvgYKUcvtTggC'
					},
					{
						start_offset: 61,
						end_offset: 73,
						node_id: 'ZWDXzUmKJbqDwJbNTbhEtWQ'
					},
					{
						start_offset: 92,
						end_offset: 104,
						node_id: 'zqyQQtSbzxtdTTsVTYuuXEh'
					},
					{
						start_offset: 105,
						end_offset: 238,
						node_id: 'CUTpvupqUbXQDyMjBczwfCj'
					},
					{
						start_offset: 0,
						end_offset: 4,
						node_id: 'PYHXbxRMREHBpAqxbdsUXzP'
					},
					{
						start_offset: 6,
						end_offset: 13,
						node_id: 'djTpcsEQTzfGMSRctKenpWt'
					},
					{
						start_offset: 18,
						end_offset: 23,
						node_id: 'eUteADFhxtenJraxpeprgHr'
					}
				]
			}
		},
		DxBvNYzBgktMyKjKkKyYcAN: {
			id: 'DxBvNYzBgktMyKjKkKyYcAN',
			type: 'paragraph',
			layout: 1,
			content: {
				text: "Looking for the admin panel? There isn't any! It's just you, and your content.",
				annotations: []
			}
		},
		RtYpQwXsZvNmKjHgFdSaLe: {
			id: 'RtYpQwXsZvNmKjHgFdSaLe',
			type: 'feature',
			layout: 1,
			colorset: 0,
			media: 'VbNcMxZaQwErTyUiOpLkJh',
			body: [
				'eVNBZTZDFEfcPNkrZdEQBHm',
				'pmSDwGrMkaxGCDZMXambaYj',
				'WjasMkTrmjdrXTsDgeUHQap',
				'DxBvNYzBgktMyKjKkKyYcAN'
			]
		},
		SHqeNqxdQZRGsqJNWGqGAWQ: {
			id: 'SHqeNqxdQZRGsqJNWGqGAWQ',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'Build with blocks',
				annotations: []
			}
		},
		AmRQEvmJZPdcXuSgwRNsSzk: {
			id: 'AmRQEvmJZPdcXuSgwRNsSzk',
			type: 'strong'
		},
		fuxtxNCceDRcdbcHhtqsYwJ: {
			id: 'fuxtxNCceDRcdbcHhtqsYwJ',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'In edit mode the dashed gaps let you add blocks.',
				annotations: [
					{
						start_offset: 17,
						end_offset: 28,
						node_id: 'AmRQEvmJZPdcXuSgwRNsSzk'
					}
				]
			}
		},
		MheDsAwTmfQDGqdkpMWgXUH: {
			id: 'MheDsAwTmfQDGqdkpMWgXUH',
			type: 'strong'
		},
		XFwXMKjgMyyYRSemxHhemYh: {
			id: 'XFwXMKjgMyyYRSemxHhemYh',
			type: 'strong'
		},
		wqkSZVmFDECjqksNpcRTVyz: {
			id: 'wqkSZVmFDECjqksNpcRTVyz',
			type: 'strong'
		},
		dAEBKADbvfeaBMhNWgTjKNC: {
			id: 'dAEBKADbvfeaBMhNWgTjKNC',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Select the dashed gap below this paragraph to see a flashing purple cursor.\nPress Enter to add a block.\nChange text styles (paragraph > heading etc) with Ctrl + Shift + Right.',
				annotations: [
					{
						start_offset: 11,
						end_offset: 22,
						node_id: 'MheDsAwTmfQDGqdkpMWgXUH'
					},
					{
						start_offset: 154,
						end_offset: 174,
						node_id: 'XFwXMKjgMyyYRSemxHhemYh'
					},
					{
						start_offset: 82,
						end_offset: 87,
						node_id: 'wqkSZVmFDECjqksNpcRTVyz'
					}
				]
			}
		},
		kRSnDfvEsJkQjdrMZGSFQzt: {
			id: 'kRSnDfvEsJkQjdrMZGSFQzt',
			type: 'strong'
		},
		PkjDmTSvXRPdtwcYmSUScYs: {
			id: 'PkjDmTSvXRPdtwcYmSUScYs',
			type: 'strong'
		},
		zAmCJVJvxsvPMaqHkBgyaNx: {
			id: 'zAmCJVJvxsvPMaqHkBgyaNx',
			type: 'strong'
		},
		tFBaRUUJkEmftcgEyEqTAVB: {
			id: 'tFBaRUUJkEmftcgEyEqTAVB',
			type: 'strong'
		},
		dKDJFxDKresxkjMUZYKNuKn: {
			id: 'dKDJFxDKresxkjMUZYKNuKn',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Select one of the full width dashed gap to see a flashing purple cursor.\nPress Enter to create a new top-level block.\nCtrl + Shift + Down cycles through block types.\nAgain Ctrl + Shift + Right lets you flip through available layouts.',
				annotations: [
					{
						start_offset: 18,
						end_offset: 39,
						node_id: 'kRSnDfvEsJkQjdrMZGSFQzt'
					},
					{
						start_offset: 79,
						end_offset: 84,
						node_id: 'PkjDmTSvXRPdtwcYmSUScYs'
					},
					{
						start_offset: 118,
						end_offset: 137,
						node_id: 'zAmCJVJvxsvPMaqHkBgyaNx'
					},
					{
						start_offset: 172,
						end_offset: 192,
						node_id: 'tFBaRUUJkEmftcgEyEqTAVB'
					}
				]
			}
		},
		rNjwbAzwSBeezHceJNjSdbq: {
			id: 'rNjwbAzwSBeezHceJNjSdbq',
			type: 'strong'
		},
		dwMqDGUwHVvVkdzahPEWDuR: {
			id: 'dwMqDGUwHVvVkdzahPEWDuR',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'To move blocks, drag from a dashed gap to select multiple, then cut and paste like usual.',
				annotations: [
					{
						start_offset: 16,
						end_offset: 38,
						node_id: 'rNjwbAzwSBeezHceJNjSdbq'
					}
				]
			}
		},
		FGHDfRZMdeYQeVJBarNFeHa: {
			id: 'FGHDfRZMdeYQeVJBarNFeHa',
			type: 'strong'
		},
		gkHzcWkcKRsYffDnwJtGnjG: {
			id: 'gkHzcWkcKRsYffDnwJtGnjG',
			type: 'strong'
		},
		smJYScwGbZgRVDAJWhNGxvG: {
			id: 'smJYScwGbZgRVDAJWhNGxvG',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Pro tip: Press Esc to select the parent block. Useful when editing text but wanting to change the parent layout.',
				annotations: [
					{
						start_offset: 0,
						end_offset: 8,
						node_id: 'FGHDfRZMdeYQeVJBarNFeHa'
					},
					{
						start_offset: 15,
						end_offset: 18,
						node_id: 'gkHzcWkcKRsYffDnwJtGnjG'
					}
				]
			}
		},
		xKmNqPrStVwYzAbCdEfGh: {
			id: 'xKmNqPrStVwYzAbCdEfGh',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: [
				'SHqeNqxdQZRGsqJNWGqGAWQ',
				'fuxtxNCceDRcdbcHhtqsYwJ',
				'dAEBKADbvfeaBMhNWgTjKNC',
				'dKDJFxDKresxkjMUZYKNuKn',
				'dwMqDGUwHVvVkdzahPEWDuR',
				'smJYScwGbZgRVDAJWhNGxvG'
			]
		},
		xBrhyJwxKVkSzRaMVRbdvje: {
			id: 'xBrhyJwxKVkSzRaMVRbdvje',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'Add images and videos',
				annotations: []
			}
		},
		QddnajJYxeeEHzmcnqmYptQ: {
			id: 'QddnajJYxeeEHzmcnqmYptQ',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Open a folder on your computer that has some images.\nSelect one and copy it to the clipboard.\nSelect the placeholder below and paste it.\nTo replace an image, select it first, then paste the new one on top.',
				annotations: []
			}
		},
		dyRWExwbkfuqKyDupbEqaec: {
			id: 'dyRWExwbkfuqKyDupbEqaec',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: ['xBrhyJwxKVkSzRaMVRbdvje', 'QddnajJYxeeEHzmcnqmYptQ']
		},
		jEhPHUyzqvpNeSHYfKCkYgS: {
			id: 'jEhPHUyzqvpNeSHYfKCkYgS',
			type: 'image',
			src: 'user1-desktop.webp',
			mime_type: 'image/webp',
			width: 200,
			height: 150,
			alt: 'Sample image',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		wtvHDBrCzJVgacTaJqAwNJk: {
			id: 'wtvHDBrCzJVgacTaJqAwNJk',
			type: 'gallery_item',
			href: '',
			target: '_self',
			media: 'jEhPHUyzqvpNeSHYfKCkYgS'
		},
		ZjdBYZdXQedwuTdVFGHdDEj: {
			id: 'ZjdBYZdXQedwuTdVFGHdDEj',
			type: 'image',
			src: 'user1-notebook.webp',
			mime_type: 'image/webp',
			width: 200,
			height: 150,
			alt: 'Sample image',
			scale: 1,
			focal_point_x: 0.6705601092896176,
			focal_point_y: 0.4532274590163934,
			object_fit: 'cover'
		},
		TQRANBXMrzXXZTtzxAYhhZf: {
			id: 'TQRANBXMrzXXZTtzxAYhhZf',
			type: 'gallery_item',
			href: '',
			target: '_self',
			media: 'ZjdBYZdXQedwuTdVFGHdDEj'
		},
		UGfbRKEMbGwgcUjhpgXausS: {
			id: 'UGfbRKEMbGwgcUjhpgXausS',
			type: 'image',
			src: '',
			mime_type: '',
			width: 800,
			height: 600,
			alt: 'Sample image',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		HtSTZfjTcDSkttVaTUKMYAj: {
			id: 'HtSTZfjTcDSkttVaTUKMYAj',
			type: 'gallery_item',
			href: '',
			target: '_self',
			media: 'UGfbRKEMbGwgcUjhpgXausS'
		},
		BPdekRaDEUcQZqtEwPwBvyu: {
			id: 'BPdekRaDEUcQZqtEwPwBvyu',
			type: 'gallery',
			layout: 1,
			colorset: 0,
			gallery_items: [
				'wtvHDBrCzJVgacTaJqAwNJk',
				'TQRANBXMrzXXZTtzxAYhhZf',
				'HtSTZfjTcDSkttVaTUKMYAj'
			]
		},
		SXKmbzRCwPeAYSnXfXFXHBd: {
			id: 'SXKmbzRCwPeAYSnXfXFXHBd',
			type: 'strong'
		},
		qQWRsxCRhpAaWYPrQyEtkRH: {
			id: 'qQWRsxCRhpAaWYPrQyEtkRH',
			type: 'strong'
		},
		HxzrRGAgJBrCzDyNfKrBJmz: {
			id: 'HxzrRGAgJBrCzDyNfKrBJmz',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'You can even paste several images at once.\nSelect three or four from your computer and copy to the clipboard.\nNow select a vertical dashed area before or after an image above.\nPaste and all the images will be added in one go.',
				annotations: [
					{
						start_offset: 123,
						end_offset: 143,
						node_id: 'SXKmbzRCwPeAYSnXfXFXHBd'
					},
					{
						start_offset: 13,
						end_offset: 33,
						node_id: 'qQWRsxCRhpAaWYPrQyEtkRH'
					}
				]
			}
		},
		BnRyDkxJpWyxgsmdAaqBZpc: {
			id: 'BnRyDkxJpWyxgsmdAaqBZpc',
			type: 'image',
			src: 'pattern.svg',
			mime_type: 'image/svg+xml',
			width: 1750,
			height: 1000,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		jkPsBvJwtqCCjUDuByzxAHs: {
			id: 'jkPsBvJwtqCCjUDuByzxAHs',
			type: 'supporting_media',
			media: 'BnRyDkxJpWyxgsmdAaqBZpc',
			media_max_width: 392,
			media_aspect_ratio: 2.469
		},
		kWHMWHbzvQqqPpbhPVGepXA: {
			id: 'kWHMWHbzvQqqPpbhPVGepXA',
			type: 'strong'
		},
		KHMMaadDrWWNHjjFtuFGfhV: {
			id: 'KHMMaadDrWWNHjjFtuFGfhV',
			type: 'paragraph',
			layout: 1,
			content: {
				text: "When you add images in the text flow, like the one above, you'll be able to change its size using the handles at the edges of the image.",
				annotations: [
					{
						start_offset: 102,
						end_offset: 122,
						node_id: 'kWHMWHbzvQqqPpbhPVGepXA'
					}
				]
			}
		},
		MJvxnendhrvWGYYgwbypGzf: {
			src: 'jellyfish.mp4',
			mime_type: 'video/mp4',
			width: 1280,
			height: 720,
			alt: '',
			scale: 1,
			focal_point_x: 0.46228175811044075,
			focal_point_y: 0.2649100629740638,
			object_fit: 'cover',
			id: 'MJvxnendhrvWGYYgwbypGzf',
			type: 'video'
		},
		SDzUcrBBPfRZkGUestSfCrV: {
			id: 'SDzUcrBBPfRZkGUestSfCrV',
			type: 'supporting_media',
			media: 'MJvxnendhrvWGYYgwbypGzf',
			media_max_width: 0,
			media_aspect_ratio: 4.801
		},
		hjhjWTaQYQzwFhqQuSzTkFf: {
			id: 'hjhjWTaQYQzwFhqQuSzTkFf',
			type: 'strong'
		},
		QmNkhymexzZrBYQQKsMZFXM: {
			id: 'QmNkhymexzZrBYQQKsMZFXM',
			type: 'strong'
		},
		sVdqncWPDxsghFXYYwJFKBH: {
			id: 'sVdqncWPDxsghFXYYwJFKBH',
			type: 'strong'
		},
		advPeCwNKJMnqHEhGCsBNpk: {
			id: 'advPeCwNKJMnqHEhGCsBNpk',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'You can even paste short video clips onto any media placeholder. Currently .mp4 , .webm, and of course .gif are supported.',
				annotations: [
					{
						start_offset: 75,
						end_offset: 79,
						node_id: 'hjhjWTaQYQzwFhqQuSzTkFf'
					},
					{
						start_offset: 82,
						end_offset: 87,
						node_id: 'QmNkhymexzZrBYQQKsMZFXM'
					},
					{
						start_offset: 103,
						end_offset: 107,
						node_id: 'sVdqncWPDxsghFXYYwJFKBH'
					}
				]
			}
		},
		FUeFBwWRRuSJMVAhgxThQqj: {
			id: 'FUeFBwWRRuSJMVAhgxThQqj',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: [
				'HxzrRGAgJBrCzDyNfKrBJmz',
				'jkPsBvJwtqCCjUDuByzxAHs',
				'KHMMaadDrWWNHjjFtuFGfhV',
				'SDzUcrBBPfRZkGUestSfCrV',
				'advPeCwNKJMnqHEhGCsBNpk'
			]
		},
		kaNFsWgzXAeHzAumhzCERYN: {
			id: 'kaNFsWgzXAeHzAumhzCERYN',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'Link to other pages',
				annotations: []
			}
		},
		VdjTDrdPmtXRuYKNUMeRmKK: {
			id: 'VdjTDrdPmtXRuYKNUMeRmKK',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Click on one of the cards below.\nA link preview appears at the bottom.\nClick “EDIT” or press ⌘ / Ctrl + k to bring up the link editor.',
				annotations: []
			}
		},
		descriptive_gallery_intro: {
			id: 'descriptive_gallery_intro',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: ['kaNFsWgzXAeHzAumhzCERYN', 'VdjTDrdPmtXRuYKNUMeRmKK']
		},
		nprCMwYvJvUEmRaHBsxfgUd: {
			id: 'nprCMwYvJvUEmRaHBsxfgUd',
			type: 'image',
			src: 'gluecksmaurer.webp',
			mime_type: 'image/png',
			width: 186,
			height: 120,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		JUmgwJDKqdxVxJeBHkBdjVq: {
			id: 'JUmgwJDKqdxVxJeBHkBdjVq',
			type: 'descriptive_gallery_item',
			href: 'https://gluecksmaurer.de',
			target: '_blank',
			media: 'nprCMwYvJvUEmRaHBsxfgUd',
			title: {
				text: 'Glücksmaurer',
				annotations: []
			},
			description: {
				text: 'Innovative real estate agent in Worms, Germany.',
				annotations: []
			}
		},
		descriptive_gallery_item_2_image: {
			id: 'descriptive_gallery_item_2_image',
			type: 'image',
			src: 'colbourns.webp',
			mime_type: 'image/png',
			width: 180,
			height: 112,
			alt: '',
			scale: 1,
			focal_point_x: 0.5008655894886364,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		descriptive_gallery_item_2: {
			id: 'descriptive_gallery_item_2',
			type: 'descriptive_gallery_item',
			href: 'https://colbourns.com',
			target: '_blank',
			media: 'descriptive_gallery_item_2_image',
			title: {
				text: 'Colbourns',
				annotations: []
			},
			description: {
				text: 'London-based designer of premium-quality, elegant rugs.',
				annotations: []
			}
		},
		ReRqxYxMdAUVaMuudfJhzsS: {
			id: 'ReRqxYxMdAUVaMuudfJhzsS',
			type: 'image',
			src: 'tomorrow-vc.webp',
			mime_type: 'image/png',
			width: 218,
			height: 202,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		YnBCBuemwpaUxQwHrFJNgMW: {
			id: 'YnBCBuemwpaUxQwHrFJNgMW',
			type: 'descriptive_gallery_item',
			href: 'https://tomorrow.vc',
			target: '_blank',
			media: 'ReRqxYxMdAUVaMuudfJhzsS',
			title: {
				text: 'Visionaries Tomorrow',
				annotations: []
			},
			description: {
				text: 'An early-stage industrial deep tech fund.',
				annotations: []
			}
		},
		jLnPqRsTuVwXyZaBcDeFg: {
			id: 'jLnPqRsTuVwXyZaBcDeFg',
			type: 'descriptive_gallery',
			layout: 1,
			items: ['JUmgwJDKqdxVxJeBHkBdjVq', 'descriptive_gallery_item_2', 'YnBCBuemwpaUxQwHrFJNgMW']
		},
		VqaqUWzRKUJrZzQYqqurggB: {
			id: 'VqaqUWzRKUJrZzQYqqurggB',
			type: 'link',
			href: 'https://mutter.co',
			target: '_blank'
		},
		kZQHRTYyJtbmsJfnXaRgVtZ: {
			id: 'kZQHRTYyJtbmsJfnXaRgVtZ',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'The cards above are links to examples of live in-place editable websites Johannes Mutter and I have already launched using this technology. You can see that any design is possible — it’s just HTML and CSS.',
				annotations: [
					{
						start_offset: 73,
						end_offset: 88,
						node_id: 'VqaqUWzRKUJrZzQYqqurggB'
					}
				]
			}
		},
		descriptive_gallery_outro: {
			id: 'descriptive_gallery_outro',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: ['kZQHRTYyJtbmsJfnXaRgVtZ']
		},
		QpMJFhtfKWpEhQHDRMtQkwU: {
			id: 'QpMJFhtfKWpEhQHDRMtQkwU',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'How does this work?',
				annotations: []
			}
		},
		vgwPcMefbMumuCsVyAPHhUz: {
			id: 'vgwPcMefbMumuCsVyAPHhUz',
			type: 'link',
			href: 'https://svelte.dev/docs/kit/introduction',
			target: '_blank'
		},
		qHveqveRzQxJzxGakaarEwb: {
			id: 'qHveqveRzQxJzxGakaarEwb',
			type: 'link',
			href: 'https://sqlite.org',
			target: '_blank'
		},
		sheNSfrhuAfrBWSKfvWPYGg: {
			id: 'sheNSfrhuAfrBWSKfvWPYGg',
			type: 'link',
			href: 'https://svelte.dev',
			target: '_blank'
		},
		NZHwrDvtUBdpyDMvRJEGPcc: {
			id: 'NZHwrDvtUBdpyDMvRJEGPcc',
			type: 'link',
			href: 'https://svedit.dev',
			target: '_blank'
		},
		PscvEBWBfhraXpPKjPPkCMC: {
			id: 'PscvEBWBfhraXpPKjPPkCMC',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'This site is powered by Svelte and Svedit — an open source rich text editor I’ve created. Editable Website builds on SvelteKit and SQLite to enable full websites with multiple pages and a persistent backend where only an admin can make changes.',
				annotations: [
					{
						start_offset: 117,
						end_offset: 126,
						node_id: 'vgwPcMefbMumuCsVyAPHhUz'
					},
					{
						start_offset: 131,
						end_offset: 137,
						node_id: 'qHveqveRzQxJzxGakaarEwb'
					},
					{
						start_offset: 24,
						end_offset: 30,
						node_id: 'sheNSfrhuAfrBWSKfvWPYGg'
					},
					{
						start_offset: 35,
						end_offset: 41,
						node_id: 'NZHwrDvtUBdpyDMvRJEGPcc'
					}
				]
			}
		},
		EsVdYMdJuVqGfqpQmMBCtap: {
			id: 'EsVdYMdJuVqGfqpQmMBCtap',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'The source code is not only available for this site, but for all the foundations it is built on:',
				annotations: []
			}
		},
		XVJGXtwnQMvcrcuByAtcWNa: {
			id: 'XVJGXtwnQMvcrcuByAtcWNa',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: ['QpMJFhtfKWpEhQHDRMtQkwU', 'PscvEBWBfhraXpPKjPPkCMC', 'EsVdYMdJuVqGfqpQmMBCtap']
		},
		BGYgxNUSXuDtBqxrKfExJnw: {
			id: 'BGYgxNUSXuDtBqxrKfExJnw',
			type: 'descriptive_listing_item',
			href: 'https://github.com/michael/editable-website',
			target: '_blank',
			title: {
				text: 'Editable Website',
				annotations: []
			},
			description: {
				text: 'CMS-free editable websites with Svelte ★1.7k+',
				annotations: []
			},
			meta: {
				text: 'Source available',
				annotations: []
			}
		},
		DEKuXmWSgnDZEhRgHGptcZJ: {
			id: 'DEKuXmWSgnDZEhRgHGptcZJ',
			type: 'descriptive_listing_item',
			href: 'https://github.com/michael/svedit',
			target: '_blank',
			title: {
				text: 'Svedit',
				annotations: []
			},
			description: {
				text: 'A tiny library for building editable websites in Svelte ★600+',
				annotations: []
			},
			meta: {
				text: 'MIT licensed',
				annotations: []
			}
		},
		NpbErTcbBZKBxShfRaFXzct: {
			id: 'NpbErTcbBZKBxShfRaFXzct',
			type: 'descriptive_listing_item',
			href: 'https://github.com/sveltejs/svelte',
			target: '_blank',
			title: {
				text: 'Svelte',
				annotations: []
			},
			description: {
				text: 'Web development for the rest of us ★86.7k+',
				annotations: []
			},
			meta: {
				text: 'MIT licensed',
				annotations: []
			}
		},
		fmxXNqJPJNkTZpAtwKSHxWb: {
			id: 'fmxXNqJPJNkTZpAtwKSHxWb',
			type: 'descriptive_listing',
			layout: 1,
			items: ['BGYgxNUSXuDtBqxrKfExJnw', 'DEKuXmWSgnDZEhRgHGptcZJ', 'NpbErTcbBZKBxShfRaFXzct']
		},
		XVuTuYNcPUGbSZVnWUBENct: {
			id: 'XVuTuYNcPUGbSZVnWUBENct',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'Early-Access pricing',
				annotations: []
			}
		},
		nHaWhmFqqDCzKjYfAYWzeAs: {
			id: 'nHaWhmFqqDCzKjYfAYWzeAs',
			type: 'list_item',
			content: {
				text: 'Includes all code and the right to modify it',
				annotations: []
			}
		},
		gfzZchrRysGcDEeXxAscCzg: {
			id: 'gfzZchrRysGcDEeXxAscCzg',
			type: 'list_item',
			content: {
				text: 'No subscription',
				annotations: []
			}
		},
		hhauqXDVvpScWyhmrsmvrqe: {
			id: 'hhauqXDVvpScWyhmrsmvrqe',
			type: 'list_item',
			content: {
				text: 'No hidden costs',
				annotations: []
			}
		},
		eJjQwDAYHqfcegtbNPTtQSJ: {
			id: 'eJjQwDAYHqfcegtbNPTtQSJ',
			type: 'list',
			layout: 2,
			list_items: ['nHaWhmFqqDCzKjYfAYWzeAs', 'gfzZchrRysGcDEeXxAscCzg', 'hhauqXDVvpScWyhmrsmvrqe']
		},
		eRkNrkcQvspQsPtkDtuqekV: {
			id: 'eRkNrkcQvspQsPtkDtuqekV',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: ['XVuTuYNcPUGbSZVnWUBENct', 'eJjQwDAYHqfcegtbNPTtQSJ']
		},
		jzMUAkKquWACdzyTFtgyxdV: {
			id: 'jzMUAkKquWACdzyTFtgyxdV',
			type: 'paragraph_sm',
			layout: 1,
			content: {
				text: 'PRE-LAUNCH',
				annotations: []
			}
		},
		prose_grid_free_title: {
			id: 'prose_grid_free_title',
			type: 'heading_2',
			layout: 1,
			content: {
				text: 'Free',
				annotations: []
			}
		},
		prose_grid_free_description: {
			id: 'prose_grid_free_description',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Install Editable Website and start developing.',
				annotations: []
			}
		},
		ARpQvUnSMPCTHeFZYYNCFmP: {
			id: 'ARpQvUnSMPCTHeFZYYNCFmP',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Setup a website in minutes. Spend the next hour customizing it.',
				annotations: []
			}
		},
		prose_grid_free_button: {
			id: 'prose_grid_free_button',
			type: 'button',
			layout: 1,
			href: 'https://github.com/michael/editable-website#getting-started',
			target: '_blank',
			label: {
				text: 'Install',
				annotations: []
			}
		},
		prose_grid_free_action: {
			id: 'prose_grid_free_action',
			type: 'button_group',
			buttons: ['prose_grid_free_button']
		},
		prose_grid_free: {
			id: 'prose_grid_free',
			type: 'prose_grid_item',
			colorset: 0,
			content: [
				'jzMUAkKquWACdzyTFtgyxdV',
				'prose_grid_free_title',
				'prose_grid_free_description',
				'ARpQvUnSMPCTHeFZYYNCFmP',
				'prose_grid_free_action'
			]
		},
		aPYQncYTyzFJSDAcGejvvQV: {
			id: 'aPYQncYTyzFJSDAcGejvvQV',
			type: 'paragraph_sm',
			layout: 1,
			content: {
				text: 'PERSONAL',
				annotations: []
			}
		},
		prose_grid_supergrok_title: {
			id: 'prose_grid_supergrok_title',
			type: 'heading_2',
			layout: 1,
			content: {
				text: '€99',
				annotations: []
			}
		},
		prose_grid_supergrok_description: {
			id: 'prose_grid_supergrok_description',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Per domain. Once you launched.',
				annotations: []
			}
		},
		prose_grid_supergrok_features: {
			id: 'prose_grid_supergrok_features',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'For personal use or businesses with less than 150,000 USD in annual revenue.',
				annotations: []
			}
		},
		prose_grid_supergrok_button: {
			id: 'prose_grid_supergrok_button',
			type: 'button',
			layout: 1,
			href: 'https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform',
			target: '_blank',
			label: {
				text: 'Purchase',
				annotations: []
			}
		},
		prose_grid_supergrok_action: {
			id: 'prose_grid_supergrok_action',
			type: 'button_group',
			buttons: ['prose_grid_supergrok_button']
		},
		prose_grid_supergrok: {
			id: 'prose_grid_supergrok',
			type: 'prose_grid_item',
			colorset: 0,
			content: [
				'aPYQncYTyzFJSDAcGejvvQV',
				'prose_grid_supergrok_title',
				'prose_grid_supergrok_description',
				'prose_grid_supergrok_features',
				'prose_grid_supergrok_action'
			]
		},
		XqzKZKnYXApBFkcctNNhRxJ: {
			id: 'XqzKZKnYXApBFkcctNNhRxJ',
			type: 'paragraph_sm',
			layout: 1,
			content: {
				text: 'COMMERCIAL',
				annotations: []
			}
		},
		TKTWNunjBnaxgXZkTGbuJjS: {
			id: 'TKTWNunjBnaxgXZkTGbuJjS',
			type: 'heading_2',
			layout: 1,
			content: {
				text: '€299',
				annotations: []
			}
		},
		FVgAWAdnYubUEueFrfRYypd: {
			id: 'FVgAWAdnYubUEueFrfRYypd',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'For each Editable Website you launch for a client.',
				annotations: []
			}
		},
		UkXDdahkUkkPEsXntcmBebK: {
			id: 'UkXDdahkUkkPEsXntcmBebK',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Each license is purchased once and valid indefinitely for a single domain.',
				annotations: []
			}
		},
		prose_grid_expert_button: {
			id: 'prose_grid_expert_button',
			type: 'button',
			layout: 1,
			href: 'https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform',
			target: '_blank',
			label: {
				text: 'Purchase',
				annotations: []
			}
		},
		prose_grid_expert_action: {
			id: 'prose_grid_expert_action',
			type: 'button_group',
			buttons: ['prose_grid_expert_button']
		},
		prose_grid_expert: {
			id: 'prose_grid_expert',
			type: 'prose_grid_item',
			colorset: 0,
			content: [
				'XqzKZKnYXApBFkcctNNhRxJ',
				'TKTWNunjBnaxgXZkTGbuJjS',
				'FVgAWAdnYubUEueFrfRYypd',
				'UkXDdahkUkkPEsXntcmBebK',
				'prose_grid_expert_action'
			]
		},
		prose_grid_1: {
			id: 'prose_grid_1',
			type: 'prose_grid',
			layout: 2,
			items: ['prose_grid_free', 'prose_grid_supergrok', 'prose_grid_expert']
		},
		bDmPWtwGGHPFhXWratpeTwr: {
			id: 'bDmPWtwGGHPFhXWratpeTwr',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'Frequently Asked Questions',
				annotations: []
			}
		},
		xEphsDndbNejaRnnPRBwvBK: {
			id: 'xEphsDndbNejaRnnPRBwvBK',
			type: 'prose',
			layout: 1,
			colorset: 0,
			content: ['bDmPWtwGGHPFhXWratpeTwr']
		},
		PgFkSEuFXmXvecwFNksBFfw: {
			id: 'PgFkSEuFXmXvecwFNksBFfw',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'The editing infrastructure (Svedit) becomes an integral part of your website (at runtime). As a developer, all you do is define content types (e.g. Figure) and implement components (e.g. Figure.svelte) — they are editable by default.',
				annotations: []
			}
		},
		DerFSxwnBjUZXfsePjKbYPd: {
			id: 'DerFSxwnBjUZXfsePjKbYPd',
			type: 'accordion_item',
			title: {
				text: 'How is this different to using a CMS?',
				annotations: []
			},
			body: ['PgFkSEuFXmXvecwFNksBFfw']
		},
		fWGAzktgaAYgCnbjDDNZqZt: {
			id: 'fWGAzktgaAYgCnbjDDNZqZt',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'There is experimental support for mobile editing — it works in principle. The current focus is on desktop UX, but mobile editing will improve over time.',
				annotations: []
			}
		},
		BfXmkWHjhSWZGMaKGxhSAXu: {
			id: 'BfXmkWHjhSWZGMaKGxhSAXu',
			type: 'accordion_item',
			title: {
				text: 'Is mobile editing supported?',
				annotations: []
			},
			body: ['fWGAzktgaAYgCnbjDDNZqZt']
		},
		wdKfHzXjUysbpyHBKWnjHPp: {
			id: 'wdKfHzXjUysbpyHBKWnjHPp',
			type: 'paragraph',
			layout: 1,
			content: {
				text: "All content lives in a single data/ directory — an SQLite database (db.sqlite3) and uploaded assets (assets/). Locally this defaults to ./data. On Fly.io it's a persistent volume at /data. To back up your site, copy this directory.",
				annotations: []
			}
		},
		rmMwFFdvFZzxzdsaQtZvdKH: {
			id: 'rmMwFFdvFZzxzdsaQtZvdKH',
			type: 'accordion_item',
			title: {
				text: 'Where is the data stored?',
				annotations: []
			},
			body: ['wdKfHzXjUysbpyHBKWnjHPp']
		},
		ahabwjAyHuBbTNMJacqWupQ: {
			id: 'ahabwjAyHuBbTNMJacqWupQ',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Editable Website is a foundational, AI-agnostic tool. That said, it makes perfect sense to utilize AI workflows to help building your custom site. Think prompts like "Create a paragraph block type with layout variants" and "Implement Paragraph.svelte with 2 layout modes".',
				annotations: []
			}
		},
		EjhqKzYMTknJuyFwbhJzyCA: {
			id: 'EjhqKzYMTknJuyFwbhJzyCA',
			type: 'accordion_item',
			title: {
				text: 'How about AI?',
				annotations: []
			},
			body: ['ahabwjAyHuBbTNMJacqWupQ']
		},
		vuEMUDFAUnxSBXvsvDsYDZe: {
			id: 'vuEMUDFAUnxSBXvsvDsYDZe',
			type: 'paragraph',
			layout: 1,
			content: {
				text: "Editable Website is modular and you can and should reuse code across projects. However, I purposely don't want to establish a community maintained plugin repository. I want to encourage you to own all your code, for the benefit of simplicity, safety, and control. Share code snippets, not plugins.",
				annotations: []
			}
		},
		PeFCTQcmaYpxvjGMrfvgGeW: {
			id: 'PeFCTQcmaYpxvjGMrfvgGeW',
			type: 'accordion_item',
			title: {
				text: 'Plugins?',
				annotations: []
			},
			body: ['vuEMUDFAUnxSBXvsvDsYDZe']
		},
		ZdwnbaVUbAPYzCZQhyJAYBr: {
			id: 'ZdwnbaVUbAPYzCZQhyJAYBr',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Editable Website runs on any VPS. All you need is Node.js and SQLite. The repository includes a Dockerfile and fly.toml for one-command deployment to Fly.io — see Deploying to Fly.io above. The same Dockerfile works with any platform that supports Docker.',
				annotations: []
			}
		},
		tTTVGQvjNrfJsKHXSWaSDeE: {
			id: 'tTTVGQvjNrfJsKHXSWaSDeE',
			type: 'accordion_item',
			title: {
				text: 'Hosting?',
				annotations: []
			},
			body: ['ZdwnbaVUbAPYzCZQhyJAYBr']
		},
		prwbeXWyKVSsJXMPndjHYRS: {
			id: 'prwbeXWyKVSsJXMPndjHYRS',
			type: 'paragraph',
			layout: 1,
			content: {
				text: "There's no point for static builds with Editable Website. The whole idea is that users edit content live, without having to wait for a rebuild to finish. SQLite is fast. Very fast. Web-optimized images are generated client-side before upload: resizing happens in the browser via canvas and toBlob(), and WebP encoding is done with @jsquash/webp. It still makes sense to enable a proxy for images, so they can be delivered from a CDN.",
				annotations: []
			}
		},
		gftTVYqqYFbsTAkfMJKbhzH: {
			id: 'gftTVYqqYFbsTAkfMJKbhzH',
			type: 'accordion_item',
			title: {
				text: 'Static builds?',
				annotations: []
			},
			body: ['prwbeXWyKVSsJXMPndjHYRS']
		},
		VmvAPSsWYbVnekGqYyEKPUG: {
			id: 'VmvAPSsWYbVnekGqYyEKPUG',
			type: 'paragraph',
			layout: 1,
			content: {
				text: "Editable Website will at least be source-available. There will likely be an affordable one-time registration fee (per domain) for personal use, and a fair fee for commercial projects. I'm still working on the details. If you’re open to discussion, join the technical preview.",
				annotations: []
			}
		},
		gYpxwQwkQNNWWvYbTWBrAfx: {
			id: 'gYpxwQwkQNNWWvYbTWBrAfx',
			type: 'accordion_item',
			title: {
				text: 'License?',
				annotations: []
			},
			body: ['VmvAPSsWYbVnekGqYyEKPUG']
		},
		BBExBsmaSTXMZdcxMsYngwg: {
			id: 'BBExBsmaSTXMZdcxMsYngwg',
			type: 'accordion',
			items: [
				'DerFSxwnBjUZXfsePjKbYPd',
				'BfXmkWHjhSWZGMaKGxhSAXu',
				'rmMwFFdvFZzxzdsaQtZvdKH',
				'EjhqKzYMTknJuyFwbhJzyCA',
				'PeFCTQcmaYpxvjGMrfvgGeW',
				'tTTVGQvjNrfJsKHXSWaSDeE',
				'gftTVYqqYFbsTAkfMJKbhzH',
				'gYpxwQwkQNNWWvYbTWBrAfx'
			]
		},
		preformatted_example: {
			id: 'preformatted_example',
			type: 'preformatted',
			content: {
				text: 'const greeting = "Hello, world!"\n\n+----+----+\n|  /\\|    |\n| /  \\    |\n+----+----+',
				annotations: []
			}
		},
		hqrrTdEbTPaqzEcYMczhBZb: {
			id: 'hqrrTdEbTPaqzEcYMczhBZb',
			type: 'image',
			src: 'michael.webp',
			mime_type: 'image/webp',
			width: 192,
			height: 256,
			alt: 'Feature image',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		fCDBqmuBbFhsyUFdUxZKCar: {
			id: 'fCDBqmuBbFhsyUFdUxZKCar',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'Hello, I’m Michael',
				annotations: []
			}
		},
		gnbpgBsBYZqEwRxqRZSMHdd: {
			id: 'gnbpgBsBYZqEwRxqRZSMHdd',
			type: 'link',
			href: 'https://letsken.com/michael/how-to-implement-a-web-based-rich-text-editor-in-2023',
			target: '_blank'
		},
		qDAyeabdhVEXjBWXyyqfUPb: {
			id: 'qDAyeabdhVEXjBWXyyqfUPb',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Since 2011 I’ve been taming web browsers to behave correctly and predictably when editing rich text.',
				annotations: [
					{
						start_offset: 21,
						end_offset: 40,
						node_id: 'gnbpgBsBYZqEwRxqRZSMHdd'
					}
				]
			}
		},
		QVXhuysTRgRyQHVQnfTVCpV: {
			id: 'QVXhuysTRgRyQHVQnfTVCpV',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'I want you to be able to launch websites that anyone can edit. No more calls asking you to update someone’s WordPress site! They’ll be able to do it themselves.',
				annotations: []
			}
		},
		NjNteBhckwxGAUfbYRMGrDz: {
			id: 'NjNteBhckwxGAUfbYRMGrDz',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'Most CMSs are too complex for clients and too restrictive for developers. Change every pixel of your site, create new content types, or integrate 3rd party data. Everything you can do with Svelte, you can do with Editable Website.',
				annotations: []
			}
		},
		YTMHBcPkYXJMRUnuSAhrTDE: {
			id: 'YTMHBcPkYXJMRUnuSAhrTDE',
			type: 'feature',
			layout: 2,
			colorset: 0,
			media: 'hqrrTdEbTPaqzEcYMczhBZb',
			body: [
				'fCDBqmuBbFhsyUFdUxZKCar',
				'qDAyeabdhVEXjBWXyyqfUPb',
				'QVXhuysTRgRyQHVQnfTVCpV',
				'NjNteBhckwxGAUfbYRMGrDz'
			]
		},
		tXfztBRXuxPMWQDqJxGSAXX: {
			id: 'tXfztBRXuxPMWQDqJxGSAXX',
			type: 'heading_3',
			layout: 1,
			content: {
				text: 'How can I get it?',
				annotations: []
			}
		},
		BNDQkNtJpdSNXUuDUwAmgYz: {
			id: 'BNDQkNtJpdSNXUuDUwAmgYz',
			type: 'paragraph',
			layout: 1,
			content: {
				text: 'This is an an initial preview of Editable Website. There’s more to do before you can use it in production. Be the first to hear when it’s ready:',
				annotations: []
			}
		},
		VMpZbtCEwxBqnnkMBUEsKGE: {
			id: 'VMpZbtCEwxBqnnkMBUEsKGE',
			type: 'button',
			layout: 1,
			href: 'https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform?usp=dialog',
			target: '_blank',
			label: {
				text: 'Join the Technical Preview',
				annotations: []
			}
		},
		fxbPhZADdeyCbysuCSwHNcA: {
			id: 'fxbPhZADdeyCbysuCSwHNcA',
			type: 'button_group',
			buttons: ['VMpZbtCEwxBqnnkMBUEsKGE']
		},
		zBXuGXXYWMGbSdteMyNFhja: {
			id: 'zBXuGXXYWMGbSdteMyNFhja',
			type: 'prose',
			layout: 4,
			colorset: 0,
			content: ['tXfztBRXuxPMWQDqJxGSAXX', 'BNDQkNtJpdSNXUuDUwAmgYz', 'fxbPhZADdeyCbysuCSwHNcA']
		},
		AfkGmkTkFBhUGQsSSSzAaWV: {
			id: 'AfkGmkTkFBhUGQsSSSzAaWV',
			type: 'link',
			href: 'https://mutter.co',
			target: '_blank'
		},
		vCVXtBNMtzbVEuwrnhDGcCe: {
			id: 'vCVXtBNMtzbVEuwrnhDGcCe',
			type: 'link',
			href: 'https://keybits.net',
			target: '_blank'
		},
		jdfSXyKXdGPQfUDqVrhGpew: {
			id: 'jdfSXyKXdGPQfUDqVrhGpew',
			type: 'link',
			href: 'https://sonjastojanovic.com',
			target: '_blank'
		},
		yFZKjXVRgKtHqNrtFNfBeSS: {
			id: 'yFZKjXVRgKtHqNrtFNfBeSS',
			type: 'link',
			href: 'https://trails-shop.at',
			target: '_blank'
		},
		NcjxywhftMGtnXhbGyvmcUy: {
			id: 'NcjxywhftMGtnXhbGyvmcUy',
			type: 'link',
			href: 'https://postlmayrdesign.com',
			target: '_blank'
		},
		KKUfXFgJuXJrUSPyzMQrHcU: {
			id: 'KKUfXFgJuXJrUSPyzMQrHcU',
			type: 'link',
			href: 'https://aufreiter.co',
			target: '_blank'
		},
		SCYnDDYECpBzMNaNstUNtvW: {
			id: 'SCYnDDYECpBzMNaNstUNtvW',
			type: 'paragraph_sm',
			layout: 1,
			content: {
				text: 'Big thanks to Johannes Mutter for helping with concept, design, and engineering, Tom Atkins for support with positioning and copywriting, and Sonja Stojanovic for modelling and being the very first happy Editable Website user — followed by Trails, Postlmayr Design, Aufreiter Architektur, and many more.',
				annotations: [
					{
						start_offset: 14,
						end_offset: 29,
						node_id: 'AfkGmkTkFBhUGQsSSSzAaWV'
					},
					{
						start_offset: 81,
						end_offset: 91,
						node_id: 'vCVXtBNMtzbVEuwrnhDGcCe'
					},
					{
						start_offset: 142,
						end_offset: 158,
						node_id: 'jdfSXyKXdGPQfUDqVrhGpew'
					},
					{
						start_offset: 240,
						end_offset: 246,
						node_id: 'yFZKjXVRgKtHqNrtFNfBeSS'
					},
					{
						start_offset: 248,
						end_offset: 264,
						node_id: 'NcjxywhftMGtnXhbGyvmcUy'
					},
					{
						start_offset: 266,
						end_offset: 287,
						node_id: 'KKUfXFgJuXJrUSPyzMQrHcU'
					}
				]
			}
		},
		wmrbpSFAFUmMRPDumcjKqpF: {
			id: 'wmrbpSFAFUmMRPDumcjKqpF',
			type: 'prose',
			layout: 4,
			colorset: 0,
			content: ['SCYnDDYECpBzMNaNstUNtvW']
		},
		nav_logo: {
			id: 'nav_logo',
			type: 'image',
			src: 'logo.svg',
			mime_type: 'image/svg+xml',
			width: 100,
			height: 100,
			alt: 'Logo',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		DDmmrQzcAxWJfdhatTbkRTh: {
			id: 'DDmmrQzcAxWJfdhatTbkRTh',
			type: 'nav_item',
			layout: 1,
			href: '/#RtYpQwXsZvNmKjHgFdSaLe',
			target: '_self',
			label: {
				text: 'Try it',
				annotations: []
			}
		},
		GyKyQvRAvkgnywmxTVgvrnF: {
			id: 'GyKyQvRAvkgnywmxTVgvrnF',
			type: 'nav_item',
			layout: 1,
			href: '/#XVJGXtwnQMvcrcuByAtcWNa',
			target: '_self',
			label: {
				text: 'About',
				annotations: []
			}
		},
		FKgjxHCeSbVZrdnPuxYkMYp: {
			id: 'FKgjxHCeSbVZrdnPuxYkMYp',
			type: 'nav_item',
			layout: 2,
			href: 'https://docs.google.com/forms/d/e/1FAIpQLSfkL9e9X3Lcn6oBDIG-gU4yrfSenh8fndupbIX7zkyxX3X9ZQ/viewform',
			target: '_blank',
			label: {
				text: 'Join the Technical Preview',
				annotations: []
			}
		},
		nav_1: {
			id: 'nav_1',
			type: 'nav',
			logo: 'nav_logo',
			nav_items: ['DDmmrQzcAxWJfdhatTbkRTh', 'GyKyQvRAvkgnywmxTVgvrnF', 'FKgjxHCeSbVZrdnPuxYkMYp']
		},
		footer_logo: {
			id: 'footer_logo',
			type: 'image',
			src: 'logo.svg',
			mime_type: 'image/svg+xml',
			width: 100,
			height: 100,
			alt: 'Logo',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'cover'
		},
		EtcfbabRCtPSvSpfFfjPeza: {
			id: 'EtcfbabRCtPSvSpfFfjPeza',
			type: 'footer_link',
			href: '/#RtYpQwXsZvNmKjHgFdSaLe',
			target: '_self',
			label: {
				text: 'Editing',
				annotations: []
			}
		},
		WVvBSREFCThNYcpgvfUnWkF: {
			id: 'WVvBSREFCThNYcpgvfUnWkF',
			type: 'footer_link',
			href: '/#xKmNqPrStVwYzAbCdEfGh',
			target: '_self',
			label: {
				text: 'Blocks',
				annotations: []
			}
		},
		eDAnnFjNdZpzYMtpSqReBxf: {
			id: 'eDAnnFjNdZpzYMtpSqReBxf',
			type: 'footer_link',
			href: '/#BPdekRaDEUcQZqtEwPwBvyu',
			target: '_self',
			label: {
				text: 'Media',
				annotations: []
			}
		},
		GwPeRFYtAyrcCMfpuyzdWZp: {
			id: 'GwPeRFYtAyrcCMfpuyzdWZp',
			type: 'footer_link',
			href: '/#jLnPqRsTuVwXyZaBcDeFg',
			target: '_self',
			label: {
				text: 'Examples',
				annotations: []
			}
		},
		fcSSWQUTYajjknPChgGsPZz: {
			id: 'fcSSWQUTYajjknPChgGsPZz',
			type: 'footer_link_column',
			footer_links: [
				'EtcfbabRCtPSvSpfFfjPeza',
				'WVvBSREFCThNYcpgvfUnWkF',
				'eDAnnFjNdZpzYMtpSqReBxf',
				'GwPeRFYtAyrcCMfpuyzdWZp'
			],
			label: {
				text: 'On this page',
				annotations: []
			}
		},
		uavzfSnSpTRrHSfJpbfvpsh: {
			id: 'uavzfSnSpTRrHSfJpbfvpsh',
			type: 'footer_link',
			href: 'https://github.com/michael/editable-website',
			target: '_blank',
			label: {
				text: 'Editable Website',
				annotations: []
			}
		},
		footer_link_2_1: {
			id: 'footer_link_2_1',
			type: 'footer_link',
			href: 'https://svedit.dev',
			label: {
				text: 'Svedit',
				annotations: []
			},
			target: '_blank'
		},
		footer_column_2: {
			id: 'footer_column_2',
			type: 'footer_link_column',
			label: {
				text: 'GitHub',
				annotations: []
			},
			footer_links: ['uavzfSnSpTRrHSfJpbfvpsh', 'footer_link_2_1']
		},
		ewuBYPxRqFsJXffTuwqssXg: {
			id: 'ewuBYPxRqFsJXffTuwqssXg',
			type: 'footer_link',
			href: 'https://www.youtube.com/watch?v=T2RMYj_1g9E',
			label: {
				text: 'Introduction',
				annotations: []
			},
			target: '_blank'
		},
		cCMbgzNjRjVjrvWuHJCvJkx: {
			id: 'cCMbgzNjRjVjrvWuHJCvJkx',
			type: 'footer_link',
			href: 'https://youtu.be/o4kcABS-XH4?t=3226',
			target: '_blank',
			label: {
				text: 'Update 2025-10',
				annotations: []
			}
		},
		footer_column_3: {
			id: 'footer_column_3',
			type: 'footer_link_column',
			label: {
				text: 'Videos',
				annotations: []
			},
			footer_links: ['ewuBYPxRqFsJXffTuwqssXg', 'cCMbgzNjRjVjrvWuHJCvJkx']
		},
		footer_1: {
			id: 'footer_1',
			type: 'footer',
			logo: 'footer_logo',
			copyright: {
				text: '© Editable Website',
				annotations: []
			},
			footer_link_columns: ['fcSSWQUTYajjknPChgGsPZz', 'footer_column_2', 'footer_column_3'],
			logo_max_width: 40,
			logo_aspect_ratio: 1
		},
		page_1: {
			id: 'page_1',
			type: 'page',
			title: {
				text: 'Editable Website',
				annotations: []
			},
			description: {
				text: 'SvelteKit template for building CMS-free editable websites. Site owners can edit content directly in the layout - no CMS needed.',
				annotations: []
			},
			image: 'vMaUqeqBAVSyPgDpnxWWPCK',
			body: [
				'gRpPsPcYyMPRSWWDXxvNGAF',
				'RtYpQwXsZvNmKjHgFdSaLe',
				'xKmNqPrStVwYzAbCdEfGh',
				'dyRWExwbkfuqKyDupbEqaec',
				'BPdekRaDEUcQZqtEwPwBvyu',
				'FUeFBwWRRuSJMVAhgxThQqj',
				'descriptive_gallery_intro',
				'jLnPqRsTuVwXyZaBcDeFg',
				'descriptive_gallery_outro',
				'XVJGXtwnQMvcrcuByAtcWNa',
				'fmxXNqJPJNkTZpAtwKSHxWb',
				'eRkNrkcQvspQsPtkDtuqekV',
				'prose_grid_1',
				'xEphsDndbNejaRnnPRBwvBK',
				'BBExBsmaSTXMZdcxMsYngwg',
				'preformatted_example',
				'YTMHBcPkYXJMRUnuSAhrTDE',
				'zBXuGXXYWMGbSdteMyNFhja',
				'wmrbpSFAFUmMRPDumcjKqpF'
			],
			nav: 'nav_1',
			footer: 'footer_1'
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
const nav_root_id = page_node.nav; // "nav_1"
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
