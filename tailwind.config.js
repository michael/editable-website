import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const round = num =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '');
const em = (px, base) => `${round(px / base)}em`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Jost', 'system-ui']
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h2: {
              fontSize: em(20, 14),
              marginTop: em(32, 20),
              marginBottom: em(4, 20),
              lineHeight: round(28 / 20)
            },
            blockquote: {
              fontWeight: 'normal',
              fontStyle: 'normal',
              color: '',
              borderLeftWidth: '0.25rem',
              borderLeftColor: 'var(--tw-prose-quote-borders)',
              quotes: ''
            },
            'blockquote p:first-of-type::before': {
              content: ''
            },
            'blockquote p:last-of-type::after': {
              content: ''
            }
          }
        },
        lg: {
          css: {
            h2: {
              fontSize: em(30, 18),
              marginTop: em(56, 30),
              marginBottom: em(4, 20),
              lineHeight: round(40 / 30)
            }
          }
        },
        xl: {
          css: {
            h2: {
              fontSize: em(30, 18),
              marginTop: em(56, 30),
              marginBottom: em(4, 20),
              lineHeight: round(40 / 30)
            }
          }
        }
      }
    }
  },
  plugins: [forms, typography]
};
