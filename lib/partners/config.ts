export type PartnerType = 'sponsor' | 'team'

export type Partner = {
  name: string
  type: PartnerType
  logoUrl: string
  instagramUrl: string
  handle: string
  websiteUrl?: string
}

export const partners: Partner[] = [
  {
    name: 'Drift-PDX',
    type: 'sponsor',
    logoUrl: '/sponsors/drift-pdx.png',
    instagramUrl: 'https://www.instagram.com/drift_pdx/',
    handle: '@drift_pdx',
    websiteUrl: 'https://driftpdx.square.site/',
  },
  {
    name: 'Yokomo',
    type: 'sponsor',
    logoUrl: '/sponsors/yokomo.png',
    instagramUrl: 'https://www.instagram.com/official_yokomo/',
    handle: '@official_yokomo',
    websiteUrl: 'https://teamyokomo.com/',
  },
  {
    name: 'Acuvance',
    type: 'sponsor',
    logoUrl: '/sponsors/acuvance.png',
    instagramUrl: 'https://www.instagram.com/acuvance_usa/',
    handle: '@acuvance_usa',
    websiteUrl: 'http://acuvance-usa.com/',
  },
  {
    name: '1up Racing',
    type: 'sponsor',
    logoUrl: '/sponsors/1up-racing.png',
    instagramUrl: 'https://www.instagram.com/1up_racing/',
    handle: '@1up_racing',
    websiteUrl: 'https://pick1up.com/',
  },
  {
    name: 'SP Designs RC',
    type: 'sponsor',
    logoUrl: '/sponsors/spd.png',
    instagramUrl: 'https://www.instagram.com/spdesignsrc/',
    handle: '@spdesignsrc',
  },
  {
    name: 'Team PDX',
    type: 'team',
    logoUrl: '/sponsors/team-pdx.png',
    instagramUrl: 'https://www.instagram.com/teampdxrcdrift/',
    handle: '@teampdxrcdrift',
  },
  {
    name: 'Team D-Style',
    type: 'team',
    logoUrl: '/sponsors/d-style.png',
    instagramUrl: 'https://www.instagram.com/team_d_style/',
    handle: '@team_d_style',
  },
]
