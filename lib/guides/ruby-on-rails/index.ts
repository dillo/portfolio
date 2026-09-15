import type { Series } from '../types'
import { railsAssetPipelines } from './rails-asset-pipelines'
import { railsRequestPath } from './rails-request-path'
import { howPumaRunsYourRailsApplication } from './how-puma-runs-your-rails-application'
import { howRailsLoadsYourCode } from './how-rails-loads-your-code'

export const rubyOnRails: Series = {
  id: 'ruby-on-rails',
  title: 'Ruby on Rails',
  blurb: 'Focused guides to how Rails applications work.',
  intro:
    'Self-contained guides to Ruby on Rails, one topic at a time. Start with the concept you need and explore how it behaves in development and production.',
  accent: 'accent',
  modules: [],
  lessons: [
    railsAssetPipelines,
    railsRequestPath,
    howPumaRunsYourRailsApplication,
    howRailsLoadsYourCode,
  ],
}
