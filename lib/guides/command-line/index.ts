import type { Series } from '../types'
import { terminalsShellsAndProcesses } from './terminals-shells-and-processes'

export const commandLine: Series = {
  id: 'command-line',
  title: 'The Command Line',
  blurb: 'What your terminal, shell, and operating system are doing when you type a command.',
  intro:
    'Guides for engineers who live in the terminal but have never looked underneath it. Each one takes a tool you use every day and follows it down to the operating system.',
  accent: 'signal',
  modules: [],
  lessons: [terminalsShellsAndProcesses],
}
