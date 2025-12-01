// i18n-iso-countries.d.ts
declare module 'i18n-iso-countries' {
  interface Countries {
    registerLocale: (localeData: any) => void
    getAlpha2Code: (countryName: string, language: string) => string | undefined
    getName: (countryCode: string, language: string) => string | undefined
    getNames: (language: string) => Record<string, string>
    toAlpha2: (countryCode: string) => string
    toAlpha3: (countryCode: string) => string
    alpha2ToAlpha3: (alpha2Code: string) => string | undefined
    alpha3ToAlpha2: (alpha3Code: string) => string | undefined
    getAlpha2Codes: () => string[]
    getAlpha3Codes: () => string[]
    isValid: (countryCode: string) => boolean
  }

  const countries: Countries
  export = countries
}

declare module 'i18n-iso-countries/langs/en.json' {
  const enLocale: any
  export = enLocale
}
