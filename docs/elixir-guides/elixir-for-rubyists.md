# Elixir for Ruby Developers — A Crash Course

You already know Ruby. This guide leans on that: every concept is framed as "here's the Ruby you know, here's what changes."

Elixir was created by José Valim, a Rails core alumnus. The syntax is deliberately Ruby-flavored — `do...end`, `?` and `!` suffixes, `Enum` reading like `Enumerable`. That familiarity is a ramp, and occasionally a trap: the syntax is Ruby, the semantics are Erlang.

---

## 1. The Three Things That Actually Change

Before syntax, internalize these. Everything else follows.

**1. Data is immutable.** There is no mutation. `List.delete(list, 1)` returns a new list; `list` is unchanged. No `map!`, no `<<`, no in-place anything. This sounds restrictive and is in practice liberating — no defensive `.dup`, no spooky action at a distance, no thread-safety anxiety.

> The obvious objection: isn't copying everything ruinously slow? It would be, so it doesn't happen. `%{m | age: 37}` builds a new map that *shares* every unchanged part with the old one. Sharing is only safe because nothing can be mutated — so the runtime shares aggressively. Immutability is what buys the cheap copy, not what costs it.

**2. There are no objects.** No classes, no instance state, no inheritance, no `self` holding data. You have *modules* (namespaces for functions) and *data* (maps, lists, tuples, structs). Behavior and state are separate. `user.name` is not a method call on an object; it's a field lookup on a map — there is nothing to override, so nothing to look up a chain for.

**3. Concurrency is the point.** Ruby has threads bolted on and a GIL. Elixir runs on the BEAM VM, where spawning a process costs ~microseconds and a few KB. Processes share nothing and communicate by message. A web server running 100k concurrent connections on one box is unremarkable. Failure handling is built around this ("let it crash", supervisors).

These aren't three facts, they're one design. Ruby needs a GIL *because* its objects are mutable and shared. Take mutation away and the whole problem evaporates: nothing to lock, nothing to copy defensively, and each process can garbage-collect its own few KB alone (which is why the BEAM has no stop-the-world pause). Immutability is the price of admission for cheap concurrency, and cheap concurrency is what the rest of the language is arranged around.

---

## 2. Setup

```bash
brew install elixir         # macOS
elixir --version            # Elixir 1.18+, Erlang/OTP 27+
iex                         # the REPL, like irb
```

In `iex`, `h Enum.map` gives docs, `i value` inspects a term, `recompile` reloads a Mix project. Ctrl-C twice to quit.

Mix is Bundler + Rake + `rails new` in one binary:

```bash
mix new my_app          # generate a project
cd my_app
mix deps.get            # bundle install
mix test                # run tests
mix run -e "IO.puts 1"  # ruby -e
iex -S mix              # irb with your app loaded (you'll use this constantly)
```

---

## 3. Syntax Speedrun

### Values

```elixir
42                    # integer, arbitrary precision like Ruby
3.14                  # float
:ok                   # atom — this is Ruby's :symbol
"hello"               # binary/UTF-8 string
~c"hello"             # charlist — a LIST of codepoints. Not a string. Erlang interop only.
true                  # actually the atom :true
nil                   # actually the atom :nil
[1, 2, 3]             # list — a LINKED list, not an array
{1, 2, 3}             # tuple — contiguous, fixed size, O(1) access
%{a: 1, "b" => 2}     # map — Ruby's Hash
```

Three things to internalize:

- **Atoms are interned, not strings.** `:ok` is a pointer into a global table, so comparing atoms is one pointer check rather than a character walk. That's *why* the whole language returns tagged tuples like `{:ok, value}` — the tag is free. (Module names are atoms too: `String` is literally the atom `:"Elixir.String"`. That's why you can write `apply(String, :upcase, ["a"])`.)
- **Lists are linked lists** — and immutability is why. A list is `[head | tail]` all the way down. Since nobody can ever mutate a tail, prepending is free: the new cell just points at the existing list, which stays valid for everyone still holding it. Appending has no such trick — the last cell has to point somewhere new, so every cell before it must be rebuilt. Hence `[x | list]` is O(1), `list ++ [x]` and `length(list)` are O(n). Build backwards and `Enum.reverse/1`, or just use `Enum.map` and stop thinking about it. Tuples for fixed-size records, lists for sequences you iterate.
- **Only `nil` and `false` are falsy.** Same as Ruby. `0` and `""` are truthy. Good.

### Strings

