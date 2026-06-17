import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Dillo Raju — Software Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#0f172a',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        gap: '24px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          color: '#818cf8',
          fontSize: '18px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}
      >
        Software Engineer
      </div>
      <div style={{ color: '#f1f5f9', fontSize: '64px', fontWeight: 700, lineHeight: 1.1 }}>
        Dillo Raju
      </div>
      <div style={{ color: '#94a3b8', fontSize: '24px', lineHeight: 1.4, maxWidth: '700px' }}>
        I build reliable, scalable software.
      </div>
      <div style={{ color: '#475569', fontSize: '16px', marginTop: '16px' }}>dillo.vercel.app</div>
    </div>,
    size
  )
}
