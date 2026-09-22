import type { Lesson } from '../types'

// Content source: docs/elixir-guides/elixir-for-rubyists.md
export const elixirForRubyists: Lesson = {
  slug: 'elixir-for-rubyists',
  title: 'Elixir for Ruby Developers',
  tagline: 'A crash course that starts from the Ruby you already know.',
  intro:
    'You already know Ruby. This guide leans on that: every concept is framed as "here is the Ruby you know, here is what changes."\n\nElixir was created by José Valim, a Rails core alumnus. The syntax is deliberately Ruby-flavoured — `do...end`, `?` and `!` suffixes, `Enum` reading like `Enumerable`. That familiarity is a ramp, and occasionally a trap: the syntax is Ruby, the semantics are Erlang.',
  minutes: 25,
  sections: [
    {
      heading: '1. The three things that actually change',
      blocks: [
        {
          kind: 'p',
          text: 'Before syntax, internalise these. Everything else follows.',
        },
        {
          kind: 'p',
          text: '**1. Data is immutable.** There is no mutation. `List.delete(list, 1)` returns a new list; `list` is unchanged. No `map!`, no `<<`, no in-place anything. This sounds restrictive and is in practice liberating — no defensive `.dup`, no spooky action at a distance, no thread-safety anxiety.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Is copying everything not ruinously slow?',
          text: 'It would be, so it does not happen. `%{m | age: 37}` builds a new map that *shares* every unchanged part with the old one. Sharing is only safe because nothing can be mutated — so the runtime shares aggressively. Immutability is what buys the cheap copy, not what costs it.',
        },
        {
          kind: 'p',
          text: '**2. There are no objects.** No classes, no instance state, no inheritance, no `self` holding data. You have *modules* (namespaces for functions) and *data* (maps, lists, tuples, structs). Behaviour and state are separate. `user.name` is not a method call on an object; it is a field lookup on a map — there is nothing to override, so nothing to look up a chain for.',
        },
        {
          kind: 'p',
          text: '**3. Concurrency is the point.** Ruby has threads bolted on and a GIL. Elixir runs on the BEAM VM, where spawning a process costs microseconds and a few KB. Processes share nothing and communicate by message. A web server running 100k concurrent connections on one box is unremarkable. Failure handling is built around this ("let it crash", supervisors).',
        },
        {
          kind: 'p',
          text: 'These are not three facts, they are one design. Ruby needs a GIL *because* its objects are mutable and shared. Take mutation away and the whole problem evaporates: nothing to lock, nothing to copy defensively, and each process can garbage-collect its own few KB alone (which is why the BEAM has no stop-the-world pause). Immutability is the price of admission for cheap concurrency, and cheap concurrency is what the rest of the language is arranged around.',
        },
      ],
    },
    {
      heading: '2. Setup',
      blocks: [
        {
          kind: 'code',
          lang: 'bash',
          code: 'brew install elixir         # macOS\nelixir --version            # Elixir 1.18+, Erlang/OTP 27+\niex                         # the REPL, like irb',
        },
        {
          kind: 'p',
          text: 'In `iex`, `h Enum.map` gives docs, `i value` inspects a term, `recompile` reloads a Mix project. Ctrl-C twice to quit.',
        },
        {
          kind: 'p',
          text: 'Mix is Bundler + Rake + `rails new` in one binary:',
        },
        {
          kind: 'code',
          lang: 'bash',
          code: 'mix new my_app          # generate a project\ncd my_app\nmix deps.get            # bundle install\nmix test                # run tests\nmix run -e "IO.puts 1"  # ruby -e\niex -S mix              # irb with your app loaded (you will use this constantly)',
        },
      ],
    },
    {
      heading: '3. Syntax speedrun',
      blocks: [
        { kind: 'heading', text: 'Values' },
        {
          kind: 'code',
          lang: 'elixir',
          code: '42                    # integer, arbitrary precision like Ruby\n3.14                  # float\n:ok                   # atom — this is Ruby\'s :symbol\n"hello"               # binary/UTF-8 string\n~c"hello"             # charlist — a LIST of codepoints. Not a string. Erlang interop only.\ntrue                  # actually the atom :true\nnil                   # actually the atom :nil\n[1, 2, 3]             # list — a LINKED list, not an array\n{1, 2, 3}             # tuple — contiguous, fixed size, O(1) access\n%{a: 1, "b" => 2}     # map — Ruby\'s Hash',
        },
        {
          kind: 'p',
          text: 'Three things to internalise:',
        },
        {
          kind: 'list',
          items: [
            '**Atoms are interned, not strings.** `:ok` is a pointer into a global table, so comparing atoms is one pointer check rather than a character walk. That is *why* the whole language returns tagged tuples like `{:ok, value}` — the tag is free. Module names are atoms too: `String` is literally the atom `:"Elixir.String"`, which is why you can write `apply(String, :upcase, ["a"])`.',
            '**Lists are linked lists** — and immutability is why. A list is `[head | tail]` all the way down. Since nobody can ever mutate a tail, prepending is free: the new cell just points at the existing list, which stays valid for everyone still holding it. Appending has no such trick, so `[x | list]` is O(1) while `list ++ [x]` and `length(list)` are O(n). Build backwards and `Enum.reverse/1`, or just use `Enum.map` and stop thinking about it.',
            '**Only `nil` and `false` are falsy.** Same as Ruby. `0` and `""` are truthy. Good.',
          ],
        },
        { kind: 'heading', text: 'Strings' },
        {
          kind: 'code',
          lang: 'elixir',
          code: '"hello" <> " world"           # concatenation (not +)\n"Hi #{name}"                  # interpolation, same as Ruby\n"""\nheredoc\n"""\nString.upcase("abc")          # "ABC" — functions in a module, not methods\nString.split("a,b", ",")      # ["a", "b"]',
        },
        {
          kind: 'p',
          text: 'Strings are UTF-8 binaries. `String.length/1` is O(n) (grapheme-aware); `byte_size/1` is O(1).',
        },
        {
          kind: 'p',
          text: '`<>` is not just "`+` with a different spelling" — it is the binary constructor, so it works in patterns too:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '"Hello, " <> name = "Hello, Ada"     # name == "Ada"\ndef handle("GET " <> path), do: ...  # match on a prefix in a function head',
        },
        {
          kind: 'p',
          text: 'That is the first hint of the theme running through the whole language: the thing that builds a value is also the thing that takes it apart.',
        },
        { kind: 'heading', text: 'Operators worth noting' },
        {
          kind: 'table',
          headers: ['Ruby', 'Elixir', 'Note'],
          rows: [
            ['`==`', '`==`', '`1 == 1.0` is **true**'],
            ['`equal?`', '`===`', 'strict; `1 === 1.0` is false'],
            ['`&&`, `||`, `!`', '`&&`, `||`, `!`', 'truthy-based'],
            ['—', '`and`, `or`, `not`', 'require actual booleans; usable in guards'],
            ['`+` on strings', '`<>`', '`+` is numbers only, always'],
            ['`<<`', '`++` / `[h | t]`', 'no mutation'],
          ],
        },
      ],
    },
    {
      heading: '4. Functions and modules',
      blocks: [
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule Math do\n  @moduledoc "Arithmetic helpers."\n\n  @doc "Adds two numbers."\n  def add(a, b), do: a + b        # one-liner form\n\n  def double(n) do                # block form\n    n * 2\n  end\n\n  defp secret, do: 42             # defp = private\nend\n\nMath.add(1, 2)',
        },
        {
          kind: 'p',
          text: '**Arity is part of the identity.** `add/2` and `add/3` are *different functions* — not overloads of one name, genuinely unrelated as far as the compiler is concerned. You will see `Enum.map/2` in docs; the `/2` is the argument count, and you must include it when referencing a function.',
        },
        {
          kind: 'p',
          text: '**The last expression is the return value.** There is no `return` statement at all. None. This is survivable because *everything* is an expression that evaluates to something — `if`, `case`, `cond`, `with`, even `try`. Ruby technically works this way too; Elixir makes you actually rely on it. Instead of jumping out of a function early, you arrange for the right value to flow out the bottom.',
        },
        {
          kind: 'p',
          text: '**Default arguments use `\\\\`:**',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def greet(name, greeting \\\\ "Hello"), do: "#{greeting}, #{name}!"',
        },
        {
          kind: 'p',
          text: 'That single line defines *two* functions, `greet/1` and `greet/2` — defaults are expanded into one function per arity at compile time. Which is why, when a function has several clauses, the defaults go on a bodiless header clause: they belong to the name, not to any one clause.',
        },
        {
          kind: 'p',
          text: '**Anonymous functions need a dot to call:**',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'add = fn a, b -> a + b end\nadd.(1, 2)              # the dot is required and non-negotiable\n\ndouble = &(&1 * 2)      # capture shorthand; &1 is the first arg\ndouble.(21)\n\n&String.upcase/1        # capture a named function by name/arity\nEnum.map(["a"], &String.upcase/1)',
        },
        {
          kind: 'p',
          text: "`&(&1 * 2)` is roughly Ruby's `{ |x| x * 2 }` / `_1` shorthand. `&String.upcase/1` is roughly `&:upcase`.",
        },
        {
          kind: 'p',
          text: 'The dot is not fussiness. Variables and functions live in **separate namespaces**: if a module defines `add/2` and you also bind a variable `add`, then `add(1, 2)` calls the function and `add.(1, 2)` calls the variable. The dot tells the compiler which one you mean, with no ambiguity and no lookup rules to memorise.',
        },
      ],
    },
    {
      heading: '5. Pattern matching — the big one',
      blocks: [
        {
          kind: 'p',
          text: '`=` is **not assignment**. It is the *match operator*. It asserts that the left side describes the right side, binding variables along the way.',
        },
        {
          kind: 'p',
          text: 'Read it the way you read `=` in algebra — a claim that the two sides are the same — plus one rule: **an unbound variable matches anything, and stays bound to whatever it matched.**',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'x = 1          # matches; x was unbound, so it takes the value 1\n1 = x          # matches! this is legal and does nothing\n2 = x          # ** (MatchError) no match of right hand side value: 1',
        },
        {
          kind: 'p',
          text: 'So `x = 1` is not a special "assignment" case — it is the ordinary case, with the binding falling out as a side effect. And `2 = x` is not nonsense: it is an assertion that blows up when violated.',
        },
        {
          kind: 'p',
          text: 'This becomes powerful for destructuring:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '{:ok, result} = {:ok, 42}            # result == 42\n[first | rest] = [1, 2, 3]           # first == 1, rest == [2, 3]\n%{name: n} = %{name: "Ada", age: 36} # n == "Ada"; partial match is fine for maps\n{a, b} = {b, a}                      # this DOES swap — the right side is built first',
        },
        {
          kind: 'p',
          text: 'Note the asymmetry in the map example: the pattern `%{name: n}` matches a map with *more* keys than it mentions. Patterns describe "at least this shape", not "exactly this shape" — which is what makes them usable against real-world data you do not fully control. Lists and tuples are the opposite: they must match exactly.',
        },
        {
          kind: 'p',
          text: "Use `^` (pin) to match against a variable's current value instead of rebinding:",
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'expected = 200\n^expected = response.status    # assert equality, crash if not',
        },
        {
          kind: 'p',
          text: 'The default is rebinding, always — a bare variable on the left is a slot to fill, never a comparison. `^` is how you say "use this variable\'s *value* as part of the pattern." You will meet it again in Ecto queries, for the same reason.',
        },
        { kind: 'heading', text: 'Matching in function heads' },
        {
          kind: 'p',
          text: "This replaces most conditionals and much of Ruby's polymorphism:",
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule Greeter do\n  def greet(%{name: name, role: :admin}), do: "Welcome back, Admin #{name}"\n  def greet(%{name: name}), do: "Hello, #{name}"\n  def greet(_), do: "Hello, stranger"\nend',
        },
        {
          kind: 'p',
          text: 'Clauses are tried top to bottom, and the first that matches wins. This is the idiomatic replacement for `if`/`case` chains *and* for duck typing. Put specific clauses first.',
        },
        {
          kind: 'p',
          text: 'Look at what that one function is doing at once: branching, destructuring `name` out, and checking the shape of the input. In Ruby you would need a conditional, a field access, and probably a `respond_to?` or a subclass. Elixir dispatches on *the shape of the data* with no type hierarchy anywhere — which is why the language has no `abstract`, no `super`, and no `method_missing`, and does not seem to miss them.',
        },
        { kind: 'heading', text: 'Guards' },
        {
          kind: 'p',
          text: 'Add conditions with `when`. Only a restricted set of functions is allowed — guards must be side-effect free and fast:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def classify(n) when is_integer(n) and n < 0, do: :negative\ndef classify(0), do: :zero\ndef classify(n) when is_integer(n), do: :positive\ndef classify(_), do: :not_a_number',
        },
        {
          kind: 'p',
          text: 'Common guards: `is_atom/1`, `is_binary/1`, `is_integer/1`, `is_list/1`, `is_map/1`, `is_nil/1`, comparison operators, `in`, `and`/`or`/`not`, `length/1`, `map_size/1`, `byte_size/1`.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'A guard that raises does not raise',
          text: "It just fails the match. `def f(x) when x.age > 18` called with an atom, or with a map that has no `:age`, does not explode; the clause simply does not apply and the next one is tried. That is a feature when you want a fallback clause, and a genuine trap when a typo'd guard silently routes everything to your catch-all. If a clause is mysteriously never chosen, suspect the guard.",
        },
        { kind: 'heading', text: 'One mechanism, everywhere' },
        {
          kind: 'p',
          text: 'This is the point to stop and notice: there is only *one* matching engine, and you have now seen most of the places it shows up. `=`, function heads, `case` clauses, `fn` clauses, `with` arrows, `for` generators, `receive` patterns, `rescue` clauses — all the same thing wearing different syntax.',
        },
        {
          kind: 'p',
          text: 'That is why Elixir has so few control-flow constructs compared to what it can express, and why dense-looking Elixir usually is not clever: a single line is doing four jobs at once that Ruby would spread over four lines — checking a type, branching on a value, pulling fields out, and naming them. Learn matching properly and roughly half the language stops looking like separate features to memorise.',
        },
      ],
    },
    {
      heading: '6. Control flow',
      blocks: [
        { kind: 'heading', text: '`case` — match a value against patterns' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'case File.read("config.json") do\n  {:ok, contents} -> parse(contents)\n  {:error, :enoent} -> default_config()\n  {:error, reason} -> raise "boom: #{inspect(reason)}"\nend',
        },
        { kind: 'heading', text: "`cond` — Ruby's `if/elsif/else`" },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'cond do\n  score > 90 -> :a\n  score > 80 -> :b\n  true -> :f          # `true` is the else branch\nend',
        },
        {
          kind: 'p',
          text: '`true ->` is not a keyword, it is just a condition that is always truthy. Leave it out and a value matching nothing raises `CondClauseError` — which is often what you want, since it is a loud complaint about a case you did not consider rather than a silent `nil`.',
        },
        { kind: 'heading', text: '`if` / `unless`' },
        {
          kind: 'p',
          text: 'They exist, they are macros, they return values. Use them for genuinely binary checks; reach for pattern matching otherwise.',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'status = if user.active, do: :on, else: :off',
        },
        {
          kind: 'p',
          text: 'Note `user.active`, not `user.active?` — that trailing `?` is a Ruby reflex worth unlearning here. `?` is legal in *function* names (`String.valid?/1`), but a struct field is just a key, and `user.active?` would look for a key literally named `:active?` and raise when it is not there.',
        },
        {
          kind: 'p',
          text: 'There is no `elsif`. That is `cond`.',
        },
        { kind: 'heading', text: '`with` — the happy-path pipeline' },
        {
          kind: 'p',
          text: 'This one has no Ruby equivalent and you will miss it when you go back. It chains matches, bailing out on the first mismatch:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'with {:ok, user} <- fetch_user(id),\n     {:ok, account} <- fetch_account(user),\n     :ok <- verify_balance(account, amount) do\n  {:ok, charge(account, amount)}\nelse\n  {:error, :not_found} -> {:error, "no such user"}\n  {:error, reason} -> {:error, reason}\nend',
        },
        {
          kind: 'p',
          text: 'Here is the shape to hold on to: **`with` is a `case` that does not nest.** Written out longhand, the above is a `case` inside a `case` inside a `case`, marching off the right edge of the screen. `with` flattens that staircase into a list.',
        },
        {
          kind: 'p',
          text: 'And each `<-` reads as "this must match, or we are done." When one does not match, *the value that failed* becomes the result of the whole `with`, skipping every remaining step. That is the early return you were told you could not have; it just went in the language instead of in your fingers.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Two things to know before you trust it',
          text: 'The `else` is optional, and without one the unmatched value is returned as-is. And a clause written with `=` instead of `<-` is an ordinary match — it cannot bail out, it raises. Use `=` deliberately for steps that must not fail.',
        },
      ],
    },
    {
      heading: '7. The pipe operator',
      blocks: [
        {
          kind: 'p',
          text: '`|>` passes the left value as the **first argument** to the right function.',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: '# Ruby\nusers.select(&:active?).map(&:name).sort.take(10)',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '# Elixir\nusers\n|> Enum.filter(& &1.active)\n|> Enum.map(& &1.name)\n|> Enum.sort()\n|> Enum.take(10)',
        },
        {
          kind: 'p',
          text: 'Ruby chains methods on objects; Elixir pipes data through functions. This is why every stdlib function takes its subject first — `Enum.map(list, fun)`, `String.split(str, sep)`, `Map.get(map, key)`. That convention exists *for* the pipe.',
        },
        {
          kind: 'p',
          text: 'The whole thing is textual: `a |> f(b)` compiles to exactly `f(a, b)`, and that is the entire feature. There is no receiver, no chaining protocol, nothing an object has to opt into. Which means it works with your functions on day one, and also explains its one real limitation — if the value you are threading is not the first argument, the pipe cannot help you (reach for an anonymous function or `then/2`).',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Start pipes with a plain value',
          text: 'Prefer `value |> foo() |> bar()` over `foo() |> bar()`.',
        },
      ],
    },
    {
      heading: '8. Collections: Enum and Stream',
      blocks: [
        {
          kind: 'p',
          text: '`Enum` is your `Enumerable`. It works on lists, maps, ranges, and anything implementing the protocol. It is **eager** — every step builds a full intermediate collection.',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'Enum.map([1,2,3], &(&1 * 2))              # [2, 4, 6]\nEnum.filter(1..10, &(rem(&1, 2) == 0))    # [2, 4, 6, 8, 10]\nEnum.reduce([1,2,3], 0, &+/2)             # 6 — reduce is inject\nEnum.reduce(list, %{}, fn x, acc -> Map.put(acc, x, true) end)\nEnum.group_by(words, &String.length/1)\nEnum.sort_by(users, & &1.age, :desc)\nEnum.into(list, %{})                      # like to_h\nEnum.at(list, 3)                          # O(n) on lists!',
        },
        {
          kind: 'p',
          text: '`Enum.reduce/3` is the one that actually matters: every other function here is a convenience built on it. When you cannot find the function you want, that is not a gap in the stdlib — write the reduce. And note `Enum` hands you `{key, value}` tuples when you enumerate a map, which is the whole explanation for `for {k, v} <- map` and `Enum.into(list_of_pairs, %{})`.',
        },
        {
          kind: 'p',
          text: '`Stream` is the lazy version — same API, composes into a single pass, only runs when an `Enum` function terminates it:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '1..1_000_000\n|> Stream.map(&(&1 * 2))\n|> Stream.filter(&(rem(&1, 3) == 0))\n|> Enum.take(5)          # only computes what it needs',
        },
        {
          kind: 'p',
          text: 'The difference is what the intermediate steps *are*. `Enum.map` hands back a list; `Stream.map` hands back a struct describing work not yet done — inspect one and you will literally see `#Stream<[enum: 1..3, funs: [...]]>`. Nothing runs until an `Enum` function asks for values, and then each element flows through every step in one pass. The example above touches maybe 15 numbers, not a million.',
        },
        {
          kind: 'p',
          text: 'Rule of thumb: `Enum` by default, `Stream` for large, infinite, or IO-bound sequences.',
        },
        { kind: 'heading', text: 'Comprehensions' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'for x <- 1..5, rem(x, 2) == 1, do: x * x     # [1, 9, 25]\nfor x <- [1,2], y <- [:a,:b], do: {x, y}     # cartesian product\nfor {k, v} <- map, into: %{}, do: {k, String.upcase(v)}',
        },
        {
          kind: 'p',
          text: 'Filters go inline after the generator. `into:` controls the result type.',
        },
      ],
    },
    {
      heading: '9. Maps, keyword lists, and structs',
      blocks: [
        { kind: 'heading', text: 'Maps — your default key-value store' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'm = %{name: "Ada", age: 36}      # atom keys, shorthand\nm.name                           # "Ada" — raises if key missing\nm[:name]                         # "Ada" — nil if missing\nMap.get(m, :email, "none")       # with default\n%{m | age: 37}                   # update EXISTING key; raises if absent\nMap.put(m, :email, "a@b.c")      # put/insert\nMap.delete(m, :age)',
        },
        {
          kind: 'p',
          text: 'Note the two access styles: `.key` is strict (raises on missing), `[:key]` is lenient (returns `nil`). Pick strict when the key must be there — it fails loudly at the source instead of propagating `nil` three layers away from the bug.',
        },
        {
          kind: 'p',
          text: '`.key` also only works with atom keys, which turns out to be a useful signal rather than a limitation: atom keys mean "a shape my code defines and controls", string keys mean "data that came from outside" (JSON bodies, form params). When you see `params["email"]`, you are looking at untrusted input; when you see `user.email`, you are looking at something your own code built.',
        },
        { kind: 'heading', text: 'Keyword lists — for options' },
        {
          kind: 'code',
          lang: 'elixir',
          code: '[color: :red, size: 10]           # sugar for [{:color, :red}, {:size, 10}]',
        },
        {
          kind: 'p',
          text: 'An ordered list of 2-tuples with atom keys, allowing duplicates. This is Ruby\'s "options hash as last argument" role, and gets the same trailing-argument sugar:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'String.split("a1b2", ~r/\\d/, trim: true)',
        },
        {
          kind: 'p',
          text: 'Use `Keyword.get/3` to read them. Maps for data, keyword lists for options.',
        },
        {
          kind: 'p',
          text: 'Now the payoff, which retroactively explains a lot of syntax you have already seen: **`do ... end` is keyword-list sugar.** These two compile to the identical AST:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'if x, do: 1, else: 2\nif x do 1 else 2 end       # => if(x, [do: 1, else: 2])',
        },
        {
          kind: 'p',
          text: '`if` is not a keyword — it is a macro taking two arguments, the second being a keyword list that happens to have a prettier spelling. Same for `case`, `for`, `defmodule`, and `def`. Elixir has strikingly little special syntax; it has function calls, keyword lists, and macros, arranged to look like syntax.',
        },
        { kind: 'heading', text: 'Structs — the closest thing to a class' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule User do\n  @enforce_keys [:name]\n  defstruct [:name, :email, age: 0, active: true]\n\n  def adult?(%User{age: age}), do: age >= 18\nend\n\nu = %User{name: "Ada"}            # %User{name: "Ada", email: nil, age: 0, active: true}\nu.name\n%User{u | age: 36}                # update\nUser.adult?(u)                    # functions live in the module, take the struct',
        },
        {
          kind: 'p',
          text: 'A struct is a map with a `__struct__` key and a fixed set of fields. Not "like a map" — it *is* a map, and `%User{name: n}` in a pattern is plain map matching that also checks `__struct__: User`. That one key is doing all the work: compile-time field checking, type-based pattern matching (`def handle(%User{}), do: ...`), and protocol dispatch all read it.',
        },
        {
          kind: 'p',
          text: 'This is where the mental shift bites hardest. In Ruby, `user.adult?` is a method on an object. In Elixir, `User.adult?(user)` is a function taking data. Same idea, inverted. Modules group functions that operate on a shape of data.',
        },
      ],
    },
    {
      heading: '10. Errors: tagged tuples over exceptions',
      blocks: [
        {
          kind: 'p',
          text: 'Ruby raises. Elixir returns. The dominant convention:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '{:ok, value}        # success\n{:error, reason}    # expected failure',
        },
        {
          kind: 'p',
          text: 'Worth being clear about: this is a *convention*, not a language feature. Nothing enforces it, no compiler checks it, `{:ok, x}` is an ordinary two-element tuple. It became universal because pattern matching makes it cost nothing to produce and nothing to consume — the tag is an atom, and `case`/`with` read it in one line. A convention this cheap does not need enforcement.',
        },
        {
          kind: 'p',
          text: "And the two-function convention you already recognise from Ruby's `!`:",
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'File.read("x.txt")     # {:ok, contents} | {:error, :enoent}\nFile.read!("x.txt")    # contents, or raises File.Error\nMap.fetch(m, :k)       # {:ok, v} | :error\nMap.fetch!(m, :k)      # v, or raises',
        },
        {
          kind: 'p',
          text: 'Use `!` versions when a failure is a bug and should crash. Use tuple versions for failures you will actually handle — then `case` or `with` on the result.',
        },
        {
          kind: 'p',
          text: 'Exceptions exist and are for *exceptional* things:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'raise ArgumentError, "bad input"\nraise "quick and dirty"\n\ntry do\n  risky()\nrescue\n  e in ArgumentError -> {:error, e.message}\nafter\n  cleanup()\nend',
        },
        {
          kind: 'p',
          text: 'But `try/rescue` is rare in idiomatic code. Which brings us to the reason why.',
        },
      ],
    },
    {
      heading: '11. Processes and "let it crash"',
      blocks: [
        {
          kind: 'p',
          text: 'A BEAM process is not an OS thread and not a Ruby thread. It is a lightweight, isolated, independently garbage-collected unit — a few KB, microseconds to spawn, millions per node. No shared memory, ever. Communication is by message passing only.',
        },
        {
          kind: 'p',
          text: "If you want the Ruby analogy: **a process is the closest thing Elixir has to an object.** Identity (a pid), private state nobody else can reach, and an interface that is nothing but messages. It fits Alan Kay's original description of OO more literally than Ruby's objects do. The difference is what you spend them on — you do not reach for a process to model every noun in the domain, only when you need state that persists over time, or work that happens concurrently.",
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'pid = spawn(fn -> IO.puts("hi from #{inspect(self())}") end)\n\nsend(pid, {:hello, self()})\n\nreceive do\n  {:hello, from} -> IO.puts("got hello from #{inspect(from)}")\nafter\n  1_000 -> IO.puts("timeout")\nend',
        },
        {
          kind: 'p',
          text: 'You will rarely write raw `spawn`/`receive`. You will use OTP abstractions built on top.',
        },
        { kind: 'heading', text: 'Task — fire-and-forget or parallel work' },
        {
          kind: 'code',
          lang: 'elixir',
          code: '# Parallel HTTP calls — actually parallel, no GIL\nurls\n|> Task.async_stream(&fetch/1, max_concurrency: 20, timeout: 30_000)\n|> Enum.to_list()\n\nt = Task.async(fn -> expensive() end)\nother_work()\nTask.await(t)',
        },
        {
          kind: 'p',
          text: 'This one utility replaces a lot of Ruby thread-pool ceremony.',
        },
        { kind: 'heading', text: 'GenServer — stateful server process' },
        {
          kind: 'p',
          text: 'The workhorse. Before the boilerplate, here is the entire idea, with no OTP in it:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def loop(state) do\n  receive do\n    msg -> loop(handle(msg, state))\n  end\nend',
        },
        {
          kind: 'p',
          text: 'A process that receives a message, computes a new state, and calls itself with it. That is a GenServer. Everything `use GenServer` adds is bookkeeping around that loop — timeouts, replies, shutdown, debugging hooks.',
        },
        {
          kind: 'p',
          text: 'Keep that picture while reading the code below: `handle_cast/2` and `handle_call/3` are the *body* of that loop, and the state you return in `{:noreply, state + 1}` **is the argument to the next iteration**. This is how Elixir gets mutable state out of immutable data. Nothing was ever modified; the loop just went around again holding a different value.',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: "defmodule Counter do\n  use GenServer\n\n  # --- Client API (runs in the CALLER's process) ---\n  def start_link(initial \\\\ 0),\n    do: GenServer.start_link(__MODULE__, initial, name: __MODULE__)\n\n  def increment, do: GenServer.cast(__MODULE__, :increment)   # async, no reply\n  def value, do: GenServer.call(__MODULE__, :value)           # sync, waits for reply\n\n  # --- Server callbacks (run in the SERVER process) ---\n  @impl true\n  def init(initial), do: {:ok, initial}\n\n  @impl true\n  def handle_cast(:increment, state), do: {:noreply, state + 1}\n\n  @impl true\n  def handle_call(:value, _from, state), do: {:reply, state, state}\nend",
        },
        {
          kind: 'p',
          text: "Keep the client/server split in your head — it is the single most common source of confusion. `increment/0` and `value/0` run in *your* process and do nothing but send a message; `handle_cast/2` and `handle_call/3` run over in the counter's process. The two halves live in one file for readability, not because they execute together.",
        },
        {
          kind: 'p',
          text: 'That split is the whole safety story. The server handles one message at a time, to completion, so its state can never be observed half-updated — no locks, no mutexes, no atomics, because there is only ever one thing touching that state. The flip side: a slow `handle_call` blocks every other caller in the queue. Serialisation is both the guarantee and the bottleneck.',
        },
        {
          kind: 'p',
          text: 'And `call` vs `cast` is exactly "do I need an answer": `call` sends and then blocks waiting for a reply (5 seconds by default, then it raises — that is the timeout you will eventually meet in production), `cast` sends and immediately moves on, with no way to know whether anything happened.',
        },
        { kind: 'heading', text: 'Supervisors and "let it crash"' },
        {
          kind: 'p',
          text: 'Instead of defensive `rescue` everywhere, you let a process die on unexpected input and have a supervisor restart it in a known-good state.',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'children = [\n  {Counter, 0},\n  {MyApp.Repo, []},\n  {Task.Supervisor, name: MyApp.TaskSupervisor}\n]\n\nSupervisor.start_link(children, strategy: :one_for_one)',
        },
        {
          kind: 'p',
          text: 'Strategies: `:one_for_one` (restart just the dead child), `:one_for_all` (restart all), `:rest_for_one` (restart it and everything started after it).',
        },
        {
          kind: 'p',
          text: 'The philosophy: you cannot anticipate every failure, and code that tries becomes a thicket of error handling that is itself buggy. So handle the failures you *expect* (tagged tuples) and let the rest crash a small, isolated process that gets restarted clean. Errors stay contained — one crashed request handler does not take down the server.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: '"Let it crash" is narrower than it sounds',
          text: 'It does not mean "do not handle errors". It means **do not write handling for failures you did not predict**, because a fresh process in a known-good state is a better recovery than code guessing at a situation its author never imagined. That works precisely because `init/1` can rebuild the state from something durable. If a restart would come back into the same broken state, or would lose data nobody else has, the supervisor is not saving you — and that is a design problem, not an error-handling one.',
        },
      ],
    },
    {
      heading: '12. Protocols and behaviours',
      blocks: [
        {
          kind: 'p',
          text: 'Two forms of polymorphism, both replacing things Ruby does with inheritance and mixins.',
        },
        {
          kind: 'p',
          text: "**Protocols** dispatch on data type. This is Ruby's duck typing, made explicit.",
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defprotocol Describable do\n  def describe(value)\nend\n\ndefimpl Describable, for: User do\n  def describe(u), do: "User #{u.name}"\nend\n\ndefimpl Describable, for: List do\n  def describe(l), do: "#{length(l)} items"\nend',
        },
        {
          kind: 'p',
          text: 'You can implement a protocol for a type you do not own — that is the `String.Chars` / `Inspect` / `Enumerable` mechanism. Implementing `String.Chars` is how a struct becomes interpolatable; `Inspect` controls `IO.inspect` output, and is how you redact passwords in logs.',
        },
        {
          kind: 'p',
          text: '**Behaviours** are an interface contract. Like a Ruby module of required methods, but compiler-checked.',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule Parser do\n  @callback parse(String.t()) :: {:ok, term} | {:error, String.t()}\nend\n\ndefmodule JSONParser do\n  @behaviour Parser\n  @impl true\n  def parse(s), do: {:ok, decode(s)}\nend',
        },
        {
          kind: 'p',
          text: '`GenServer`, `Supervisor`, and Phoenix controllers are all behaviours.',
        },
        {
          kind: 'p',
          text: 'The one-line distinction worth memorising: **a protocol dispatches on the type of the data; a behaviour constrains a module.** "What can be done to this value" versus "what this module promises to provide." Protocols are polymorphism at runtime, behaviours are a contract at compile time.',
        },
        { kind: 'heading', text: '`use`, `import`, `alias`, `require`' },
        {
          kind: 'code',
          lang: 'elixir',
          code: "alias MyApp.Accounts.User        # now write `User` instead of the full path\nimport Enum, only: [map: 2]      # call map/2 unqualified — use sparingly\nrequire Logger                   # needed before calling a module's macros\nuse GenServer                    # runs the module's __using__ macro — injects code",
        },
        {
          kind: 'p',
          text: '`use` is the metaprogramming hook — roughly Ruby\'s `include` + `extend` + `included do ... end` in one. It is also less magical than it looks: `use Foo, opts` expands to `require Foo; Foo.__using__(opts)`, and whatever AST that macro returns gets pasted into your module. That is the answer to "where did `child_spec/1` come from, and why does my GenServer work when I only defined two callbacks?" — `use GenServer` pasted in the defaults. You can read any of it with `Macro.expand_once`.',
        },
        {
          kind: 'p',
          text: '`alias` is the one you will type most.',
        },
      ],
    },
    {
      heading: '13. Testing',
      blocks: [
        {
          kind: 'p',
          text: 'ExUnit ships with the language. `mix test` runs it.',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MathTest do\n  use ExUnit.Case, async: true\n  doctest Math\n\n  describe "add/2" do\n    test "sums integers" do\n      assert Math.add(1, 2) == 3\n    end\n\n    test "returns error tuple on bad input" do\n      assert {:error, _} = Math.add(:a, 1)    # pattern match in the assert\n    end\n  end\nend',
        },
        {
          kind: 'p',
          text: 'Three things RSpec users should note:',
        },
        {
          kind: 'list',
          items: [
            '`assert` is a macro that introspects the expression — a failing `assert a == b` prints a real diff. You do not need a matcher library.',
            '`assert {:ok, x} = thing()` both asserts the shape *and* binds `x` for later assertions. Extremely handy.',
            '`async: true` runs test *modules* in parallel across cores. Free speedup when your tests do not share global state.',
          ],
        },
        {
          kind: 'p',
          text: 'Doctests are worth calling out: examples in your `@doc` strings get executed as tests. Documentation that cannot rot.',
        },
      ],
    },
    {
      heading: '14. The ecosystem',
      blocks: [
        {
          kind: 'table',
          headers: ['Ruby', 'Elixir'],
          rows: [
            ['Bundler + Rake', 'Mix'],
            ['RubyGems', 'Hex (`hex.pm`)'],
            ['Rails', 'Phoenix'],
            ['ActiveRecord', 'Ecto (not an ORM — a query/changeset library)'],
            ['RSpec / Minitest', 'ExUnit'],
            ['Sidekiq', 'Oban (or plain Tasks/GenServers)'],
            ['ActionCable', 'Phoenix Channels / LiveView'],
            ['Rubocop', 'Credo'],
            ['YARD', 'ExDoc (built in)'],
            ['Pry', '`IEx.pry`, `dbg/1`'],
            ['—', 'Dialyzer (static analysis of types)'],
          ],
        },
        {
          kind: 'p',
          text: '**Ecto is not ActiveRecord.** No callbacks, no `save`, no objects that persist themselves. You build a changeset (data + validations + cast rules), pass it to `Repo.insert/1`, and get `{:ok, struct}` or `{:error, changeset}`. Queries are composable data structures, not method chains on a class.',
        },
        {
          kind: 'p',
          text: 'The shift is the same one as everywhere else in this guide: ActiveRecord fuses three things into one object — the record, its validation rules, and its ability to persist itself. Ecto splits them into a struct, a changeset, and a repo, and makes you pass data between them. More typing, and a lot less wondering which callback fired. Expect this to be the biggest adjustment if you are coming from Rails.',
        },
        {
          kind: 'p',
          text: '**Phoenix LiveView** is the flagship. Server-rendered, stateful UI over a websocket, no JavaScript for most interactivity. Each connected user is a lightweight process holding their UI state. It is the thing that is hardest to replicate elsewhere because it depends entirely on cheap processes.',
        },
      ],
    },
    {
      heading: '15. Gotchas that will bite you',
      blocks: [
        {
          kind: 'list',
          items: [
            '**Rebinding is not mutation, and it does not escape a scope.** `x = 1; fn -> x = 2 end.(); x` is still `1`. The practical consequence bites daily: you cannot set a variable from inside an `if`, `case`, or `Enum.each`. Take the return value instead — `x = if flag, do: 1, else: 2`.',
            '**You cannot accumulate in a loop.** No `result = []` then push inside `Enum.each`. Use `Enum.map`/`reduce`. `Enum.each` is for side effects only and returns `:ok`.',
            '**`length/1` is O(n), `Enum.at/2` is O(n).** Indexing into a list is a code smell. Use maps or tuples for random access.',
            '**Atoms are never garbage collected.** Never do `String.to_atom(user_input)` — it is a memory-exhaustion vector. Use `String.to_existing_atom/1`.',
            '**`IO.inspect` returns its argument**, so you can drop it anywhere in a pipe: `|> IO.inspect(label: "after filter") |>`. `dbg/1` is even better — it prints each pipe step.',
            '**Charlists (`~c"abc"`) are not strings.** If output looks like `[104, 105]` or `~c"hi"`, an Erlang function handed you a charlist. `List.to_string/1` converts back.',
            '**A broken guard fails silently.** A clause that is never selected is usually a guard problem, not a pattern problem.',
            '**No early return.** If you are reaching for one, you want `with`, multiple function clauses, or `Enum.reduce_while`.',
            '**Struct update `%{s | k: v}` only updates existing keys.** Adding a new key to a struct that way raises. That is on purpose.',
            '**Compile time is real.** Macros and `use` run at compile time. Module attributes (`@config Application.get_env(...)`) are frozen at compile time — a classic config bug. Read runtime config at runtime.',
          ],
        },
      ],
    },
    {
      heading: '16. A worked example',
      blocks: [
        {
          kind: 'p',
          text: 'A small module pulling most of this together — fetch users, filter, summarise, with proper error handling:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule Reports.Cohort do\n  @moduledoc "Summarizes an active-user cohort."\n\n  defstruct [:count, :avg_age, :names]\n\n  @doc """\n  Builds a cohort summary from a list of user maps.\n\n      iex> Reports.Cohort.build([%{name: "Ada", age: 36, active: true}])\n      {:ok, %Reports.Cohort{count: 1, avg_age: 36.0, names: ["Ada"]}}\n  """\n  def build([]), do: {:error, :empty}\n\n  def build(users) when is_list(users) do\n    case Enum.filter(users, & &1.active) do\n      [] -> {:error, :no_active_users}\n      active -> {:ok, summarize(active)}\n    end\n  end\n\n  def build(_), do: {:error, :invalid_input}\n\n  defp summarize(users) do\n    %__MODULE__{\n      count: length(users),\n      avg_age: users |> Enum.map(& &1.age) |> average(),\n      names: users |> Enum.map(& &1.name) |> Enum.sort()\n    }\n  end\n\n  defp average(nums), do: Enum.sum(nums) / length(nums)\nend',
        },
        {
          kind: 'p',
          text: 'And consuming it:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'with {:ok, raw} <- File.read("users.json"),\n     {:ok, users} <- Jason.decode(raw, keys: :atoms),\n     {:ok, cohort} <- Reports.Cohort.build(users) do\n  IO.puts("#{cohort.count} active users, avg age #{cohort.avg_age}")\nelse\n  {:error, :enoent} -> IO.puts("no users file")\n  {:error, reason} -> IO.puts("failed: #{inspect(reason)}")\nend',
        },
        {
          kind: 'p',
          text: 'Read `build/1` as a specification rather than as code: the empty list is an error, a list of maps gets summarised, and *anything else* is invalid input. Three clauses, no conditionals, and the ordering is the logic — `build([])` has to come first because `[]` would also match `is_list`. (`%__MODULE__{}` is just `%Reports.Cohort{}` spelled so a rename cannot break it.)',
        },
        {
          kind: 'p',
          text: "Note what is absent: no `nil` checks, no nested `if`s, no `begin/rescue`, no mutation, and nowhere a value is modified after it is created. Each function declares the shapes it accepts and returns a tagged result, so the caller's `with` can thread them together without inspecting anything. That is the style — and if you can name the mechanism behind every line above, you have got the language.",
        },
      ],
    },
    {
      heading: '17. Where to go next',
      blocks: [
        {
          kind: 'list',
          ordered: true,
          items: [
            '**Do the official Getting Started guide** — it is genuinely good and takes an afternoon.',
            '**Read "Elixir in Action" (Saša Jurić)** — the best book for understanding *why* the BEAM works the way it does. Skip the beginner books if you are an experienced Rubyist.',
            '**Watch Saša Jurić\'s "The Soul of Erlang and Elixir"** (~35 min) — the live demo of fault tolerance that makes supervisors click.',
            '**Build something with Phoenix LiveView.** `mix phx.new demo --live`. It is the fastest way to feel what cheap processes buy you.',
            '**Turn on Dialyzer and Credo early** so you learn idioms as you go rather than unlearning habits later.',
          ],
        },
        {
          kind: 'p',
          text: 'The syntax will take a week. The functional data modelling will take a month. OTP and process design will take longer, and it is the part that is actually worth the trip.',
        },
      ],
    },
  ],
  takeaways: [
    'Immutability, no objects, and cheap processes are one design, not three facts — take mutation away and the GIL, the locks, and the defensive copies all stop being necessary.',
    '`=` is a match, not an assignment. One matching engine powers function heads, `case`, `with`, comprehensions, and `receive`, which is why the language needs so little control flow.',
    'Modules hold functions, data is passed in. `User.adult?(user)` replaces `user.adult?`, and `|>` exists because every stdlib function takes its subject first.',
    'Expected failures come back as `{:ok, value}` / `{:error, reason}` and get handled with `case` or `with`; unexpected ones crash a small process that a supervisor restarts clean.',
    "A GenServer is just a `receive` loop whose return value becomes the next iteration's state — mutable state built out of immutable data, serialised one message at a time.",
    'Protocols dispatch on the type of the data; behaviours constrain a module. Between them they replace inheritance and mixins.',
  ],
  goDeeper: [
    { label: 'Elixir — Getting Started guide', url: 'https://hexdocs.pm/elixir/introduction.html' },
    { label: 'Enum documentation', url: 'https://hexdocs.pm/elixir/Enum.html' },
    { label: 'GenServer documentation', url: 'https://hexdocs.pm/elixir/GenServer.html' },
    { label: 'Mix documentation', url: 'https://hexdocs.pm/mix/Mix.html' },
  ],
}
