// iso-3166-2.d.ts
declare module 'iso-3166-2' {
  interface SubdivisionData {
    name: string
    code: string
    type?: string
  }

  interface ISO31662 {
    subdivision: {
      (countryCode: string): Record<string, SubdivisionData> | null
      (countryCode: string, subdivisionCode: string): SubdivisionData | null
    }
  }

  const iso31662: ISO31662
  export = iso31662
}
