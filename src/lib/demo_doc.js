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
		TSRjJkcjxCEVZUVMwWBPJJT: {
			id: 'TSRjJkcjxCEVZUVMwWBPJJT',
			type: 'heading_2',
			layout: 1,
			content: {
				content: 'Skip the CMS',
				annotations: []
			}
		},
		QUyEgDbAcDSNkdtEewwfYGM: {
			id: 'QUyEgDbAcDSNkdtEewwfYGM',
			type: 'paragraph_xl',
			layout: 2,
			content: {
				content: 'Editable brings live on-page editing to Svelte.',
				annotations: []
			}
		},
		aMhZzGXzvqnSBrQMgrBvNEy: {
			id: 'aMhZzGXzvqnSBrQMgrBvNEy',
			type: 'button',
			layout: 1,
			href: '#RtYpQwXsZvNmKjHgFdSaLe',
			target: '_self',
			label: {
				content: 'Try',
				annotations: []
			}
		},
		XmMkSnbXSwSwVnMJgzkPmer: {
			id: 'XmMkSnbXSwSwVnMJgzkPmer',
			type: 'button',
			layout: 2,
			href: '',
			target: '_self',
			label: {
				content: 'Download ⤓',
				annotations: []
			}
		},
		tgzmEzyQGVDSHZVYnvuFWRp: {
			id: 'tgzmEzyQGVDSHZVYnvuFWRp',
			type: 'button_group',
			buttons: {
				nodes: ['aMhZzGXzvqnSBrQMgrBvNEy', 'XmMkSnbXSwSwVnMJgzkPmer'],
				annotations: []
			}
		},
		gRpPsPcYyMPRSWWDXxvNGAF: {
			id: 'gRpPsPcYyMPRSWWDXxvNGAF',
			type: 'prose',
			layout: 6,
			colorset: 0,
			body: {
				nodes: ['TSRjJkcjxCEVZUVMwWBPJJT', 'QUyEgDbAcDSNkdtEewwfYGM', 'tgzmEzyQGVDSHZVYnvuFWRp'],
				annotations: []
			}
		},
		mFEZbHhacnMvZEfegMSNGQH: {
			id: 'mFEZbHhacnMvZEfegMSNGQH',
			type: 'image',
			src: '',
			mime_type: '',
			width: 0,
			height: 0,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'contain'
		},
		RJbHKqVmgTdenaRBmANhAhn: {
			id: 'RJbHKqVmgTdenaRBmANhAhn',
			type: 'figure',
			layout: 5,
			media: 'mFEZbHhacnMvZEfegMSNGQH'
		},
		VbNcMxZaQwErTyUiOpLkJh: {
			id: 'VbNcMxZaQwErTyUiOpLkJh',
			type: 'image',
			src: '',
			mime_type: '',
			width: 0,
			height: 0,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'contain'
		},
		XEZYvKrndUKmFeRwPskjXSb: {
			id: 'XEZYvKrndUKmFeRwPskjXSb',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Start editing',
				annotations: []
			}
		},
		xMcjMhSuQKDayKNqNMbGDHW: {
			id: 'xMcjMhSuQKDayKNqNMbGDHW',
			type: 'code'
		},
		mHGxthXrZxjSjhYyXwbQfDf: {
			id: 'mHGxthXrZxjSjhYyXwbQfDf',
			type: 'code'
		},
		xeFfTFanDDERfWHUcjFRbbB: {
			id: 'xeFfTFanDDERfWHUcjFRbbB',
			type: 'code'
		},
		QjBkRxHSjJDEsZyrzWfvumb: {
			id: 'QjBkRxHSjJDEsZyrzWfvumb',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Hold ⌘ (Mac) or Ctrl (Windows) and press E to enter edit mode.',
				annotations: [
					{
						start_offset: 5,
						end_offset: 6,
						node_id: 'xMcjMhSuQKDayKNqNMbGDHW'
					},
					{
						start_offset: 41,
						end_offset: 42,
						node_id: 'mHGxthXrZxjSjhYyXwbQfDf'
					},
					{
						start_offset: 16,
						end_offset: 20,
						node_id: 'xeFfTFanDDERfWHUcjFRbbB'
					}
				]
			}
		},
		FwDGdCAfycBzYtSdHVMnKBG: {
			id: 'FwDGdCAfycBzYtSdHVMnKBG',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Click where you want to edit.',
				annotations: []
			}
		},
		CXScmpeXnecfzNpGxVvXdqf: {
			id: 'CXScmpeXnecfzNpGxVvXdqf',
			type: 'code'
		},
		vEsgCXdGdskZEJZbhvCqtvv: {
			id: 'vEsgCXdGdskZEJZbhvCqtvv',
			type: 'code'
		},
		WyqzrzHVaPMbjcCJsYkuZsE: {
			id: 'WyqzrzHVaPMbjcCJsYkuZsE',
			type: 'code'
		},
		McYSzTepjCMEbuWZupfCEXA: {
			id: 'McYSzTepjCMEbuWZupfCEXA',
			type: 'code'
		},
		twHRnpvTfHanzbUmQGfrzSN: {
			id: 'twHRnpvTfHanzbUmQGfrzSN',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Move around with ← → ↑ ↓.',
				annotations: [
					{
						start_offset: 17,
						end_offset: 18,
						node_id: 'CXScmpeXnecfzNpGxVvXdqf'
					},
					{
						start_offset: 19,
						end_offset: 20,
						node_id: 'vEsgCXdGdskZEJZbhvCqtvv'
					},
					{
						start_offset: 21,
						end_offset: 22,
						node_id: 'WyqzrzHVaPMbjcCJsYkuZsE'
					},
					{
						start_offset: 23,
						end_offset: 24,
						node_id: 'McYSzTepjCMEbuWZupfCEXA'
					}
				]
			}
		},
		znRgjawqTbTegrUtGxwDtSE: {
			id: 'znRgjawqTbTegrUtGxwDtSE',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Change anything you see!',
				annotations: []
			}
		},
		NhhsYbqTRzPtpQcHFUgwFhP: {
			id: 'NhhsYbqTRzPtpQcHFUgwFhP',
			type: 'code'
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
		JbDedTasSYzbCEhdrVvMXSv: {
			id: 'JbDedTasSYzbCEhdrVvMXSv',
			type: 'code'
		},
		jhRSZnegTBQARenKdBUQYgh: {
			id: 'jhRSZnegTBQARenKdBUQYgh',
			type: 'code'
		},
		kXvGKSUVXvvHjyzvZkFrXRQ: {
			id: 'kXvGKSUVXvvHjyzvZkFrXRQ',
			type: 'code'
		},
		GArGdawPrKZYvfxPdveNwrk: {
			id: 'GArGdawPrKZYvfxPdveNwrk',
			type: 'code'
		},
		ujTkSPgAkSZUCRTqhbvZadx: {
			id: 'ujTkSPgAkSZUCRTqhbvZadx',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Bold, italics and links with ⌘ or Ctrl + B, I and K.',
				annotations: [
					{
						start_offset: 34,
						end_offset: 38,
						node_id: 'NhhsYbqTRzPtpQcHFUgwFhP'
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
					},
					{
						start_offset: 41,
						end_offset: 42,
						node_id: 'JbDedTasSYzbCEhdrVvMXSv'
					},
					{
						start_offset: 44,
						end_offset: 45,
						node_id: 'jhRSZnegTBQARenKdBUQYgh'
					},
					{
						start_offset: 50,
						end_offset: 51,
						node_id: 'kXvGKSUVXvvHjyzvZkFrXRQ'
					},
					{
						start_offset: 29,
						end_offset: 30,
						node_id: 'GArGdawPrKZYvfxPdveNwrk'
					}
				]
			}
		},
		XtZkqrCsUBAmDnMbvnzKTfd: {
			id: 'XtZkqrCsUBAmDnMbvnzKTfd',
			type: 'code'
		},
		JSnSMURcyQJfxBDrNjVHwdf: {
			id: 'JSnSMURcyQJfxBDrNjVHwdf',
			type: 'code'
		},
		fDrYgEpkMsDvfCcnhVZeNbG: {
			id: 'fDrYgEpkMsDvfCcnhVZeNbG',
			type: 'code'
		},
		rMEHvQGqSpdRkUgmCBvgptB: {
			id: 'rMEHvQGqSpdRkUgmCBvgptB',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Undo with ⌘ or Ctrl + Z.',
				annotations: [
					{
						start_offset: 15,
						end_offset: 19,
						node_id: 'XtZkqrCsUBAmDnMbvnzKTfd'
					},
					{
						start_offset: 10,
						end_offset: 11,
						node_id: 'JSnSMURcyQJfxBDrNjVHwdf'
					},
					{
						start_offset: 22,
						end_offset: 23,
						node_id: 'fDrYgEpkMsDvfCcnhVZeNbG'
					}
				]
			}
		},
		NCXQcRsQGtuuZdregZhUCgR: {
			id: 'NCXQcRsQGtuuZdregZhUCgR',
			type: 'code'
		},
		vcrqWDCcutwyaBySHdJJPeW: {
			id: 'vcrqWDCcutwyaBySHdJJPeW',
			type: 'code'
		},
		pBzAGGQzdznNkuaPVcBZkMJ: {
			id: 'pBzAGGQzdznNkuaPVcBZkMJ',
			type: 'code'
		},
		bqHNFFXTKuAzfJSgBkBzRqh: {
			id: 'bqHNFFXTKuAzfJSgBkBzRqh',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Save changes with  ⌘ or Ctrl + S.',
				annotations: [
					{
						start_offset: 24,
						end_offset: 28,
						node_id: 'NCXQcRsQGtuuZdregZhUCgR'
					},
					{
						start_offset: 19,
						end_offset: 20,
						node_id: 'vcrqWDCcutwyaBySHdJJPeW'
					},
					{
						start_offset: 31,
						end_offset: 32,
						node_id: 'pBzAGGQzdznNkuaPVcBZkMJ'
					}
				]
			}
		},
		JkfchFmwTqBYVZawgntPWxP: {
			id: 'JkfchFmwTqBYVZawgntPWxP',
			type: 'paragraph_sm',
			layout: 2,
			content: {
				content:
					'On this demo page, changes are not persisted. On a real site, a logged in user would have their changes persisted to a database.',
				annotations: []
			}
		},
		RtYpQwXsZvNmKjHgFdSaLe: {
			id: 'RtYpQwXsZvNmKjHgFdSaLe',
			type: 'feature',
			layout: 2,
			colorset: 0,
			media: 'VbNcMxZaQwErTyUiOpLkJh',
			body: {
				nodes: [
					'XEZYvKrndUKmFeRwPskjXSb',
					'QjBkRxHSjJDEsZyrzWfvumb',
					'FwDGdCAfycBzYtSdHVMnKBG',
					'twHRnpvTfHanzbUmQGfrzSN',
					'znRgjawqTbTegrUtGxwDtSE',
					'ujTkSPgAkSZUCRTqhbvZadx',
					'rMEHvQGqSpdRkUgmCBvgptB',
					'bqHNFFXTKuAzfJSgBkBzRqh',
					'JkfchFmwTqBYVZawgntPWxP'
				],
				annotations: []
			}
		},
		HKvdPmGRBhfDwPBNEnwGfKw: {
			id: 'HKvdPmGRBhfDwPBNEnwGfKw',
			type: 'image',
			src: '',
			mime_type: '',
			width: 0,
			height: 0,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'contain'
		},
		fhGVryvJNVhDWWKkGYGZsyZ: {
			id: 'fhGVryvJNVhDWWKkGYGZsyZ',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Build with blocks',
				annotations: []
			}
		},
		AuWEjBDcdcswwFJDSyTzSHK: {
			id: 'AuWEjBDcdcswwFJDSyTzSHK',
			type: 'strong'
		},
		evXXtdJpAjyFbbfTxbjxErW: {
			id: 'evXXtdJpAjyFbbfTxbjxErW',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Select the dashed gap below this paragraph to see a flashing purple cursor.',
				annotations: [
					{
						start_offset: 11,
						end_offset: 22,
						node_id: 'AuWEjBDcdcswwFJDSyTzSHK'
					}
				]
			}
		},
		jETAUbRNDUeMJEmdFbHDhWv: {
			id: 'jETAUbRNDUeMJEmdFbHDhWv',
			type: 'code'
		},
		aDadwdgEhVSbkdeXCUrrwxp: {
			id: 'aDadwdgEhVSbkdeXCUrrwxp',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Press Enter to add a block.',
				annotations: [
					{
						start_offset: 6,
						end_offset: 11,
						node_id: 'jETAUbRNDUeMJEmdFbHDhWv'
					}
				]
			}
		},
		RTByAAwgnPEVmZZqtUTsxrb: {
			id: 'RTByAAwgnPEVmZZqtUTsxrb',
			type: 'code'
		},
		cEYAaPMyhqbrzxctrNsvxDP: {
			id: 'cEYAaPMyhqbrzxctrNsvxDP',
			type: 'code'
		},
		VjmsVtbYwjJQMjUKQGzKSjm: {
			id: 'VjmsVtbYwjJQMjUKQGzKSjm',
			type: 'code'
		},
		zNdZdAUVsgmJMFzsMGJFTbC: {
			id: 'zNdZdAUVsgmJMFzsMGJFTbC',
			type: 'code'
		},
		PstHADVermUQTXZSChbrGbr: {
			id: 'PstHADVermUQTXZSChbrGbr',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Change the text type from paragraph to heading with Ctrl + Shift + ↓ ↑.',
				annotations: [
					{
						start_offset: 52,
						end_offset: 56,
						node_id: 'RTByAAwgnPEVmZZqtUTsxrb'
					},
					{
						start_offset: 59,
						end_offset: 64,
						node_id: 'cEYAaPMyhqbrzxctrNsvxDP'
					},
					{
						start_offset: 67,
						end_offset: 68,
						node_id: 'VjmsVtbYwjJQMjUKQGzKSjm'
					},
					{
						start_offset: 69,
						end_offset: 70,
						node_id: 'zNdZdAUVsgmJMFzsMGJFTbC'
					}
				]
			}
		},
		mCAdjAUWSwMQAQKRmCffWkv: {
			id: 'mCAdjAUWSwMQAQKRmCffWkv',
			type: 'strong'
		},
		FvkmnCaHKSJbzaCuMpMcBJr: {
			id: 'FvkmnCaHKSJbzaCuMpMcBJr',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Select one of the full width dashed gap to see a flashing purple cursor.',
				annotations: [
					{
						start_offset: 18,
						end_offset: 39,
						node_id: 'mCAdjAUWSwMQAQKRmCffWkv'
					}
				]
			}
		},
		vxUVaWExgWktgpgfNrfZJhS: {
			id: 'vxUVaWExgWktgpgfNrfZJhS',
			type: 'code'
		},
		fZRAvjJsbByhMjcxeWjMABb: {
			id: 'fZRAvjJsbByhMjcxeWjMABb',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Press Enter to create a new top-level block.',
				annotations: [
					{
						start_offset: 6,
						end_offset: 11,
						node_id: 'vxUVaWExgWktgpgfNrfZJhS'
					}
				]
			}
		},
		BnCeVMRsCBVEKqyZUzPUhpp: {
			id: 'BnCeVMRsCBVEKqyZUzPUhpp',
			type: 'code'
		},
		eDkzrPMsADMCZPATPJayYUX: {
			id: 'eDkzrPMsADMCZPATPJayYUX',
			type: 'code'
		},
		gpXYRgrBcWNYeyrXdRhpBvV: {
			id: 'gpXYRgrBcWNYeyrXdRhpBvV',
			type: 'code'
		},
		gTkCsNxCgnNFegxNRcCHhjQ: {
			id: 'gTkCsNxCgnNFegxNRcCHhjQ',
			type: 'code'
		},
		uSggjCXeQZSBHVGJtUVjrWB: {
			id: 'uSggjCXeQZSBHVGJtUVjrWB',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Ctrl + Shift + ↓ ↑ cycles through block types.',
				annotations: [
					{
						start_offset: 0,
						end_offset: 4,
						node_id: 'BnCeVMRsCBVEKqyZUzPUhpp'
					},
					{
						start_offset: 7,
						end_offset: 12,
						node_id: 'eDkzrPMsADMCZPATPJayYUX'
					},
					{
						start_offset: 15,
						end_offset: 16,
						node_id: 'gpXYRgrBcWNYeyrXdRhpBvV'
					},
					{
						start_offset: 17,
						end_offset: 18,
						node_id: 'gTkCsNxCgnNFegxNRcCHhjQ'
					}
				]
			}
		},
		PXyrtZHKKVNtxcfPPEGZbys: {
			id: 'PXyrtZHKKVNtxcfPPEGZbys',
			type: 'code'
		},
		cQPhYUfcGRZwzwcZjHaxSBR: {
			id: 'cQPhYUfcGRZwzwcZjHaxSBR',
			type: 'code'
		},
		ZsRjCtYttZkdBUnMBnDAHEh: {
			id: 'ZsRjCtYttZkdBUnMBnDAHEh',
			type: 'code'
		},
		WCEqfDhjQMjKHkVuRdxXCXV: {
			id: 'WCEqfDhjQMjKHkVuRdxXCXV',
			type: 'code'
		},
		kdzfBXmwsbtGUfPVzXynEUG: {
			id: 'kdzfBXmwsbtGUfPVzXynEUG',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Ctrl + Shift + ← → lets you flip through available layouts.',
				annotations: [
					{
						start_offset: 0,
						end_offset: 4,
						node_id: 'PXyrtZHKKVNtxcfPPEGZbys'
					},
					{
						start_offset: 7,
						end_offset: 12,
						node_id: 'cQPhYUfcGRZwzwcZjHaxSBR'
					},
					{
						start_offset: 17,
						end_offset: 18,
						node_id: 'ZsRjCtYttZkdBUnMBnDAHEh'
					},
					{
						start_offset: 15,
						end_offset: 16,
						node_id: 'WCEqfDhjQMjKHkVuRdxXCXV'
					}
				]
			}
		},
		nrSCDWdxeAkpQpDkzrvKvJT: {
			id: 'nrSCDWdxeAkpQpDkzrvKvJT',
			type: 'strong'
		},
		enfBwMARyyTNCtvepmvUkXf: {
			id: 'enfBwMARyyTNCtvepmvUkXf',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'To move blocks, drag from a dashed gap to select multiple, then cut and paste like usual.',
				annotations: [
					{
						start_offset: 16,
						end_offset: 38,
						node_id: 'nrSCDWdxeAkpQpDkzrvKvJT'
					}
				]
			}
		},
		XrdwuVwsZhtyMnKXbkHEHRG: {
			id: 'XrdwuVwsZhtyMnKXbkHEHRG',
			type: 'code'
		},
		vkfSmwrvhEvkmUjrwAcvgvA: {
			id: 'vkfSmwrvhEvkmUjrwAcvgvA',
			type: 'paragraph_sm',
			layout: 2,
			content: {
				content:
					'Tip: Press Esc one or more times to select parent blocks. Usually faster and more precise than dragging from a dashed gap.',
				annotations: [
					{
						start_offset: 11,
						end_offset: 14,
						node_id: 'XrdwuVwsZhtyMnKXbkHEHRG'
					}
				]
			}
		},
		nGScFVScCanGVSnJXuevuVh: {
			id: 'nGScFVScCanGVSnJXuevuVh',
			type: 'feature',
			layout: 1,
			colorset: 0,
			media: 'HKvdPmGRBhfDwPBNEnwGfKw',
			body: {
				nodes: [
					'fhGVryvJNVhDWWKkGYGZsyZ',
					'evXXtdJpAjyFbbfTxbjxErW',
					'aDadwdgEhVSbkdeXCUrrwxp',
					'PstHADVermUQTXZSChbrGbr',
					'FvkmnCaHKSJbzaCuMpMcBJr',
					'fZRAvjJsbByhMjcxeWjMABb',
					'uSggjCXeQZSBHVGJtUVjrWB',
					'kdzfBXmwsbtGUfPVzXynEUG',
					'enfBwMARyyTNCtvepmvUkXf',
					'vkfSmwrvhEvkmUjrwAcvgvA'
				],
				annotations: []
			}
		},
		ttqZrWgKByzNJpAZWDjCdkt: {
			id: 'ttqZrWgKByzNJpAZWDjCdkt',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Add images and videos',
				annotations: []
			}
		},
		HjCnaGHNswXGNmDReQhNPjy: {
			id: 'HjCnaGHNswXGNmDReQhNPjy',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'Open a folder on your computer that has some images. Select one and copy it to the clipboard. Select the placeholder below and paste it. To replace an image, select it first, then paste the new one on top.',
				annotations: []
			}
		},
		dyRWExwbkfuqKyDupbEqaec: {
			id: 'dyRWExwbkfuqKyDupbEqaec',
			type: 'prose',
			layout: 1,
			colorset: 0,
			body: {
				nodes: ['ttqZrWgKByzNJpAZWDjCdkt', 'HjCnaGHNswXGNmDReQhNPjy'],
				annotations: []
			}
		},
		jEhPHUyzqvpNeSHYfKCkYgS: {
			id: 'jEhPHUyzqvpNeSHYfKCkYgS',
			type: 'image',
			src: '',
			mime_type: '',
			width: 0,
			height: 0,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'contain'
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
			src: '',
			mime_type: '',
			width: 0,
			height: 0,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'contain'
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
			gallery_items: {
				nodes: ['wtvHDBrCzJVgacTaJqAwNJk', 'TQRANBXMrzXXZTtzxAYhhZf', 'HtSTZfjTcDSkttVaTUKMYAj'],
				annotations: []
			}
		},
		SXKmbzRCwPeAYSnXfXFXHBd: {
			id: 'SXKmbzRCwPeAYSnXfXFXHBd',
			type: 'strong'
		},
		qQWRsxCRhpAaWYPrQyEtkRH: {
			id: 'qQWRsxCRhpAaWYPrQyEtkRH',
			type: 'strong'
		},
		pFjJFVqzQzwUQzBhPQAqkuZ: {
			id: 'pFjJFVqzQzwUQzBhPQAqkuZ',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'You can even paste several images at once. Select three or four from your computer and copy to the clipboard. Now select a vertical dashed area before or after an image above. Paste and all the images will be added in one go.',
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
			src: '',
			mime_type: '',
			width: 0,
			height: 0,
			alt: '',
			scale: 1,
			focal_point_x: 0.5,
			focal_point_y: 0.5,
			object_fit: 'contain'
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
		sBVXkwBDNWSvQvmDSUaQmSh: {
			id: 'sBVXkwBDNWSvQvmDSUaQmSh',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					"When you add images in the text flow, like the one above, you'll be able to change its size using the handles at the edges of the image.",
				annotations: [
					{
						start_offset: 102,
						end_offset: 122,
						node_id: 'kWHMWHbzvQqqPpbhPVGepXA'
					}
				]
			}
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
		askXYZSpXVmkUURQpjBUCEd: {
			id: 'askXYZSpXVmkUURQpjBUCEd',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'You can even paste short video clips onto any media placeholder. Currently .mp4 , .webm, and of course .gif are supported.',
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
			body: {
				nodes: [
					'pFjJFVqzQzwUQzBhPQAqkuZ',
					'jkPsBvJwtqCCjUDuByzxAHs',
					'sBVXkwBDNWSvQvmDSUaQmSh',
					'askXYZSpXVmkUURQpjBUCEd'
				],
				annotations: []
			}
		},
		FWAepzcFxQBWdFUpKazbgSJ: {
			id: 'FWAepzcFxQBWdFUpKazbgSJ',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Link to other pages',
				annotations: []
			}
		},
		FUgwpAMYUEeuvRMvbvJqXEy: {
			id: 'FUgwpAMYUEeuvRMvbvJqXEy',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Click on one of the cards below.',
				annotations: []
			}
		},
		xrCYaJRkGhsssCdSBTutdQk: {
			id: 'xrCYaJRkGhsssCdSBTutdQk',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'A link preview appears at the bottom.',
				annotations: []
			}
		},
		zsEhwdqMTSXmyydwJfWSrqg: {
			id: 'zsEhwdqMTSXmyydwJfWSrqg',
			type: 'code'
		},
		caEvHmSFeREgajgRpZEgxaS: {
			id: 'caEvHmSFeREgajgRpZEgxaS',
			type: 'code'
		},
		kQdCcJgcFccGuKWEDqrYbfq: {
			id: 'kQdCcJgcFccGuKWEDqrYbfq',
			type: 'code'
		},
		pAjXkSATTMDPZehUxzQazWX: {
			id: 'pAjXkSATTMDPZehUxzQazWX',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Click “Edit” or press ⌘ or Ctrl + K to bring up the link editor.',
				annotations: [
					{
						start_offset: 22,
						end_offset: 23,
						node_id: 'zsEhwdqMTSXmyydwJfWSrqg'
					},
					{
						start_offset: 27,
						end_offset: 31,
						node_id: 'caEvHmSFeREgajgRpZEgxaS'
					},
					{
						start_offset: 34,
						end_offset: 35,
						node_id: 'kQdCcJgcFccGuKWEDqrYbfq'
					}
				]
			}
		},
		descriptive_gallery_intro: {
			id: 'descriptive_gallery_intro',
			type: 'prose',
			layout: 1,
			colorset: 0,
			body: {
				nodes: [
					'FWAepzcFxQBWdFUpKazbgSJ',
					'FUgwpAMYUEeuvRMvbvJqXEy',
					'xrCYaJRkGhsssCdSBTutdQk',
					'pAjXkSATTMDPZehUxzQazWX'
				],
				annotations: []
			}
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
				content: 'Glücksmaurer',
				annotations: []
			},
			description: {
				content: 'Innovative real estate agent in Worms, Germany.',
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
				content: 'Colbourns',
				annotations: []
			},
			description: {
				content: 'London-based designer of premium-quality, elegant rugs.',
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
				content: 'Visionaries Tomorrow',
				annotations: []
			},
			description: {
				content: 'An early-stage industrial deep tech fund.',
				annotations: []
			}
		},
		jLnPqRsTuVwXyZaBcDeFg: {
			id: 'jLnPqRsTuVwXyZaBcDeFg',
			type: 'descriptive_gallery',
			layout: 1,
			items: {
				nodes: ['JUmgwJDKqdxVxJeBHkBdjVq', 'descriptive_gallery_item_2', 'YnBCBuemwpaUxQwHrFJNgMW'],
				annotations: []
			}
		},
		VqaqUWzRKUJrZzQYqqurggB: {
			id: 'VqaqUWzRKUJrZzQYqqurggB',
			type: 'link',
			href: 'https://mutter.co',
			target: '_blank'
		},
		KUAHxAZZcZTtjmHHBfbrbfs: {
			id: 'KUAHxAZZcZTtjmHHBfbrbfs',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'The cards above are links to examples of live in-place editable websites Johannes Mutter and I have already launched using this technology. You can see that any design is possible — it’s just HTML and CSS.',
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
			body: {
				nodes: ['KUAHxAZZcZTtjmHHBfbrbfs'],
				annotations: []
			}
		},
		awxJbWfytmnufqPsJCPxPnR: {
			id: 'awxJbWfytmnufqPsJCPxPnR',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'How does this work?',
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
		fMgsDXKARPqeRZGCmYKuvqj: {
			id: 'fMgsDXKARPqeRZGCmYKuvqj',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'Editable is powered by Svelte and Svedit — an open source rich text editor I’ve created. It builds on SvelteKit and SQLite to enable full websites with multiple pages and a persistent backend where only an admin can make changes.',
				annotations: [
					{
						start_offset: 102,
						end_offset: 111,
						node_id: 'vgwPcMefbMumuCsVyAPHhUz'
					},
					{
						start_offset: 116,
						end_offset: 122,
						node_id: 'qHveqveRzQxJzxGakaarEwb'
					},
					{
						start_offset: 23,
						end_offset: 29,
						node_id: 'sheNSfrhuAfrBWSKfvWPYGg'
					},
					{
						start_offset: 34,
						end_offset: 40,
						node_id: 'NZHwrDvtUBdpyDMvRJEGPcc'
					}
				]
			}
		},
		HgJRTPUBDfGQFhEDmwcNQNW: {
			id: 'HgJRTPUBDfGQFhEDmwcNQNW',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'The source code is not only available for Editable, but for all the foundations it is built on:',
				annotations: []
			}
		},
		XVJGXtwnQMvcrcuByAtcWNa: {
			id: 'XVJGXtwnQMvcrcuByAtcWNa',
			type: 'prose',
			layout: 1,
			colorset: 0,
			body: {
				nodes: ['awxJbWfytmnufqPsJCPxPnR', 'fMgsDXKARPqeRZGCmYKuvqj', 'HgJRTPUBDfGQFhEDmwcNQNW'],
				annotations: []
			}
		},
		BGYgxNUSXuDtBqxrKfExJnw: {
			id: 'BGYgxNUSXuDtBqxrKfExJnw',
			type: 'descriptive_listing_item',
			href: 'https://github.com/michael/editable-website',
			target: '_blank',
			title: {
				content: 'Editable',
				annotations: []
			},
			description: {
				content: 'CMS-free, in-place editable websites with Svelte ★1.7k+',
				annotations: []
			},
			meta: {
				content: 'Source available',
				annotations: []
			}
		},
		DEKuXmWSgnDZEhRgHGptcZJ: {
			id: 'DEKuXmWSgnDZEhRgHGptcZJ',
			type: 'descriptive_listing_item',
			href: 'https://github.com/michael/svedit',
			target: '_blank',
			title: {
				content: 'Svedit',
				annotations: []
			},
			description: {
				content: 'A tiny library for building editable websites in Svelte ★600+',
				annotations: []
			},
			meta: {
				content: 'MIT licensed',
				annotations: []
			}
		},
		NpbErTcbBZKBxShfRaFXzct: {
			id: 'NpbErTcbBZKBxShfRaFXzct',
			type: 'descriptive_listing_item',
			href: 'https://github.com/sveltejs/svelte',
			target: '_blank',
			title: {
				content: 'Svelte',
				annotations: []
			},
			description: {
				content: 'Web development for the rest of us ★86.7k+',
				annotations: []
			},
			meta: {
				content: 'MIT licensed',
				annotations: []
			}
		},
		fmxXNqJPJNkTZpAtwKSHxWb: {
			id: 'fmxXNqJPJNkTZpAtwKSHxWb',
			type: 'descriptive_listing',
			layout: 1,
			items: {
				nodes: ['BGYgxNUSXuDtBqxrKfExJnw', 'DEKuXmWSgnDZEhRgHGptcZJ', 'NpbErTcbBZKBxShfRaFXzct'],
				annotations: []
			}
		},
		KsFYXQPtmceJKGbEkmHqXTy: {
			id: 'KsFYXQPtmceJKGbEkmHqXTy',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Early-Adopter Pricing',
				annotations: []
			}
		},
		nHaWhmFqqDCzKjYfAYWzeAs: {
			id: 'nHaWhmFqqDCzKjYfAYWzeAs',
			type: 'list_item',
			content: {
				content: 'Includes all code and the right to modify it',
				annotations: []
			}
		},
		gfzZchrRysGcDEeXxAscCzg: {
			id: 'gfzZchrRysGcDEeXxAscCzg',
			type: 'list_item',
			content: {
				content: 'No subscription',
				annotations: []
			}
		},
		hhauqXDVvpScWyhmrsmvrqe: {
			id: 'hhauqXDVvpScWyhmrsmvrqe',
			type: 'list_item',
			content: {
				content: 'No hidden costs',
				annotations: []
			}
		},
		eJjQwDAYHqfcegtbNPTtQSJ: {
			id: 'eJjQwDAYHqfcegtbNPTtQSJ',
			type: 'list',
			layout: 2,
			list_items: {
				nodes: ['nHaWhmFqqDCzKjYfAYWzeAs', 'gfzZchrRysGcDEeXxAscCzg', 'hhauqXDVvpScWyhmrsmvrqe'],
				annotations: []
			}
		},
		eRkNrkcQvspQsPtkDtuqekV: {
			id: 'eRkNrkcQvspQsPtkDtuqekV',
			type: 'prose',
			layout: 1,
			colorset: 0,
			body: {
				nodes: ['KsFYXQPtmceJKGbEkmHqXTy', 'eJjQwDAYHqfcegtbNPTtQSJ'],
				annotations: []
			}
		},
		AJZwMjfQPTRnyPCSjNzhbta: {
			id: 'AJZwMjfQPTRnyPCSjNzhbta',
			type: 'paragraph',
			layout: 2,
			content: {
				content: 'PRE-LAUNCH',
				annotations: []
			}
		},
		pnyZxASHjrYVDxxYJpwpaUd: {
			id: 'pnyZxASHjrYVDxxYJpwpaUd',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Free',
				annotations: []
			}
		},
		NkfqqZuDrJVBBCGSdWRhyXv: {
			id: 'NkfqqZuDrJVBBCGSdWRhyXv',
			type: 'paragraph',
			layout: 2,
			content: {
				content: 'Install Editable and start developing.',
				annotations: []
			}
		},
		TTEwYweZQbgpAzDJeVgJaQg: {
			id: 'TTEwYweZQbgpAzDJeVgJaQg',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'Setup a website in minutes. Spend the next hour customizing it.',
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
				content: 'Download and Install ⤓',
				annotations: []
			}
		},
		prose_grid_free_action: {
			id: 'prose_grid_free_action',
			type: 'button_group',
			buttons: {
				nodes: ['prose_grid_free_button'],
				annotations: []
			}
		},
		prose_grid_free: {
			id: 'prose_grid_free',
			type: 'prose_grid_item',
			colorset: 0,
			body: {
				nodes: [
					'AJZwMjfQPTRnyPCSjNzhbta',
					'pnyZxASHjrYVDxxYJpwpaUd',
					'NkfqqZuDrJVBBCGSdWRhyXv',
					'TTEwYweZQbgpAzDJeVgJaQg',
					'prose_grid_free_action'
				],
				annotations: []
			}
		},
		bFTuteKYWEYEJsesbaZQqMW: {
			id: 'bFTuteKYWEYEJsesbaZQqMW',
			type: 'paragraph',
			layout: 2,
			content: {
				content: 'PERSONAL',
				annotations: []
			}
		},
		VZTbMkwXXkstnDCNDdKnEVc: {
			id: 'VZTbMkwXXkstnDCNDdKnEVc',
			type: 'heading_3',
			layout: 1,
			content: {
				content: '€99',
				annotations: []
			}
		},
		JTGfWeYsMugYPsXsvgtAUKs: {
			id: 'JTGfWeYsMugYPsXsvgtAUKs',
			type: 'paragraph',
			layout: 2,
			content: {
				content: 'Once. Per domain. When you launch.',
				annotations: []
			}
		},
		MuvTMbngQPxqRJQVPZmHHaD: {
			id: 'MuvTMbngQPxqRJQVPZmHHaD',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'For personal use or businesses with less than 150,000 EUR in annual revenue.',
				annotations: []
			}
		},
		prose_grid_supergrok_button: {
			id: 'prose_grid_supergrok_button',
			type: 'button',
			layout: 2,
			href: '#zBXuGXXYWMGbSdteMyNFhja',
			target: '_self',
			label: {
				content: 'Purchase →',
				annotations: []
			}
		},
		prose_grid_supergrok_action: {
			id: 'prose_grid_supergrok_action',
			type: 'button_group',
			buttons: {
				nodes: ['prose_grid_supergrok_button'],
				annotations: []
			}
		},
		zmVKWFqacrbaAWnfhxJnkwH: {
			id: 'zmVKWFqacrbaAWnfhxJnkwH',
			type: 'paragraph_sm',
			layout: 2,
			content: {
				content: '* available on request',
				annotations: []
			}
		},
		prose_grid_supergrok: {
			id: 'prose_grid_supergrok',
			type: 'prose_grid_item',
			colorset: 0,
			body: {
				nodes: [
					'bFTuteKYWEYEJsesbaZQqMW',
					'VZTbMkwXXkstnDCNDdKnEVc',
					'JTGfWeYsMugYPsXsvgtAUKs',
					'MuvTMbngQPxqRJQVPZmHHaD',
					'prose_grid_supergrok_action',
					'zmVKWFqacrbaAWnfhxJnkwH'
				],
				annotations: []
			}
		},
		BEXmuGVzZJGECjrTPcSAmtF: {
			id: 'BEXmuGVzZJGECjrTPcSAmtF',
			type: 'paragraph',
			layout: 2,
			content: {
				content: 'COMMERCIAL',
				annotations: []
			}
		},
		vCyXCUGQbCqDSeWhQrgxUfP: {
			id: 'vCyXCUGQbCqDSeWhQrgxUfP',
			type: 'heading_3',
			layout: 1,
			content: {
				content: '€299',
				annotations: []
			}
		},
		wHdrXFGRBBaMRUeAkASChBE: {
			id: 'wHdrXFGRBBaMRUeAkASChBE',
			type: 'paragraph',
			layout: 2,
			content: {
				content: 'Once. Per domain. When you launch.',
				annotations: []
			}
		},
		kxSuHGYyXEBZMcpGbdjCVWm: {
			id: 'kxSuHGYyXEBZMcpGbdjCVWm',
			type: 'paragraph',
			layout: 1,
			content: {
				content: 'For professional use or businesses with more than 150,000 EUR in annual revenue.',
				annotations: []
			}
		},
		prose_grid_expert_button: {
			id: 'prose_grid_expert_button',
			type: 'button',
			layout: 2,
			href: '#zBXuGXXYWMGbSdteMyNFhja',
			target: '_self',
			label: {
				content: 'Purchase →',
				annotations: []
			}
		},
		prose_grid_expert_action: {
			id: 'prose_grid_expert_action',
			type: 'button_group',
			buttons: {
				nodes: ['prose_grid_expert_button'],
				annotations: []
			}
		},
		SuNuqxwFCRepmRVXmrwmCjJ: {
			id: 'SuNuqxwFCRepmRVXmrwmCjJ',
			type: 'paragraph_sm',
			layout: 2,
			content: {
				content: '* available on request',
				annotations: []
			}
		},
		prose_grid_expert: {
			id: 'prose_grid_expert',
			type: 'prose_grid_item',
			colorset: 0,
			body: {
				nodes: [
					'BEXmuGVzZJGECjrTPcSAmtF',
					'vCyXCUGQbCqDSeWhQrgxUfP',
					'wHdrXFGRBBaMRUeAkASChBE',
					'kxSuHGYyXEBZMcpGbdjCVWm',
					'prose_grid_expert_action',
					'SuNuqxwFCRepmRVXmrwmCjJ'
				],
				annotations: []
			}
		},
		prose_grid_1: {
			id: 'prose_grid_1',
			type: 'prose_grid',
			layout: 2,
			items: {
				nodes: ['prose_grid_free', 'prose_grid_supergrok', 'prose_grid_expert'],
				annotations: []
			}
		},
		TYcAwBxbMfUnUnQFHbcnjjK: {
			id: 'TYcAwBxbMfUnUnQFHbcnjjK',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Frequently Asked Questions',
				annotations: []
			}
		},
		xEphsDndbNejaRnnPRBwvBK: {
			id: 'xEphsDndbNejaRnnPRBwvBK',
			type: 'prose',
			layout: 1,
			colorset: 0,
			body: {
				nodes: ['TYcAwBxbMfUnUnQFHbcnjjK'],
				annotations: []
			}
		},
		PgFkSEuFXmXvecwFNksBFfw: {
			id: 'PgFkSEuFXmXvecwFNksBFfw',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'The editing infrastructure (Svedit) becomes an integral part of your website (at runtime). As a developer, all you do is define content types (e.g. Figure) and implement components (e.g. Figure.svelte) — they are editable by default.',
				annotations: []
			}
		},
		DerFSxwnBjUZXfsePjKbYPd: {
			id: 'DerFSxwnBjUZXfsePjKbYPd',
			type: 'accordion_item',
			title: {
				content: 'How is this different to using a CMS?',
				annotations: []
			},
			body: {
				nodes: ['PgFkSEuFXmXvecwFNksBFfw'],
				annotations: []
			}
		},
		fWGAzktgaAYgCnbjDDNZqZt: {
			id: 'fWGAzktgaAYgCnbjDDNZqZt',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'There is experimental support for mobile editing — it works in principle. The current focus is on desktop UX, but mobile editing will improve over time.',
				annotations: []
			}
		},
		BfXmkWHjhSWZGMaKGxhSAXu: {
			id: 'BfXmkWHjhSWZGMaKGxhSAXu',
			type: 'accordion_item',
			title: {
				content: 'Is mobile editing supported?',
				annotations: []
			},
			body: {
				nodes: ['fWGAzktgaAYgCnbjDDNZqZt'],
				annotations: []
			}
		},
		wdKfHzXjUysbpyHBKWnjHPp: {
			id: 'wdKfHzXjUysbpyHBKWnjHPp',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					"All content lives in a single data/ directory — an SQLite database (db.sqlite3) and uploaded assets (assets/). Locally this defaults to ./data. On Fly.io it's a persistent volume at /data. To back up your site, copy this directory.",
				annotations: []
			}
		},
		rmMwFFdvFZzxzdsaQtZvdKH: {
			id: 'rmMwFFdvFZzxzdsaQtZvdKH',
			type: 'accordion_item',
			title: {
				content: 'Where is the data stored?',
				annotations: []
			},
			body: {
				nodes: ['wdKfHzXjUysbpyHBKWnjHPp'],
				annotations: []
			}
		},
		ahabwjAyHuBbTNMJacqWupQ: {
			id: 'ahabwjAyHuBbTNMJacqWupQ',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'Editable is a foundational, AI-agnostic tool. That said, it makes perfect sense to utilize AI workflows to help building your custom site. Think prompts like "Create a paragraph block type with layout variants" and "Implement Paragraph.svelte with 2 layouts".',
				annotations: []
			}
		},
		EjhqKzYMTknJuyFwbhJzyCA: {
			id: 'EjhqKzYMTknJuyFwbhJzyCA',
			type: 'accordion_item',
			title: {
				content: 'How about AI?',
				annotations: []
			},
			body: {
				nodes: ['ahabwjAyHuBbTNMJacqWupQ'],
				annotations: []
			}
		},
		vuEMUDFAUnxSBXvsvDsYDZe: {
			id: 'vuEMUDFAUnxSBXvsvDsYDZe',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					"Editable is modular and you can and should reuse code across projects. However, I purposely don't want to establish a community maintained plugin repository. I want to encourage you to own all your code, for the benefit of simplicity, safety, and control. Share code snippets, not plugins.",
				annotations: []
			}
		},
		PeFCTQcmaYpxvjGMrfvgGeW: {
			id: 'PeFCTQcmaYpxvjGMrfvgGeW',
			type: 'accordion_item',
			title: {
				content: 'Plugins?',
				annotations: []
			},
			body: {
				nodes: ['vuEMUDFAUnxSBXvsvDsYDZe'],
				annotations: []
			}
		},
		ZdwnbaVUbAPYzCZQhyJAYBr: {
			id: 'ZdwnbaVUbAPYzCZQhyJAYBr',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'Editable runs on any VPS. All you need is Node.js and SQLite. The repository includes a Dockerfile and fly.toml for one-command deployment to Fly.io — see Deploying to Fly.io above. The same Dockerfile works with any platform that supports Docker.',
				annotations: []
			}
		},
		tTTVGQvjNrfJsKHXSWaSDeE: {
			id: 'tTTVGQvjNrfJsKHXSWaSDeE',
			type: 'accordion_item',
			title: {
				content: 'Hosting?',
				annotations: []
			},
			body: {
				nodes: ['ZdwnbaVUbAPYzCZQhyJAYBr'],
				annotations: []
			}
		},
		prwbeXWyKVSsJXMPndjHYRS: {
			id: 'prwbeXWyKVSsJXMPndjHYRS',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					"There's no point for static builds with Editable. The whole idea is that users edit content live, without having to wait for a rebuild to finish. SQLite is fast. Very fast. Web-optimized images are generated client-side before upload: resizing happens in the browser via canvas and toBlob(), and WebP encoding is done with @jsquash/webp. It still makes sense to enable a proxy for images, so they can be delivered from a CDN.",
				annotations: []
			}
		},
		gftTVYqqYFbsTAkfMJKbhzH: {
			id: 'gftTVYqqYFbsTAkfMJKbhzH',
			type: 'accordion_item',
			title: {
				content: 'Static builds?',
				annotations: []
			},
			body: {
				nodes: ['prwbeXWyKVSsJXMPndjHYRS'],
				annotations: []
			}
		},
		VmvAPSsWYbVnekGqYyEKPUG: {
			id: 'VmvAPSsWYbVnekGqYyEKPUG',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					"Editable will at least be source-available. There will likely be an affordable one-time registration fee (per domain) for personal use, and a fair fee for commercial projects. I'm still working on the details. If you’re open to discussion, join the technical preview.",
				annotations: []
			}
		},
		gYpxwQwkQNNWWvYbTWBrAfx: {
			id: 'gYpxwQwkQNNWWvYbTWBrAfx',
			type: 'accordion_item',
			title: {
				content: 'License?',
				annotations: []
			},
			body: {
				nodes: ['VmvAPSsWYbVnekGqYyEKPUG'],
				annotations: []
			}
		},
		BBExBsmaSTXMZdcxMsYngwg: {
			id: 'BBExBsmaSTXMZdcxMsYngwg',
			type: 'accordion',
			items: {
				nodes: [
					'DerFSxwnBjUZXfsePjKbYPd',
					'BfXmkWHjhSWZGMaKGxhSAXu',
					'rmMwFFdvFZzxzdsaQtZvdKH',
					'EjhqKzYMTknJuyFwbhJzyCA',
					'PeFCTQcmaYpxvjGMrfvgGeW',
					'tTTVGQvjNrfJsKHXSWaSDeE',
					'gftTVYqqYFbsTAkfMJKbhzH',
					'gYpxwQwkQNNWWvYbTWBrAfx'
				],
				annotations: []
			},
			layout: 5
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
		TnMQYKQSSvPJySzxMfgqvge: {
			id: 'TnMQYKQSSvPJySzxMfgqvge',
			type: 'heading_3',
			layout: 1,
			content: {
				content: 'Hello, I’m Michael',
				annotations: []
			}
		},
		gnbpgBsBYZqEwRxqRZSMHdd: {
			id: 'gnbpgBsBYZqEwRxqRZSMHdd',
			type: 'link',
			href: 'https://letsken.com/michael/how-to-implement-a-web-based-rich-text-editor-in-2023',
			target: '_blank'
		},
		vWuEJXfcsUSSXwYKQmbAnxq: {
			id: 'vWuEJXfcsUSSXwYKQmbAnxq',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'Since 2011 I’ve been taming web browsers to behave correctly and predictably when editing rich text.',
				annotations: [
					{
						start_offset: 21,
						end_offset: 40,
						node_id: 'gnbpgBsBYZqEwRxqRZSMHdd'
					}
				]
			}
		},
		HTXqugHBTYdFtsEPuJBwdcQ: {
			id: 'HTXqugHBTYdFtsEPuJBwdcQ',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'I want you to be able to launch websites that anyone can edit. No more calls asking you to update someone’s WordPress site! They’ll be able to do it themselves.',
				annotations: []
			}
		},
		QEnRdGNnZesaJWpDstgKQhq: {
			id: 'QEnRdGNnZesaJWpDstgKQhq',
			type: 'paragraph',
			layout: 1,
			content: {
				content:
					'Most CMSs are too complex for clients and too restrictive for developers. Change every pixel of your site, create new content types, or integrate 3rd party data. Everything you can do with Svelte, you can do with Editable.',
				annotations: []
			}
		},
		YTMHBcPkYXJMRUnuSAhrTDE: {
			id: 'YTMHBcPkYXJMRUnuSAhrTDE',
			type: 'feature',
			layout: 2,
			colorset: 0,
			media: 'hqrrTdEbTPaqzEcYMczhBZb',
			body: {
				nodes: [
					'TnMQYKQSSvPJySzxMfgqvge',
					'vWuEJXfcsUSSXwYKQmbAnxq',
					'HTXqugHBTYdFtsEPuJBwdcQ',
					'QEnRdGNnZesaJWpDstgKQhq'
				],
				annotations: []
			}
		},
		CqTEkBNqegxMsErnwufYdHp: {
			id: 'CqTEkBNqegxMsErnwufYdHp',
			type: 'heading_2',
			layout: 1,
			content: {
				content: 'Try Editable now',
				annotations: []
			}
		},
		gMEmnxMvAaEMBfvxmUFzzeM: {
			id: 'gMEmnxMvAaEMBfvxmUFzzeM',
			type: 'button',
			layout: 1,
			href: '#RtYpQwXsZvNmKjHgFdSaLe',
			target: '_self',
			label: {
				content: 'Try',
				annotations: []
			}
		},
		qawneFduCjytdSMKSPbhBDk: {
			id: 'qawneFduCjytdSMKSPbhBDk',
			type: 'button',
			layout: 2,
			href: '',
			target: '_self',
			label: {
				content: 'Download ⤓',
				annotations: []
			}
		},
		fxbPhZADdeyCbysuCSwHNcA: {
			id: 'fxbPhZADdeyCbysuCSwHNcA',
			type: 'button_group',
			buttons: {
				nodes: ['gMEmnxMvAaEMBfvxmUFzzeM', 'qawneFduCjytdSMKSPbhBDk'],
				annotations: []
			}
		},
		zBXuGXXYWMGbSdteMyNFhja: {
			id: 'zBXuGXXYWMGbSdteMyNFhja',
			type: 'prose',
			layout: 4,
			colorset: 0,
			body: {
				nodes: ['CqTEkBNqegxMsErnwufYdHp', 'fxbPhZADdeyCbysuCSwHNcA'],
				annotations: []
			}
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
		vvqbUaMzgjJXvJGMzHFDnrE: {
			id: 'vvqbUaMzgjJXvJGMzHFDnrE',
			type: 'paragraph_sm',
			layout: 2,
			content: {
				content:
					'Big thanks to Johannes Mutter for helping with concept, design, and engineering, Tom Atkins for support with positioning and copywriting, and Sonja Stojanovic for modelling and being the very first happy Editable user — followed by Trails, Postlmayr Design, Aufreiter Architektur, and many more.',
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
						start_offset: 232,
						end_offset: 238,
						node_id: 'yFZKjXVRgKtHqNrtFNfBeSS'
					},
					{
						start_offset: 240,
						end_offset: 256,
						node_id: 'NcjxywhftMGtnXhbGyvmcUy'
					},
					{
						start_offset: 258,
						end_offset: 279,
						node_id: 'KKUfXFgJuXJrUSPyzMQrHcU'
					}
				]
			}
		},
		wmrbpSFAFUmMRPDumcjKqpF: {
			id: 'wmrbpSFAFUmMRPDumcjKqpF',
			type: 'prose',
			layout: 5,
			colorset: 0,
			body: {
				nodes: ['vvqbUaMzgjJXvJGMzHFDnrE'],
				annotations: []
			}
		},
		mACRdEqtkMhwnUcdeKpBfDW: {
			id: 'mACRdEqtkMhwnUcdeKpBfDW',
			type: 'section'
		},
		uucFzvqgQjVkmDFcFhMnbvX: {
			id: 'uucFzvqgQjVkmDFcFhMnbvX',
			type: 'section'
		},
		hPnUrMaKzUxndrvFhzrgvCD: {
			id: 'hPnUrMaKzUxndrvFhzrgvCD',
			type: 'section'
		},
		KgADBhzVGCwhYhBsAkyZvvT: {
			id: 'KgADBhzVGCwhYhBsAkyZvvT',
			type: 'section'
		},
		kKwKQPPJhSmxzuxPnkqZPaT: {
			id: 'kKwKQPPJhSmxzuxPnkqZPaT',
			type: 'section'
		},
		nav_logo_media: {
			id: 'nav_logo_media',
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
		nav_logo: {
			id: 'nav_logo',
			type: 'nav_image',
			href: '/',
			target: '_self',
			media: 'nav_logo_media'
		},
		DDmmrQzcAxWJfdhatTbkRTh: {
			id: 'DDmmrQzcAxWJfdhatTbkRTh',
			type: 'nav_link',
			href: '/#RtYpQwXsZvNmKjHgFdSaLe',
			target: '_self',
			label: {
				content: 'Showcases',
				annotations: []
			}
		},
		BESRZnRsUbbWapdUTzGNxFH: {
			id: 'BESRZnRsUbbWapdUTzGNxFH',
			type: 'nav_link',
			href: '#',
			target: '_self',
			label: {
				content: 'Manual',
				annotations: []
			}
		},
		atmQQGpCXBweGkkcSuKpJPS: {
			id: 'atmQQGpCXBweGkkcSuKpJPS',
			type: 'nav_link',
			href: '#',
			target: '_self',
			label: {
				content: 'Blog',
				annotations: []
			}
		},
		GyKyQvRAvkgnywmxTVgvrnF: {
			id: 'GyKyQvRAvkgnywmxTVgvrnF',
			type: 'nav_link',
			href: '/#XVJGXtwnQMvcrcuByAtcWNa',
			target: '_self',
			label: {
				content: 'About',
				annotations: []
			}
		},
		yeYXsdtjqkFgJtvdhjTemtP: {
			id: 'yeYXsdtjqkFgJtvdhjTemtP',
			type: 'nav_button',
			layout: 1,
			href: '#RtYpQwXsZvNmKjHgFdSaLe',
			target: '_self',
			label: {
				content: 'Try',
				annotations: []
			}
		},
		FKgjxHCeSbVZrdnPuxYkMYp: {
			id: 'FKgjxHCeSbVZrdnPuxYkMYp',
			type: 'nav_button',
			layout: 2,
			href: '',
			target: '_blank',
			label: {
				content: 'Download ⤓',
				annotations: []
			}
		},
		nav_1: {
			id: 'nav_1',
			type: 'nav',
			start_items: {
				nodes: ['nav_logo'],
				annotations: []
			},
			center_items: {
				nodes: [
					'DDmmrQzcAxWJfdhatTbkRTh',
					'BESRZnRsUbbWapdUTzGNxFH',
					'atmQQGpCXBweGkkcSuKpJPS',
					'GyKyQvRAvkgnywmxTVgvrnF'
				],
				annotations: []
			},
			end_items: {
				nodes: ['yeYXsdtjqkFgJtvdhjTemtP', 'FKgjxHCeSbVZrdnPuxYkMYp'],
				annotations: []
			}
		},
		ncqBPBKuDzbdCKqPdAUwszK: {
			id: 'ncqBPBKuDzbdCKqPdAUwszK',
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
		WkrTBHKFKjjCphujhzqZrup: {
			id: 'WkrTBHKFKjjCphujhzqZrup',
			type: 'supporting_media',
			media: 'ncqBPBKuDzbdCKqPdAUwszK',
			media_max_width: 64,
			media_aspect_ratio: 1
		},
		footer_copyright: {
			id: 'footer_copyright',
			type: 'paragraph_sm',
			layout: 2,
			content: {
				content: '© Ken Experiences GmbH 2026',
				annotations: []
			}
		},
		footer_link_category_1: {
			id: 'footer_link_category_1',
			type: 'footer_link_category',
			title: {
				content: 'On this page',
				annotations: []
			}
		},
		EtcfbabRCtPSvSpfFfjPeza: {
			id: 'EtcfbabRCtPSvSpfFfjPeza',
			type: 'footer_link',
			href: '/#RtYpQwXsZvNmKjHgFdSaLe',
			target: '_self',
			label: {
				content: 'Editing',
				annotations: []
			}
		},
		WVvBSREFCThNYcpgvfUnWkF: {
			id: 'WVvBSREFCThNYcpgvfUnWkF',
			type: 'footer_link',
			href: '/#xKmNqPrStVwYzAbCdEfGh',
			target: '_self',
			label: {
				content: 'Blocks',
				annotations: []
			}
		},
		eDAnnFjNdZpzYMtpSqReBxf: {
			id: 'eDAnnFjNdZpzYMtpSqReBxf',
			type: 'footer_link',
			href: '/#BPdekRaDEUcQZqtEwPwBvyu',
			target: '_self',
			label: {
				content: 'Media',
				annotations: []
			}
		},
		GwPeRFYtAyrcCMfpuyzdWZp: {
			id: 'GwPeRFYtAyrcCMfpuyzdWZp',
			type: 'footer_link',
			href: '/#jLnPqRsTuVwXyZaBcDeFg',
			target: '_self',
			label: {
				content: 'Examples',
				annotations: []
			}
		},
		fcSSWQUTYajjknPChgGsPZz: {
			id: 'fcSSWQUTYajjknPChgGsPZz',
			type: 'footer_link_column',
			items: {
				nodes: [
					'footer_link_category_1',
					'EtcfbabRCtPSvSpfFfjPeza',
					'WVvBSREFCThNYcpgvfUnWkF',
					'eDAnnFjNdZpzYMtpSqReBxf',
					'GwPeRFYtAyrcCMfpuyzdWZp'
				],
				annotations: []
			}
		},
		footer_link_category_2: {
			id: 'footer_link_category_2',
			type: 'footer_link_category',
			title: {
				content: 'GitHub',
				annotations: []
			}
		},
		uavzfSnSpTRrHSfJpbfvpsh: {
			id: 'uavzfSnSpTRrHSfJpbfvpsh',
			type: 'footer_link',
			href: 'https://github.com/michael/editable-website',
			target: '_blank',
			label: {
				content: 'Editable',
				annotations: []
			}
		},
		footer_link_2_1: {
			id: 'footer_link_2_1',
			type: 'footer_link',
			href: 'https://svedit.dev',
			label: {
				content: 'Svedit',
				annotations: []
			},
			target: '_blank'
		},
		footer_column_2: {
			id: 'footer_column_2',
			type: 'footer_link_column',
			items: {
				nodes: ['footer_link_category_2', 'uavzfSnSpTRrHSfJpbfvpsh', 'footer_link_2_1'],
				annotations: []
			}
		},
		footer_link_category_3: {
			id: 'footer_link_category_3',
			type: 'footer_link_category',
			title: {
				content: 'Videos',
				annotations: []
			}
		},
		ewuBYPxRqFsJXffTuwqssXg: {
			id: 'ewuBYPxRqFsJXffTuwqssXg',
			type: 'footer_link',
			href: 'https://www.youtube.com/watch?v=T2RMYj_1g9E',
			label: {
				content: 'Introduction',
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
				content: 'Update 2025-10',
				annotations: []
			}
		},
		footer_column_3: {
			id: 'footer_column_3',
			type: 'footer_link_column',
			items: {
				nodes: ['footer_link_category_3', 'ewuBYPxRqFsJXffTuwqssXg', 'cCMbgzNjRjVjrvWuHJCvJkx'],
				annotations: []
			}
		},
		footer_1: {
			id: 'footer_1',
			type: 'footer',
			body: {
				nodes: ['WkrTBHKFKjjCphujhzqZrup', 'footer_copyright'],
				annotations: []
			},
			footer_link_columns: {
				nodes: ['fcSSWQUTYajjknPChgGsPZz', 'footer_column_2', 'footer_column_3'],
				annotations: []
			}
		},
		page_1: {
			id: 'page_1',
			type: 'page',
			title: {
				content: 'Editable',
				annotations: []
			},
			description: {
				content:
					'SvelteKit template for building CMS-free editable websites. Site owners can edit content directly in the layout - no CMS needed.',
				annotations: []
			},
			image: 'vMaUqeqBAVSyPgDpnxWWPCK',
			body: {
				nodes: [
					'gRpPsPcYyMPRSWWDXxvNGAF',
					'RJbHKqVmgTdenaRBmANhAhn',
					'RtYpQwXsZvNmKjHgFdSaLe',
					'nGScFVScCanGVSnJXuevuVh',
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
					'YTMHBcPkYXJMRUnuSAhrTDE',
					'zBXuGXXYWMGbSdteMyNFhja',
					'wmrbpSFAFUmMRPDumcjKqpF'
				],
				annotations: [
					{
						start_offset: 4,
						end_offset: 7,
						node_id: 'mACRdEqtkMhwnUcdeKpBfDW'
					},
					{
						start_offset: 7,
						end_offset: 10,
						node_id: 'uucFzvqgQjVkmDFcFhMnbvX'
					},
					{
						start_offset: 10,
						end_offset: 12,
						node_id: 'hPnUrMaKzUxndrvFhzrgvCD'
					},
					{
						start_offset: 12,
						end_offset: 14,
						node_id: 'KgADBhzVGCwhYhBsAkyZvvT'
					},
					{
						start_offset: 14,
						end_offset: 16,
						node_id: 'kKwKQPPJhSmxzuxPnkqZPaT'
					}
				]
			},
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
