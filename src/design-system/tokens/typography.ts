/**
 * 字体系统设计令牌
 *
 * 定义字体家族、字号、行高和字重
 */

/**
 * 字体家族
 */
export const fontFamily = {
  sans: [
    'var(--font-geist-sans)',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'sans-serif',
  ],
  mono: [
    'var(--font-geist-mono)',
    'ui-monospace',
    'SFMono-Regular',
    'Monaco',
    'Consolas',
    'monospace',
  ],
} as const;

/**
 * 字体大小和行高
 */
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px / 16px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px / 20px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px / 24px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px / 28px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px / 28px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px / 32px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px / 40px
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px / 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px / 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px / 72px
  '8xl': ['6rem', { lineHeight: '1' }],         // 96px / 96px
  '9xl': ['8rem', { lineHeight: '1' }],         // 128px / 128px
} as const;

/**
 * 字重
 */
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

/**
 * 字母间距
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * 语义化排版
 */
export const typography = {
  // 标题
  h1: {
    fontSize: fontSize['3xl'][0],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'][1].lineHeight,
  },
  h2: {
    fontSize: fontSize['2xl'][0],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'][1].lineHeight,
  },
  h3: {
    fontSize: fontSize.xl[0],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl[1].lineHeight,
  },
  h4: {
    fontSize: fontSize.lg[0],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg[1].lineHeight,
  },
  h5: {
    fontSize: fontSize.base[0],
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base[1].lineHeight,
  },
  h6: {
    fontSize: fontSize.sm[0],
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm[1].lineHeight,
  },

  // 正文
  body: {
    fontSize: fontSize.base[0],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base[1].lineHeight,
  },
  'body-sm': {
    fontSize: fontSize.sm[0],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm[1].lineHeight,
  },
  'body-lg': {
    fontSize: fontSize.lg[0],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.lg[1].lineHeight,
  },

  // 标签/说明
  label: {
    fontSize: fontSize.sm[0],
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm[1].lineHeight,
  },
  caption: {
    fontSize: fontSize.xs[0],
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs[1].lineHeight,
  },

  // 代码
  code: {
    fontSize: fontSize.sm[0],
    fontWeight: fontWeight.normal,
    fontFamily: fontFamily.mono.join(', '),
  },
} as const;
