import type { Lesson } from '../types'

export const terminalsShellsAndProcesses: Lesson = {
  slug: 'terminals-shells-and-processes',
  title: 'How Your Terminal and Shell Work Together',
  tagline: 'Terminal, shell, Bash, Zsh: what each one is, and what happens when you press Enter.',
  intro:
    'You open iTerm2, type `npm run dev`, and a dev server starts. That one action passes through three separate layers: a terminal app that draws text, a shell that interprets your command, and the operating system kernel that actually runs programs. Once you can tell those layers apart, a lot of everyday behavior stops being mysterious: why a new tab does not know about the `cd` you ran in another, why Ctrl-C stops your server but not your shell, and why two dev servers can fight over a port.',
  minutes: 12,
  sections: [
    {
      heading: 'Three layers, not one',
      blocks: [
        {
          kind: 'p',
          text: 'People say "the terminal" for the whole experience, but it is really a stack:',
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'Terminal     the window: draws text, captures keystrokes      (iTerm2, Warp, VS Code)\n   │\nShell        the interpreter: reads and runs your commands    (zsh, bash)\n   │\nKernel       the operating system: creates and runs processes (macOS, Linux)',
        },
        {
          kind: 'p',
          text: 'Your shell configuration, such as `~/.zshrc`, sits alongside the shell and customizes it. The sections below go through the stack from the top down, then follow a single command through all of it.',
        },
      ],
    },
    {
      heading: 'The terminal: a window that draws text',
      blocks: [
        {
          kind: 'p',
          text: 'A terminal is an ordinary application. It does not understand commands, and it cannot run `ls` or `git` on its own. It has two jobs: capture your keystrokes and send them on, and take the text that comes back and draw it on screen. That includes colors, cursor movement, and full-screen programs like `vim`, which work by sending special escape sequences for the terminal to act on.',
        },
        {
          kind: 'p',
          text: 'The name "terminal emulator" is literal. Decades ago a terminal was a physical device, a keyboard and screen wired to a shared computer. Apps like iTerm2, Terminal.app, Warp, Alacritty, and the VS Code panel imitate that hardware in software.',
        },
        {
          kind: 'p',
          text: 'To talk to the programs it hosts, a terminal asks the kernel for a **pseudo-terminal (PTY)**. A PTY is a pair of connected endpoints managed by the kernel. The terminal app holds one end. The shell is attached to the other end as its keyboard input and screen output: its standard input, standard output, and standard error. Bytes written into one end come out of the other.',
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'iTerm2 ──▶ [ PTY: terminal end ⇄ program end ] ──▶ zsh\n       keystrokes go in ──▶        ◀── output text comes back',
        },
        {
          kind: 'p',
          text: 'Run `tty` in any window and you will see the program end of its PTY, something like `/dev/ttys003`. Each window or tab gets its own.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'The PTY is more than a pipe',
          text: "The kernel's terminal layer sits between the two ends and does some work of its own. When you press Ctrl-C, the terminal sends a single byte. The kernel recognizes it and sends an interrupt signal (`SIGINT`) to whichever program is currently in the foreground. Your shell never sees the keystroke. We will come back to this.",
        },
      ],
    },
    {
      heading: 'The shell: the program that runs your commands',
      blocks: [
        {
          kind: 'p',
          text: 'The shell is the program attached to the other end of the PTY. It prints your prompt, reads the line you type, and works out what you meant. It expands `*.ts` into matching filenames, substitutes `$HOME`, sets up pipes (`|`) and redirections (`>`), and then asks the kernel to run the programs involved.',
        },
        {
          kind: 'p',
          text: "It is called a shell because it wraps the kernel. The kernel does the real work of running programs and managing memory and files, but it has no user interface. The shell is one interface to it. If the kernel is a car's engine, the shell is the steering wheel, pedals, and dashboard.",
        },
        {
          kind: 'p',
          text: "You can see the shell running in your current window. `$$` expands to the shell's own process ID:",
        },
        {
          kind: 'code',
          lang: 'sh',
          code: '$ ps -p $$\n  PID TTY           TIME CMD\n 1001 ttys003    0:00.12 -zsh',
        },
        {
          kind: 'p',
          text: 'The leading dash in `-zsh` marks a **login shell**, which matters for which config files it reads (see the next section).',
        },
      ],
    },
    {
      heading: 'Bash and Zsh: two shells, largely compatible',
      blocks: [
        {
          kind: 'p',
          text: 'Bash and Zsh are two different shell programs that do the same job. Both descend from the original Unix Bourne shell (`sh`), so everyday syntax such as pipes, redirection, `if`, `for`, and `$VAR` is the same in both. Scripts that stick to that common core run in either.',
        },
        {
          kind: 'table',
          headers: ['', 'Bash', 'Zsh'],
          rows: [
            [
              'Where you meet it',
              'The default on most Linux systems, and in Docker images and CI runners.',
              'The default login shell on macOS since Catalina (2019).',
            ],
            [
              'Interactive features',
              'Solid, but completion and prompts are basic unless configured.',
              'Much richer once enabled: menu-style tab completion, case-insensitive matching, spelling correction, and heavy theming.',
            ],
            [
              'Extensions',
              'Possible, with a smaller ecosystem.',
              'A large plugin ecosystem (Oh My Zsh, Prezto, and others).',
            ],
            [
              'Scripting behavior',
              'Close to POSIX `sh`. The safer choice for portable scripts.',
              'Not POSIX-compatible by default. For example, unquoted `$VAR` is not word-split, and arrays start at index 1.',
            ],
            ['License', 'GPLv3 since Bash 4.0 (2009).', 'MIT-style permissive license.'],
          ],
        },
        {
          kind: 'p',
          text: 'The license is why macOS switched. Apple does not ship GPLv3 software in macOS, so it froze Bash at 3.2, the last GPLv2 release. That version is from 2007 and still lives at `/bin/bash`. Rather than keep an outdated shell as the default, Apple made Zsh the default. If you need a modern Bash on a Mac, install it with Homebrew.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Your prompt shell is not your script shell',
          text: 'The shebang on the first line of a script (`#!/bin/bash` or `#!/bin/sh`) chooses which shell runs it, regardless of what you use interactively. That is why a script can work in CI and still behave differently when you paste its lines into your Zsh prompt.',
        },
      ],
    },
    {
      heading: 'Startup: how your configuration gets loaded',
      blocks: [
        {
          kind: 'p',
          text: 'A new shell starts with none of your customizations. Before it shows a prompt, it reads a series of startup files. For Zsh, the main ones are:',
        },
        {
          kind: 'list',
          items: [
            '`~/.zshenv`, read by every Zsh, including ones that run scripts. Keep it small.',
            '`~/.zprofile`, read by login shells. This is the place for `PATH` setup, including Homebrew\'s `eval "$(/opt/homebrew/bin/brew shellenv)"`.',
            '`~/.zshrc`, read by interactive shells. This is where aliases, prompt themes, completion, and plugins go.',
          ],
        },
        {
          kind: 'p',
          text: 'Terminal apps on macOS start each new window as a login shell, so every window reads all three. Bash follows the same pattern with different names: `~/.bash_profile` for login shells and `~/.bashrc` for interactive ones.',
        },
        {
          kind: 'p',
          text: 'These files are read only at startup. Editing `~/.zshrc` does not affect windows that are already open. Open a new window, or run `source ~/.zshrc` to re-read it in the current one.',
        },
      ],
    },
    {
      heading: 'What happens when you press Enter',
      blocks: [
        {
          kind: 'p',
          text: 'Now the stack is running: iTerm2 holds one end of a PTY, and Zsh is attached to the other, configured and showing its prompt. You type `npm run dev`. Each keystroke travels through the PTY to Zsh, and the characters appear on screen as they are echoed back. You press Enter.',
        },
        {
          kind: 'heading',
          text: '1. Find the program',
        },
        {
          kind: 'p',
          text: 'Zsh first checks whether `npm` is something it handles itself: an alias, a shell function, or a **builtin** command. It is none of these, so Zsh searches each directory in `$PATH`, in order, for an executable file named `npm`. Run `which npm` or `type npm` to see what it finds. This lookup order is why an alias can shadow a real program, and why the order of entries in `PATH` matters when two versions of a tool are installed.',
        },
        {
          kind: 'heading',
          text: '2. fork(): copy the shell',
        },
        {
          kind: 'p',
          text: 'Unix has no system call that means "start a new program as a new process." It splits that into two steps. First the shell calls `fork()`, and the kernel creates a new child process that is a copy of the shell: same memory contents, same environment variables, same current directory, and the same open files. That last one includes the connection to the PTY.',
        },
        {
          kind: 'p',
          text: 'Copying a whole process sounds expensive, but the kernel does not duplicate the memory up front. Parent and child share the same physical pages, marked **copy-on-write**. A page is copied only when one side changes it. Since the child is about to discard that memory anyway, very little is actually copied.',
        },
        {
          kind: 'heading',
          text: '3. exec(): replace the copy with npm',
        },
        {
          kind: 'p',
          text: "The child then calls `exec()` with the path it found. The kernel throws away the child's copy of the Zsh program and loads `npm` in its place. The process ID stays the same, and so do the environment, current directory, and open files. Only the program inside changes. (`npm` is a Node.js script, so the kernel reads its `#!/usr/bin/env node` shebang line and actually starts `node` to run it.)",
        },
        {
          kind: 'heading',
          text: '4. The shell waits',
        },
        {
          kind: 'p',
          text: "Meanwhile the parent Zsh hands the terminal's foreground to the new process and calls `wait()`, sleeping until its child exits. When `npm` finishes, or you stop it, Zsh wakes up, records the exit status in `$?`, and prints a new prompt.",
        },
      ],
    },
    {
      heading: 'Output skips the shell',
      blocks: [
        {
          kind: 'p',
          text: 'A common mental model is that the shell collects the program\'s output and passes it to the terminal. That is not what happens. The child inherited the shell\'s connection to the PTY during `fork()`, and `exec()` kept it. So when your dev server logs "ready on localhost:3000", it writes that text directly into the PTY, and iTerm2 reads it from the other end and draws it. Zsh is asleep in `wait()` the entire time.',
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'You ──keys──▶ iTerm2 ──▶ PTY ──▶ node (npm run dev)\n                 ▲             │\n                 └────output───┘\n\n        zsh: asleep in wait(), until node exits',
        },
        {
          kind: 'p',
          text: "Input takes the same route. While the dev server is in the foreground, keys you type go to it, not to Zsh. That is also how Ctrl-C works. The kernel's terminal layer sees the Ctrl-C byte and sends `SIGINT` to the foreground process group, which is your dev server. The server exits, `wait()` returns, and Zsh shows the prompt again. Zsh is not in the foreground, so the signal does not reach it.",
        },
        {
          kind: 'p',
          text: 'The shell is involved only when you ask it to rearrange output. With `npm run dev > log.txt` or `npm run dev | grep error`, the child Zsh points standard output at the file or pipe after `fork()` and before `exec()`. The program still writes to "standard output" as usual, without knowing it now goes somewhere else.',
        },
      ],
    },
    {
      heading: 'Two windows, two independent shells',
      blocks: [
        {
          kind: 'p',
          text: 'Now open a second iTerm2 window and run `npm run dev` there too. Each window gets its own PTY and its own Zsh process, with its own process ID. Those two Zsh processes are separate instances of the program, not a shared shell. Each one then forks its own child for `npm`:',
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'iTerm2\n ├── zsh (PID 1001)  on /dev/ttys003\n │    └── npm run dev (PID 1003)\n └── zsh (PID 1002)  on /dev/ttys004\n      └── npm run dev (PID 1004)',
        },
        {
          kind: 'p',
          text: 'This tree is simplified. On a real Mac, iTerm2 places a small helper process and `login` between itself and each Zsh. And `npm run` does not run your script directly: it starts `sh -c "next dev"` (or whatever your script is), which starts another `node`. You can see the real chain with `pstree` (`brew install pstree`), or with:',
        },
        {
          kind: 'code',
          lang: 'sh',
          code: 'ps -o pid,ppid,tty,command -t ttys003',
        },
        {
          kind: 'p',
          text: "The `PPID` column is each process's parent, so you can follow the tree up from your dev server to the shell that started it.",
        },
        {
          kind: 'heading',
          text: 'Copies, not shared state',
        },
        {
          kind: 'p',
          text: "The kernel gives every process its own private memory space, and a child receives a **copy** of its parent's state at the moment of `fork()`. Nothing stays linked after that. Several everyday behaviors follow from this:",
        },
        {
          kind: 'list',
          items: [
            'Running `cd src` or `export API_URL=...` in window A changes only that Zsh process. Window B is a different process and never sees it.',
            "A child cannot change its parent. That is why `cd` must be a shell builtin: if it ran as a separate program, it would change the child's directory and then exit, leaving the shell where it was. It is also why running a script that calls `cd` or `export` does nothing to your prompt, while `source script.sh` does, because `source` runs the lines inside the current shell.",
            'Environment variables flow only downward, and only at start time. If you `export` a variable after starting the dev server, the running server does not see it. Restart the server from that shell to pick it up.',
          ],
        },
      ],
    },
    {
      heading: 'Where separate processes still collide',
      blocks: [
        {
          kind: 'p',
          text: 'Separate memory does not mean separate everything. Both processes still run on the same machine, and they share its resources: the filesystem, the network ports, and the CPU and RAM.',
        },
        {
          kind: 'p',
          text: 'The most common collision is a port. Only one process can listen on `localhost:3000` at a time, so the second dev server fails with `EADDRINUSE`. Some tools, including Next.js, detect this and move to `3001`. Others exit. To find the process holding a port:',
        },
        {
          kind: 'code',
          lang: 'sh',
          code: 'lsof -i :3000',
        },
        {
          kind: 'p',
          text: 'The same applies to files. Two processes writing the same build output directory or a SQLite database can step on each other, because the filesystem is shared even though their memory is not.',
        },
      ],
    },
  ],
  takeaways: [
    'The terminal draws text and captures keystrokes. The shell interprets commands. The kernel runs programs. They are three separate things.',
    'A terminal talks to its programs through a pseudo-terminal (PTY), and each window or tab gets its own.',
    'Bash and Zsh are two shells with a shared core syntax. macOS defaults to Zsh because it will not ship GPLv3 Bash.',
    'To run a command, the shell calls `fork()` to create a copy of itself, then the copy calls `exec()` to become the program. The shell waits until it exits.',
    'The running program reads and writes the PTY directly. The shell does not relay its output.',
    "Every process has private memory and inherits a copy of its parent's environment and directory. Changes never flow back up or across to other windows.",
  ],
  goDeeper: [
    {
      label: 'The TTY demystified',
      url: 'https://www.linusakesson.net/programming/tty/',
    },
    {
      label: 'fork(2) manual page',
      url: 'https://man7.org/linux/man-pages/man2/fork.2.html',
    },
    {
      label: 'execve(2) manual page',
      url: 'https://man7.org/linux/man-pages/man2/execve.2.html',
    },
    {
      label: 'Zsh startup files',
      url: 'https://zsh.sourceforge.io/Intro/intro_3.html',
    },
    {
      label: 'Bash reference manual',
      url: 'https://www.gnu.org/software/bash/manual/bash.html',
    },
  ],
}