```elixir
"hello" <> " world"           # concatenation (not +)
"Hi #{name}"                  # interpolation, same as Ruby
"""
heredoc
"""
String.upcase("abc")          # "ABC" — functions in a module, not methods
String.split("a,b", ",")      # ["a", "b"]
```

Strings are UTF-8 binaries. `String.length/1` is O(n) (grapheme-aware); `byte_size/1` is O(1).

`<>` isn't just "`+` with a different spelling" — it's the binary constructor, so it works in patterns too:

```elixir
"Hello, " <> name = "Hello, Ada"    # name == "Ada"
def handle("GET " <> path), do: ...  # match on a prefix in a function head
```

That's the first hint of the theme running through the whole language: the thing that builds a value is also the thing that takes it apart.

### Operators worth noting

| Ruby | Elixir | Note |
|---|---|---|
| `==` | `==` | `1 == 1.0` is **true** |
| `equal?` | `===` | strict; `1 === 1.0` is false |
| `&&`, `\|\|`, `!` | `&&`, `\|\|`, `!` | truthy-based |
| — | `and`, `or`, `not` | require actual booleans; usable in guards |
| `+` on strings | `<>` | `+` is numbers only, always |
| `<<` | `++` / `[h \| t]` | no mutation |

---

## 4. Functions and Modules

```elixir
defmodule Math do
  @moduledoc "Arithmetic helpers."

  @doc "Adds two numbers."
  def add(a, b), do: a + b        # one-liner form

  def double(n) do                 # block form
    n * 2
  end

  defp secret, do: 42              # defp = private
end

Math.add(1, 2)
```

Key differences from Ruby:

**Arity is part of the identity.** `add/2` and `add/3` are *different functions* — not overloads of one name, genuinely unrelated as far as the compiler is concerned. You'll see `Enum.map/2` in docs; the `/2` is the argument count, and you must include it when referencing a function.

**The last expression is the return value.** There's no `return` statement at all. None. This is survivable because *everything* is an expression that evaluates to something — `if`, `case`, `cond`, `with`, even `try`. Ruby technically works this way too; Elixir makes you actually rely on it. Instead of jumping out of a function early, you arrange for the right value to flow out the bottom.

**Default args use `\\`:**

```elixir
def greet(name, greeting \\ "Hello"), do: "#{greeting}, #{name}!"
```

That single line defines *two* functions, `greet/1` and `greet/2` — defaults are expanded into one function per arity at compile time. (Which is why, when a function has several clauses, the defaults go on a bodiless header clause: they belong to the name, not to any one clause.)

**Anonymous functions need a dot to call:**

```elixir
add = fn a, b -> a + b end
add.(1, 2)              # the dot is required and non-negotiable

double = &(&1 * 2)      # capture shorthand; &1 is the first arg
double.(21)

&String.upcase/1        # capture a named function by name/arity
Enum.map(["a"], &String.upcase/1)
```

`&(&1 * 2)` is roughly Ruby's `{ |x| x * 2 }` / `_1` shorthand. `&String.upcase/1` is roughly `&:upcase`.

The dot isn't fussiness. Variables and functions live in **separate namespaces**: if a module defines `add/2` and you also bind a variable `add`, `add(1, 2)` calls the function and `add.(1, 2)` calls the variable. The dot tells the compiler which one you mean, with no ambiguity and no lookup rules to memorize.

---

## 5. Pattern Matching — The Big One

`=` is **not assignment**. It is the *match operator*. It asserts that the left side describes the right side, binding variables along the way.

Read it the way you read `=` in algebra — a claim that the two sides are the same — plus one rule: **an unbound variable matches anything, and stays bound to whatever it matched.**

```elixir
x = 1          # matches; x was unbound, so it takes the value 1
1 = x          # matches! this is legal and does nothing
2 = x          # ** (MatchError) no match of right hand side value: 1
```

So `x = 1` isn't a special "assignment" case — it's the ordinary case, with the binding falling out as a side effect. And `2 = x` isn't nonsense: it's an assertion that blows up when violated.

This becomes powerful for destructuring:

```elixir
{:ok, result} = {:ok, 42}           # result == 42
[first | rest] = [1, 2, 3]          # first == 1, rest == [2, 3]
%{name: n} = %{name: "Ada", age: 36} # n == "Ada"; partial match is fine for maps
{a, b} = {b, a}                      # this DOES swap — the right side is built before anything binds
```

