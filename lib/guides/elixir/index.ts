import type { Series } from '../types'
import { elixirForRubyists } from './elixir-for-rubyists'
import { phoenixForRailsDevs } from './phoenix-for-rails-devs'

export const elixir: Series = {
  id: 'elixir',
  title: 'Elixir',
  blurb: 'Crash courses in Elixir and Phoenix, written for Ruby and Rails developers.',
  intro:
    'Guides to Elixir and Phoenix that start from what you already know in Ruby and Rails. Read them in order — the Phoenix guide leans on the language ideas introduced in the first.',
  accent: 'signal',
  modules: [],
  lessons: [elixirForRubyists, phoenixForRailsDevs],
}