Note the asymmetry in the map example: the pattern `%{name: n}` matches a map with *more* keys than it mentions. Patterns describe "at least this shape," not "exactly this shape" — which is what makes them usable against real-world data you don't fully control. Lists and tuples are the opposite: they must match exactly.

Use `^` (pin) to match against a variable's current value instead of rebinding:

```elixir
expected = 200
^expected = response.status    # assert equality, crash if not
```

The default is rebinding, always — a bare variable on the left is a slot to fill, never a comparison. `^` is how you say "use this variable's *value* as part of the pattern." (You'll meet it again in Ecto queries, for the same reason.)

### Matching in function heads

This replaces most conditionals and much of Ruby's polymorphism:

```elixir
defmodule Greeter do
  def greet(%{name: name, role: :admin}), do: "Welcome back, Admin #{name}"
  def greet(%{name: name}), do: "Hello, #{name}"
  def greet(_), do: "Hello, stranger"
end
```

Clauses are tried top to bottom, and the first that matches wins. This is the idiomatic replacement for `if`/`case` chains *and* for duck typing. Put specific clauses first.

Look at what that one function is doing at once: branching, destructuring `name` out, and checking the shape of the input. In Ruby you'd need a conditional, a field access, and probably a `respond_to?` or a subclass. Elixir dispatches on *the shape of the data* with no type hierarchy anywhere — which is why you'll notice the language has no `abstract`, no `super`, and no `method_missing`, and doesn't seem to miss them.

### Guards

Add conditions with `when`. Only a restricted set of functions is allowed (no arbitrary calls — guards must be side-effect free and fast):

```elixir
def classify(n) when is_integer(n) and n < 0, do: :negative
def classify(0), do: :zero
def classify(n) when is_integer(n), do: :positive
def classify(_), do: :not_a_number
```

Common guards: `is_atom/1`, `is_binary/1`, `is_integer/1`, `is_list/1`, `is_map/1`, `is_nil/1`, comparison operators, `in`, `and`/`or`/`not`, `length/1`, `map_size/1`, `byte_size/1`.

The restriction pays off in a way that surprises people: **a guard that raises doesn't raise — it just fails the match.** `def f(x) when x.age > 18` called with an atom, or with a map that has no `:age`, doesn't explode; the clause simply doesn't apply and the next one is tried. That's a feature when you want a fallback clause, and a genuine trap when a typo'd guard silently routes everything to your catch-all. If a clause is mysteriously never chosen, suspect the guard.

### One mechanism, everywhere

This is the point to stop and notice: there is only *one* matching engine, and you have now seen most of the places it shows up. `=`, function heads, `case` clauses, `fn` clauses, `with` arrows, `for` generators, `receive` patterns, `rescue` clauses — all the same thing wearing different syntax.

That's why Elixir has so few control-flow constructs compared to what it can express, and why dense-looking Elixir usually isn't clever: a single line is just doing four jobs at once that Ruby would spread over four lines — checking a type, branching on a value, pulling fields out, and naming them. Learn matching properly and roughly half the language stops looking like separate features to memorize.

---

## 6. Control Flow

### `case` — match a value against patterns

```elixir
case File.read("config.json") do
  {:ok, contents} -> parse(contents)
  {:error, :enoent} -> default_config()
  {:error, reason} -> raise "boom: #{inspect(reason)}"
end
```

### `cond` — Ruby's `if/elsif/else`

```elixir
cond do
  score > 90 -> :a
  score > 80 -> :b
  true -> :f          # `true` is the else branch
end
```

`true ->` isn't a keyword, it's just a condition that's always truthy. Leave it out and a value matching nothing raises `CondClauseError` — which is often what you want, since it's a loud complaint about a case you didn't consider rather than a silent `nil`.

### `if` / `unless`

They exist, they're macros, they return values. Use them for genuinely binary checks; reach for pattern matching otherwise.

```elixir
status = if user.active, do: :on, else: :off
```

Note `user.active`, not `user.active?` — that trailing `?` is a Ruby reflex worth unlearning here. `?` is legal in *function* names (`String.valid?/1`), but a struct field is just a key, and `user.active?` would look for a key literally named `:active?` and raise when it isn't there.

There is no `elsif`. That's `cond`.

### `with` — the happy-path pipeline

This one has no Ruby equivalent and you'll miss it when you go back. It chains matches, bailing out on the first mismatch:

```elixir
with {:ok, user} <- fetch_user(id),
     {:ok, account} <- fetch_account(user),
     :ok <- verify_balance(account, amount) do
  {:ok, charge(account, amount)}
else
  {:error, :not_found} -> {:error, "no such user"}
  {:error, reason} -> {:error, reason}
end
```

Here's the shape to hold on to: **`with` is a `case` that doesn't nest.** Written out longhand, the above is a `case` inside a `case` inside a `case`, marching off the right edge of the screen. `with` flattens that staircase into a list.

And each `<-` reads as "this must match, or we're done." When one doesn't match, *the value that failed* becomes the result of the whole `with` — skipping every remaining step. That is the early return you were told you couldn't have; it just went in the language instead of in your fingers.

Two things to know before you trust it: the `else` is optional, and without one the unmatched value is returned as-is. And a clause written with `=` instead of `<-` is an ordinary match — it can't bail out, it raises. Use `=` deliberately for steps that must not fail.

---

## 7. The Pipe Operator

`|>` passes the left value as the **first argument** to the right function.

```elixir
# Ruby
users.select(&:active?).map(&:name).sort.take(10)

# Elixir
users
|> Enum.filter(& &1.active)
|> Enum.map(& &1.name)
|> Enum.sort()
|> Enum.take(10)
```

Ruby chains methods on objects; Elixir pipes data through functions. This is why every stdlib function takes its subject first — `Enum.map(list, fun)`, `String.split(str, sep)`, `Map.get(map, key)`. That convention exists *for* the pipe.

The whole thing is textual: `a |> f(b)` compiles to exactly `f(a, b)`, and that's the entire feature. There's no receiver, no chaining protocol, nothing an object has to opt into. Which means it works with your functions on day one, and also explains its one real limitation — if the value you're threading isn't the first argument, the pipe can't help you (reach for an anonymous function or `then/2`).

Idiom: start a pipe with a plain value, not a function call. `foo() |> bar()` — prefer `value |> foo() |> bar()`.

---

## 8. Collections: `Enum` and `Stream`

`Enum` is your `Enumerable`. It works on lists, maps, ranges, and anything implementing the protocol. It's **eager** — every step builds a full intermediate collection.

```elixir
Enum.map([1,2,3], &(&1 * 2))              # [2, 4, 6]
Enum.filter(1..10, &(rem(&1, 2) == 0))    # [2, 4, 6, 8, 10]
Enum.reduce([1,2,3], 0, &+/2)             # 6 — reduce is inject
Enum.reduce(list, %{}, fn x, acc -> Map.put(acc, x, true) end)
Enum.group_by(words, &String.length/1)
Enum.sort_by(users, & &1.age, :desc)
Enum.into(list, %{})                       # like to_h
Enum.at(list, 3)                           # O(n) on lists!
```

`Enum.reduce/3` is the one that actually matters: every other function here is a convenience built on it. When you can't find the function you want, that's not a gap in the stdlib — write the reduce. (And note `Enum` hands you `{key, value}` tuples when you enumerate a map. That's the whole explanation for `for {k, v} <- map` and `Enum.into(list_of_pairs, %{})`.)

`Stream` is the lazy version — same API, composes into a single pass, only runs when an `Enum` function terminates it:

```elixir
1..1_000_000
|> Stream.map(&(&1 * 2))
|> Stream.filter(&(rem(&1, 3) == 0))
|> Enum.take(5)          # only computes what it needs
```

The difference is what the intermediate steps *are*. `Enum.map` hands back a list; `Stream.map` hands back a struct describing work not yet done — inspect one and you'll literally see `#Stream<[enum: 1..3, funs: [...]]>`. Nothing runs until an `Enum` function asks for values, and then each element flows through every step in one pass. The example above touches maybe 15 numbers, not a million.

Rule of thumb: `Enum` by default, `Stream` for large/infinite/IO-bound sequences.

### Comprehensions

```elixir
for x <- 1..5, rem(x, 2) == 1, do: x * x    # [1, 9, 25]
for x <- [1,2], y <- [:a,:b], do: {x, y}     # cartesian product
for {k, v} <- map, into: %{}, do: {k, String.upcase(v)}
```

Filters go inline after the generator. `into:` controls the result type.

---

## 9. Maps, Keyword Lists, and Structs

### Maps — your default key-value store

```elixir
m = %{name: "Ada", age: 36}      # atom keys, shorthand
m.name                            # "Ada" — raises if key missing
m[:name]                          # "Ada" — nil if missing
Map.get(m, :email, "none")        # with default
%{m | age: 37}                    # update EXISTING key; raises if absent
Map.put(m, :email, "a@b.c")       # put/insert
Map.delete(m, :age)
```

Note the two access styles: `.key` is strict (raises on missing), `[:key]` is lenient (returns `nil`). Pick strict when the key must be there — it fails loudly at the source instead of propagating `nil` three layers away from the bug.

`.key` also only works with atom keys, which turns out to be a useful signal rather than a limitation: atom keys mean "a shape my code defines and controls," string keys mean "data that came from outside" (JSON bodies, form params). When you see `params["email"]`, you're looking at untrusted input; when you see `user.email`, you're looking at something your own code built.

### Keyword lists — for options

```elixir
[color: :red, size: 10]           # sugar for [{:color, :red}, {:size, 10}]
```

An ordered list of 2-tuples with atom keys, allowing duplicates. This is Ruby's "options hash as last argument" role, and gets the same trailing-argument sugar:

```elixir
String.split("a1b2", ~r/\d/, trim: true)
```

Use `Keyword.get/3` to read them. Maps for data, keyword lists for options.

Now the payoff, which retroactively explains a lot of syntax you've already seen: **`do ... end` is keyword-list sugar.** These two compile to the identical AST:

```elixir
if x, do: 1, else: 2
if x do 1 else 2 end       # => if(x, [do: 1, else: 2])
```

`if` isn't a keyword — it's a macro taking two arguments, the second being a keyword list that happens to have a prettier spelling. Same for `case`, `for`, `defmodule`, and `def`. Elixir has strikingly little special syntax; it has function calls, keyword lists, and macros, arranged to look like syntax.

### Structs — the closest thing to a class

```elixir
defmodule User do
  @enforce_keys [:name]
  defstruct [:name, :email, age: 0, active: true]

  def adult?(%User{age: age}), do: age >= 18
end

u = %User{name: "Ada"}            # %User{name: "Ada", email: nil, age: 0, active: true}
u.name
%User{u | age: 36}                # update
User.adult?(u)                    # functions live in the module, take the struct
```

A struct is a map with a `__struct__` key and a fixed set of fields. Not "like a map" — it *is* a map, and `%User{name: n}` in a pattern is plain map matching that also checks `__struct__: User`. That one key is doing all the work: compile-time field checking, type-based pattern matching (`def handle(%User{}), do: ...`), and protocol dispatch all read it.

This is where the mental shift bites hardest. In Ruby, `user.adult?` is a method on an object. In Elixir, `User.adult?(user)` is a function taking data. Same idea, inverted. Modules group functions that operate on a shape of data.

---

## 10. Errors: Tagged Tuples over Exceptions

Ruby raises. Elixir returns. The dominant convention:

```elixir
{:ok, value}        # success
{:error, reason}    # expected failure
```

Worth being clear about: this is a *convention*, not a language feature. Nothing enforces it, no compiler checks it, `{:ok, x}` is an ordinary two-element tuple. It became universal because pattern matching makes it cost nothing to produce and nothing to consume — the tag is an atom, and `case`/`with` read it in one line. A convention this cheap doesn't need enforcement.

And the two-function convention you already recognize from Ruby's `!`:

```elixir
File.read("x.txt")     # {:ok, contents} | {:error, :enoent}
File.read!("x.txt")    # contents, or raises File.Error
Map.fetch(m, :k)       # {:ok, v} | :error
Map.fetch!(m, :k)      # v, or raises
```

Use `!` versions when a failure is a bug and should crash. Use tuple versions for failures you'll actually handle — then `case` or `with` on the result.

Exceptions exist and are for *exceptional* things:

```elixir
raise ArgumentError, "bad input"
raise "quick and dirty"

try do
  risky()
rescue
  e in ArgumentError -> {:error, e.message}
after
  cleanup()
end
```

But `try/rescue` is rare in idiomatic code. Which brings us to the reason why.

---

## 11. Processes and "Let It Crash"

A BEAM process is not an OS thread and not a Ruby thread. It's a lightweight, isolated, garbage-collected-independently unit — a few KB, microseconds to spawn, millions per node. No shared memory, ever. Communication is by message passing only.

If you want the Ruby analogy: **a process is the closest thing Elixir has to an object.** Identity (a pid), private state nobody else can reach, and an interface that's nothing but messages. It fits Alan Kay's original description of OO more literally than Ruby's objects do. The difference is what you spend them on — you don't reach for a process to model every noun in the domain, only when you need state that persists over time, or work that happens concurrently.

```elixir
pid = spawn(fn -> IO.puts("hi from #{inspect(self())}") end)

send(pid, {:hello, self()})

receive do
  {:hello, from} -> IO.puts("got hello from #{inspect(from)}")
after
  1_000 -> IO.puts("timeout")
end
```

You will rarely write raw `spawn`/`receive`. You'll use OTP abstractions built on top.

### Task — fire-and-forget or parallel work

```elixir
# Parallel HTTP calls — actually parallel, no GIL
urls
|> Task.async_stream(&fetch/1, max_concurrency: 20, timeout: 30_000)
|> Enum.to_list()

t = Task.async(fn -> expensive() end)
other_work()
Task.await(t)
```

This one utility replaces a lot of Ruby thread-pool ceremony.

### GenServer — stateful server process

The workhorse. Before the boilerplate, here is the entire idea, with no OTP in it:

```elixir
def loop(state) do
  receive do
    msg -> loop(handle(msg, state))
  end
end
```

A process that receives a message, computes a new state, and calls itself with it. That's a GenServer. Everything `use GenServer` adds is bookkeeping around that loop — timeouts, replies, shutdown, debugging hooks.

Keep that picture while reading the code below: `handle_cast/2` and `handle_call/3` are the *body* of that loop, and the state you return in `{:noreply, state + 1}` **is the argument to the next iteration**. This is how Elixir gets mutable state out of immutable data. Nothing was ever modified; the loop just went around again holding a different value.

```elixir
defmodule Counter do
  use GenServer

  # --- Client API (runs in the CALLER's process) ---
  def start_link(initial \\ 0),
    do: GenServer.start_link(__MODULE__, initial, name: __MODULE__)

  def increment, do: GenServer.cast(__MODULE__, :increment)   # async, no reply
  def value, do: GenServer.call(__MODULE__, :value)           # sync, waits for reply

  # --- Server callbacks (run in the SERVER process) ---
  @impl true
  def init(initial), do: {:ok, initial}

  @impl true
  def handle_cast(:increment, state), do: {:noreply, state + 1}

  @impl true
  def handle_call(:value, _from, state), do: {:reply, state, state}
end
```

Keep the client/server split in your head — it's the single most common source of confusion. `increment/0` and `value/0` run in *your* process and do nothing but send a message; `handle_cast/2` and `handle_call/3` run over in the counter's process. The two halves live in one file for readability, not because they execute together.

That split is the whole safety story. The server handles one message at a time, to completion, so its state can never be observed half-updated — no locks, no mutexes, no atomics, because there's only ever one thing touching that state. The flip side: a slow `handle_call` blocks every other caller in the queue. Serialization is both the guarantee and the bottleneck.

And `call` vs `cast` is exactly "do I need an answer": `call` sends and then blocks waiting for a reply (5 seconds by default, then it raises — that's the timeout you'll eventually meet in production), `cast` sends and immediately moves on, with no way to know whether anything happened.

### Supervisors and "let it crash"

Instead of defensive `rescue` everywhere, you let a process die on unexpected input and have a supervisor restart it in a known-good state.

```elixir
children = [
  {Counter, 0},
  {MyApp.Repo, []},
  {Task.Supervisor, name: MyApp.TaskSupervisor}
]

Supervisor.start_link(children, strategy: :one_for_one)
```

Strategies: `:one_for_one` (restart just the dead child), `:one_for_all` (restart all), `:rest_for_one` (restart it and everything started after it).

The philosophy: you cannot anticipate every failure, and code that tries becomes a thicket of error handling that's itself buggy. So handle the failures you *expect* (tagged tuples) and let the rest crash a small, isolated process that gets restarted clean. Errors stay contained — one crashed request handler doesn't take down the server.

"Let it crash" is easy to misread as "don't handle errors." It means something narrower: **don't write handling for failures you didn't predict**, because a fresh process in a known-good state is a better recovery than code guessing at a situation its author never imagined. That works precisely because `init/1` can rebuild the state from something durable. If a restart would come back into the same broken state, or would lose data nobody else has, the supervisor isn't saving you — and that's a design problem, not an error-handling one.

---

## 12. Protocols and Behaviours

Two forms of polymorphism, both replacing things Ruby does with inheritance and mixins.

**Protocols** — dispatch on data type. This is Ruby's duck typing, made explicit.

```elixir
defprotocol Describable do
  def describe(value)
end

defimpl Describable, for: User do
  def describe(u), do: "User #{u.name}"
end

defimpl Describable, for: List do
  def describe(l), do: "#{length(l)} items"
end
```

You can implement a protocol for a type you don't own — that's the `String.Chars` / `Inspect` / `Enumerable` mechanism. Implementing `String.Chars` is how a struct becomes interpolatable; `Inspect` controls `IO.inspect` output (and is how you redact passwords in logs).

**Behaviours** — an interface contract. Like a Ruby module of required methods, but compiler-checked.

```elixir
defmodule Parser do
  @callback parse(String.t()) :: {:ok, term} | {:error, String.t()}
end

defmodule JSONParser do
  @behaviour Parser
  @impl true
  def parse(s), do: {:ok, decode(s)}
end
```

`GenServer`, `Supervisor`, and Phoenix controllers are all behaviours.

The one-line distinction worth memorizing: **a protocol dispatches on the type of the data; a behaviour constrains a module.** "What can be done to this value" versus "what this module promises to provide." Protocols are polymorphism at runtime, behaviours are a contract at compile time.

### `use`, `import`, `alias`, `require`

```elixir
alias MyApp.Accounts.User        # now write `User` instead of the full path
import Enum, only: [map: 2]      # call map/2 unqualified — use sparingly
require Logger                   # needed before calling a module's macros
use GenServer                    # runs the module's __using__ macro — injects code
```

`use` is the metaprogramming hook — roughly Ruby's `include` + `extend` + `included do ... end` in one. It's also less magical than it looks: `use Foo, opts` expands to `require Foo; Foo.__using__(opts)`, and whatever AST that macro returns gets pasted into your module. That's the answer to "where did `child_spec/1` come from, and why does my GenServer work when I only defined two callbacks?" — `use GenServer` pasted in the defaults. You can read any of it with `Macro.expand_once`.

`alias` is the one you'll type most.

---

## 13. Testing

ExUnit ships with the language. `mix test` runs it.

```elixir
defmodule MathTest do
  use ExUnit.Case, async: true
  doctest Math

  describe "add/2" do
    test "sums integers" do
      assert Math.add(1, 2) == 3
    end

    test "returns error tuple on bad input" do
      assert {:error, _} = Math.add(:a, 1)    # pattern match in the assert
    end
  end
end
```

Three things RSpec users should note:

- `assert` is a macro that introspects the expression — a failing `assert a == b` prints a real diff. You don't need a matcher library.
- `assert {:ok, x} = thing()` both asserts the shape *and* binds `x` for later assertions. Extremely handy.
- `async: true` runs test *modules* in parallel across cores. Free speedup when your tests don't share global state.

Doctests are worth calling out: examples in your `@doc` strings get executed as tests. Documentation that can't rot.

---

## 14. The Ecosystem

| Ruby | Elixir |
|---|---|
| Bundler + Rake | Mix |
| RubyGems | Hex (`hex.pm`) |
| Rails | Phoenix |
| ActiveRecord | Ecto (not an ORM — a query/changeset library) |
| RSpec / Minitest | ExUnit |
| Sidekiq | Oban (or plain Tasks/GenServers) |
| ActionCable | Phoenix Channels / LiveView |
| Rubocop | Credo |
| YARD | ExDoc (built in) |
| Pry | IEx.pry, `dbg/1` |
| — | Dialyzer (static analysis of types) |

Two ecosystem notes that matter:

**Ecto is not ActiveRecord.** No callbacks, no `save`, no objects that persist themselves. You build a changeset (data + validations + cast rules), pass it to `Repo.insert/1`, and get `{:ok, struct}` or `{:error, changeset}`. Queries are composable data structures, not method chains on a class.

The shift is the same one as everywhere else in this guide: ActiveRecord fuses three things into one object — the record, its validation rules, and its ability to persist itself. Ecto splits them into a struct, a changeset, and a repo, and makes you pass data between them. More typing, and a lot less wondering which callback fired. Expect this to be the biggest adjustment if you're coming from Rails.

**Phoenix LiveView** is the flagship. Server-rendered, stateful UI over a websocket, no JavaScript for most interactivity. Each connected user is a lightweight process holding their UI state. It's the thing that's hardest to replicate elsewhere because it depends entirely on cheap processes.

---

## 15. Gotchas That Will Bite You

- **Rebinding isn't mutation, and it doesn't escape a scope.** `x = 1; fn -> x = 2 end.(); x` → still `1`. The inner `=` made a new binding inside the function, and it died there. The practical consequence bites daily: you cannot set a variable from inside an `if`, `case`, or `Enum.each`. Take the return value instead — `x = if flag, do: 1, else: 2`.
- **You can't accumulate in a loop.** No `result = []` then push inside `Enum.each`. Use `Enum.map`/`reduce`. `Enum.each` is for side effects only and returns `:ok`.
- **`length/1` is O(n), `Enum.at/2` is O(n).** Indexing into a list is a code smell. Use maps or tuples for random access.
- **Atoms are never garbage collected.** Never do `String.to_atom(user_input)` — it's a memory-exhaustion vector. Use `String.to_existing_atom/1`.
- **`IO.inspect` returns its argument**, so you can drop it anywhere in a pipe: `|> IO.inspect(label: "after filter") |>`. `dbg/1` is even better — it prints each pipe step.
- **Charlists (`~c"abc"`) aren't strings.** If output looks like `[104, 105]` or `~c"hi"`, an Erlang function handed you a charlist. `List.to_string/1` converts back.
- **A broken guard fails silently.** Guards that raise don't raise — the clause is skipped. A clause that's never selected is usually a guard problem, not a pattern problem.
- **No early return.** If you're reaching for one, you want `with`, multiple function clauses, or `Enum.reduce_while`.
- **Struct update `%{s | k: v}` only updates existing keys.** Adding a new key to a struct that way raises. That's on purpose.
- **Compile time is real.** Macros and `use` run at compile time. Module attributes (`@config Application.get_env(...)`) are frozen at compile time — a classic config bug. Read runtime config at runtime.

---

## 16. A Worked Example

A small module pulling most of this together — fetch users, filter, summarize, with proper error handling:

```elixir
defmodule Reports.Cohort do
  @moduledoc "Summarizes an active-user cohort."

  defstruct [:count, :avg_age, :names]

  @doc """
  Builds a cohort summary from a list of user maps.

      iex> Reports.Cohort.build([%{name: "Ada", age: 36, active: true}])
      {:ok, %Reports.Cohort{count: 1, avg_age: 36.0, names: ["Ada"]}}
  """
  def build([]), do: {:error, :empty}

  def build(users) when is_list(users) do
    case Enum.filter(users, & &1.active) do
      [] -> {:error, :no_active_users}
      active -> {:ok, summarize(active)}
    end
  end

  def build(_), do: {:error, :invalid_input}

  defp summarize(users) do
    %__MODULE__{
      count: length(users),
      avg_age: users |> Enum.map(& &1.age) |> average(),
      names: users |> Enum.map(& &1.name) |> Enum.sort()
    }
  end

  defp average(nums), do: Enum.sum(nums) / length(nums)
end
```

And consuming it:

```elixir
with {:ok, raw} <- File.read("users.json"),
     {:ok, users} <- Jason.decode(raw, keys: :atoms),
     {:ok, cohort} <- Reports.Cohort.build(users) do
  IO.puts("#{cohort.count} active users, avg age #{cohort.avg_age}")
else
  {:error, :enoent} -> IO.puts("no users file")
  {:error, reason} -> IO.puts("failed: #{inspect(reason)}")
end
```

Read `build/1` as a specification rather than as code: the empty list is an error, a list of maps gets summarized, and *anything else* is invalid input. Three clauses, no conditionals, and the ordering is the logic — `build([])` has to come first because `[]` would also match `is_list`. (`%__MODULE__{}` is just `%Reports.Cohort{}` spelled so a rename can't break it.)

Note what's absent: no `nil` checks, no nested `if`s, no `begin/rescue`, no mutation, and nowhere a value is modified after it's created. Each function declares the shapes it accepts and returns a tagged result, so the caller's `with` can thread them together without inspecting anything. That's the style — and if you can name the mechanism behind every line above, you've got the language.

---

## 17. Where to Go Next

1. **Do the official [Getting Started guide](https://hexdocs.pm/elixir/introduction.html)** — it's genuinely good and takes an afternoon.
2. **Read "Elixir in Action" (Saša Jurić)** — the best book for understanding *why* the BEAM works the way it does. Skip the beginner books if you're an experienced Rubyist.
3. **Watch Saša Jurić's "The Soul of Erlang and Elixir"** (~35 min) — the live demo of fault tolerance that makes supervisors click.
4. **Build something with Phoenix LiveView.** `mix phx.new demo --live`. It's the fastest way to feel what cheap processes buy you.
5. **Turn on Dialyzer and Credo early** so you learn idioms as you go rather than unlearning habits later.

The syntax will take a week. The functional data modeling will take a month. OTP and process design will take longer, and it's the part that's actually worth the trip.
