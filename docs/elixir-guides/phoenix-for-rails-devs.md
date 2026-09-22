# Phoenix for Rails Developers — A Crash Course

You already know Rails. This guide leans on that: every concept is framed as "here's the Rails you know, here's what changes."

It assumes you've been through [the Elixir crash course](./elixir-for-rubyists.md) — pattern matching, tagged tuples, GenServers, and immutability show up on every page here, and this guide won't re-teach them. Where Phoenix does something that only makes sense because of an Elixir feature, this guide points at it.

Chris McCord built Phoenix after years of Rails, and it shows: `mix phx.new`, generators, migrations, a router, controllers, MVC-ish naming. The familiarity gets you productive in a day and then quietly misleads you for a month. Rails is a framework your app lives *inside*. Phoenix is a library your app *uses*. Almost every real difference follows from that one sentence.

Versions here are Phoenix 1.8, LiveView 1.2, Elixir 1.18+. Everything shown is real generated output from `mix phx.new`, not paraphrase.

---

## 1. The Three Things That Actually Change

### 1. Your app is not "a Phoenix app"

`rails s` boots Rails, which loads your code into itself. `mix phx.server` boots **your** OTP application, which starts a supervision tree that happens to contain a web server. Here is the actual file the generator writes:

```elixir
# lib/my_app/application.ex
def start(_type, _args) do
  children = [
    MyAppWeb.Telemetry,
    MyApp.Repo,
    {Ecto.Migrator, repos: ..., skip: skip_migrations?()},
    {DNSCluster, query: Application.get_env(:my_app, :dns_cluster_query) || :ignore},
    {Phoenix.PubSub, name: MyApp.PubSub},
    # Start a worker by calling: MyApp.Worker.start_link(arg)
    # {MyApp.Worker, arg},
    # Start to serve requests, typically the last entry
    MyAppWeb.Endpoint
  ]

  Supervisor.start_link(children, strategy: :one_for_one, name: MyApp.Supervisor)
end
```

Read that list again. The database pool, the cluster discovery, the pub/sub system, and the HTTP endpoint are **peers** — and the endpoint is deliberately last, because everything it depends on must already be up. That commented-out `{MyApp.Worker, arg}` line is an invitation: background processes are first-class residents here, not a separate Sidekiq deployment that happens to load the same code.

The consequences are immediate and structural. Your web layer is one subsystem among several, so a batch importer or a websocket-only service is the same app with a different child list. Supervision applies to the whole thing, so "the web server died" is a restart of one child rather than an outage. And there's no "Rails is booted" global state to reason about — there's a tree, and you can see all of it in one screen.

### 2. A request is a value, not an object graph

There is no `ActionDispatch::Request`, no controller instance, no `@variables`, no ambient `request`/`response`/`session` methods. There is one struct, `%Plug.Conn{}`, and the entire request lifecycle is that struct being piped through plain functions:

```
conn → endpoint plugs → router → pipeline plugs → your controller → conn
```

Every one of those arrows is a function taking a conn and returning a conn. Your controller action is not special; it's just the last plug in the chain. The endpoint file literally ends with `plug MyAppWeb.Router` — the router is a plug, the same kind of thing as `Plug.Session`.

Rails draws a hard line between middleware (Rack, configured in `application.rb`), filters (`before_action`, inherited from a superclass), and actions (methods on a controller instance). Phoenix has one concept doing all three jobs.

### 3. The default UI is stateful and lives on the server

LiveView is not a bolt-on; since 1.7 it's the thing the generators reach for by default. Each connected user gets a process holding their UI state, and the server pushes HTML diffs over a websocket. Most of what you'd reach for Turbo, Stimulus, or React to do, you do in Elixir.

This is affordable for exactly one reason: a process costs a few KB and microseconds to spawn. Ten thousand concurrent users means ten thousand processes, which is an unremarkable amount of work for the BEAM.

### These are one design, not three facts

Cheap processes are what make a process-per-connection UI practical, which is what makes LiveView possible. Supervision is what makes it safe to hold that much state in memory — a crashed LiveView takes down one browser tab's state, and the client reconnects and remounts. And the conn-as-a-value model is just immutability applied to HTTP.

If Rails is "convention over configuration," Phoenix is "explicitness over magic, paid for by a runtime that makes concurrency free." You will type more. You will also be able to answer "what happens when this request arrives" by reading code top to bottom.

---

## 2. Setup

```bash
mix archive.install hex phx_new      # one-time: installs the generator
mix phx.new my_app                   # Postgres by default
cd my_app && mix setup               # deps.get + db create/migrate + assets
mix phx.server                       # http://localhost:4000
iex -S mix phx.server                # ...with a REPL attached
```

Useful `phx.new` flags: `--database sqlite3|mysql`, `--no-ecto`, `--no-html` (API only), `--umbrella`, `--binary-id` (UUID primary keys — decide on day one).

**`iex -S mix phx.server` is the one to internalize.** It isn't `rails console`; it's a REPL attached to the *running server*. The same BEAM instance serving requests is the one at your prompt. You can inspect a live GenServer's state, send a message to a connected user's LiveView process, call `Repo.all/1`, or open `:observer.start()` and watch every process in the system while traffic flows through it. There's no separate boot, and no "console mode" where things behave differently.

A few Mix tasks that map to things you know:

```bash
mix ecto.gen.migration add_posts     # rails g migration
mix ecto.migrate                     # rails db:migrate
mix phx.routes                       # rails routes
mix test                             # rspec
mix format                           # rubocop -a, but built in and non-negotiable
mix precommit                        # generated alias: compile --warnings-as-errors, format, test
```

That last one is new in 1.8 and worth adopting — `--warnings-as-errors` matters more in Phoenix than you'd expect, because several of the framework's best safety features (verified routes, unused assigns) report as *warnings*.

---

## 3. The Two-Tree Layout

```
lib/
  my_app/               # your application. No web here, ever.
    application.ex      #   the supervision tree
    repo.ex
    blog.ex             #   a context (public API of a domain slice)
    blog/post.ex        #   an Ecto schema
  my_app_web/           # ONE interface onto your application
    endpoint.ex
    router.ex
    controllers/
    live/
    components/
  my_app_web.ex         # the `use MyAppWeb, :controller` hub
```

Rails puts `app/models` and `app/controllers` side by side as equals, which quietly teaches you that the domain and the delivery mechanism are the same size of thing. Phoenix splits them at the top level and names the split: `lib/my_app` is your application, `lib/my_app_web` is a web interface *onto* it.

**The rule that makes this pay off: `_web` may call into the app; the app must never call into `_web`.** Hold that line and you get a CLI, a background job runner, a GraphQL layer, or a test suite that exercises real logic without HTTP — for free, because the domain never knew about HTTP in the first place. Break it once and you're back to Rails, where "can I call this from a rake task" is a live question.

### `my_app_web.ex` — where the conventions live

```elixir
defmodule MyAppWeb do
  def controller do
    quote do
      use Phoenix.Controller, formats: [:html, :json]
      use Gettext, backend: MyAppWeb.Gettext
      import Plug.Conn
      unquote(verified_routes())
    end
  end

  def live_view do
    quote do
      use Phoenix.LiveView
      unquote(html_helpers())
    end
  end

  # ...router, channel, html, live_component, html_helpers...

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
```

This is what `use MyAppWeb, :controller` at the top of every controller expands to. Rails achieves the same thing through `ApplicationController` and a pile of framework-level `included do` hooks you can't see. Phoenix puts it in one ordinary file in your repo, and you're expected to edit it: adding an alias here makes it available in every LiveView, no inheritance involved.

The file's own moduledoc warns you not to define functions inside those `quote` blocks — put them in a module and `import` it. Good advice; the injected code is compiled into *every* controller, so anything you add is paid for 200 times.

---

## 4. Plug — The Whole Request Model

Plug is Rack, but with the fuzziness removed. A plug is either a function or a module:

```elixir
# function plug: (conn, opts) -> conn
def require_admin(conn, _opts) do
  if conn.assigns.current_user.admin? do
    conn
  else
    conn |> put_flash(:error, "nope") |> redirect(to: ~p"/") |> halt()
  end
end

# module plug: init/1 (compile time) + call/2 (runtime)
defmodule MyAppWeb.RequestTimer do
  def init(opts), do: opts
  def call(conn, _opts), do: assign(conn, :started_at, System.monotonic_time())
end
```

That's the entire abstraction. Now look at the generated endpoint, which is a plug made of plugs:

```elixir
defmodule MyAppWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :my_app

  socket "/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]]

  plug Plug.Static, at: "/", from: :my_app, ...
  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]
  plug Plug.Parsers, parsers: [:urlencoded, :multipart, :json], ...
  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug MyAppWeb.Router
end
```

**The last line is the aha.** Your router is a plug. Your controller is a plug. Your endpoint is a plug built from plugs, one of which is the router, which dispatches to more plugs. Your entire web application is a single function from `conn` to `conn`, and you are looking at its definition. Rails' middleware-vs-filter-vs-action distinction isn't simplified here; it doesn't exist.

Two things follow that trip people up:

**`conn` is immutable.** `put_resp_header(conn, ...)` returns a *new* conn. Forget to use the return value and your header silently vanishes — the classic Phoenix beginner bug, and the reason plug code is written as a pipe.

**`halt/1` is how you stop the chain.** It sets a flag; subsequent plugs check it and pass through. Rails' `before_action` halts by rendering or redirecting, which is implicit and occasionally surprising. Here, `redirect/2` alone does *not* stop later plugs from running — you need `|> halt()`.

---

## 5. The Router

```elixir
defmodule MyAppWeb.Router do
  use MyAppWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {MyAppWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_scope_for_user     # added by phx.gen.auth
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", MyAppWeb do
    pipe_through :browser

    get "/", PageController, :home
    resources "/posts", PostController       # yes, resources exists
    live "/entries", EntryLive.Index, :index
  end
end
```

A `pipeline` is a named, reusable stack of plugs. A `scope` applies one or more pipelines to a group of routes. Together they replace Rails' `ApplicationController` filter inheritance — and notice what that buys you: **an admin area with different filters is a scope, not a subclass.** No `Admin::BaseController < ApplicationController`, no `skip_before_action`, no working out which of four ancestors added the filter you're trying to remove. The stack for any route is the list of pipelines named next to it.

`mix phx.routes` prints the table, same as `rails routes`.

### `live_session` and the gotcha that catches everyone

```elixir
scope "/", MyAppWeb do
  pipe_through [:browser, :require_authenticated_user]

  live_session :require_authenticated_user,
    on_mount: [{MyAppWeb.UserAuth, :require_authenticated}] do
    live "/users/settings", UserLive.Settings, :edit
  end
end
```

Why is authentication declared *twice* there — once as a plug, once as an `on_mount`?

Because **router pipelines only run on the initial HTTP request.** Once a LiveView is connected, events arrive over a websocket and never touch the router again. A `plug :require_authenticated_user` protects the first page load and then has no further say. `on_mount` hooks are the LiveView equivalent, running on both the HTTP mount and the websocket mount.

Get this wrong and you build something that looks secure in the browser and isn't. It is the single highest-stakes difference between Phoenix routing and Rails routing.

### Verified routes — `~p`

```elixir
~p"/posts"
~p"/posts/#{post}"
~p"/posts/#{post}/edit?return_to=show"
```

Rails' `post_path(post)` is a runtime helper generated from your routes: it reads as Ruby, and a typo is a `NoMethodError` whenever that line finally executes. `~p` is a compile-time-checked sigil that reads as a *URL*.

This is not a marketing claim. While writing this guide I generated a LiveView scaffold and deliberately forgot to add its routes. The compiler said:

```
warning: no route path for MyAppWeb.Router matches "/posts/#{post}"
  │
  95 │   defp return_path("show", post), do: ~p"/posts/#{post}"
  │                                         ~
  │
  └─ lib/my_app_web/live/post_live/form.ex:95
```

Every dead link in the app, located before it ran. Two details matter: interpolated structs go through `Phoenix.Param` (so `#{post}` becomes `post.id`, or your slug if you implement the protocol), and **it's a warning, not an error** — which is exactly why the generated `mix precommit` alias runs `compile --warnings-as-errors`.

---

## 6. Controllers, HEEx, and Components

```elixir
defmodule MyAppWeb.PageController do
  use MyAppWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
```

An action is a two-argument function: `(conn, params) -> conn`. No instance, so no instance variables — you attach data with `assign(conn, :posts, posts)` and it lands in the template's `@posts`. There's no implicit "render the template named after the action with whatever ivars I happened to set"; `render/2` names the template.

### Templates are functions now

```elixir
defmodule MyAppWeb.PageHTML do
  use MyAppWeb, :html
  embed_templates "page_html/*"
end
```

`embed_templates` compiles every `.heex` file in that directory into a **function** on this module. `render(conn, :home)` calls `MyAppWeb.PageHTML.home(assigns)`.

Phoenix 1.7 deleted view objects entirely (`Phoenix.View` is gone). If you remember the old `PostView` with helper methods, its replacement is: put the function in the HTML module. A template and its helpers are now just a module of functions that return HTML.

### HEEx is not ERB

```heex
<div class={["card", @active && "card-active"]}>
  <h1>{@post.title}</h1>
  <p :if={@post.subtitle}>{@post.subtitle}</p>
  <ul>
    <li :for={tag <- @post.tags}>{tag}</li>
  </ul>
</div>
```

`{...}` interpolates (in bodies and attributes); `<%= %>` is still there for block forms; `:if` and `:for` are attributes rather than wrapper tags.

The real difference is underneath. ERB is a string templating language that happens to emit HTML — it has no idea what a tag is. **HEEx parses the HTML.** That's why it can tell you at compile time that you left a `<div>` unclosed, why attribute interpolation is automatically escaped in an attribute-aware way, and — most importantly — why it can split your template into static chunks and dynamic holes. That split is the entire foundation of LiveView's diffing. HEEx *has* to understand HTML for LiveView to work at all.

### Function components replace partials

```elixir
attr :title, :string, required: true
attr :rest, :global
slot :actions

def header(assigns) do
  ~H"""
  <header class="flex justify-between" {@rest}>
    <h1>{@title}</h1>
    <div>{render_slot(@actions)}</div>
  </header>
  """
end
```

```heex
<.header title="Listing Posts">
  <:actions>
    <.button variant="primary" navigate={~p"/posts/new"}>New Post</.button>
  </:actions>
</.header>
```

A partial was a file rendered with a locals hash that nobody checked. A function component is a function with **declared, compile-checked attributes** and named slots. Pass an attribute it didn't declare, or forget a required one, and you get a warning at compile time pointing at the call site.

`attr :rest, :global` is the escape hatch for pass-through HTML attributes, and `slot` is `yield` with names and multiple blocks. Your generated app ships a pile of these in `core_components.ex` — `<.input>`, `<.table>`, `<.flash>`, `<.icon>` — as ordinary code in your repo that you're expected to edit, not a gem to configure.

---

## 7. Contexts — The Part Rails Developers Fight

This is the section to read twice. It's where most Rails-to-Phoenix friction lives, and the friction is almost always about a thing Rails fused that Phoenix splits.

`mix phx.gen.live Blog Post posts title:string body:text` generates two files that matter:

```elixir
# lib/my_app/blog/post.ex — the SCHEMA: what a row looks like
defmodule MyApp.Blog.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :title, :string
    field :body, :string
    field :published, :boolean, default: false
    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [:title, :body, :published])
    |> validate_required([:title, :body])
  end
end
```

```elixir
# lib/my_app/blog.ex — the CONTEXT: what you can DO
defmodule MyApp.Blog do
  @moduledoc "The Blog context."
  import Ecto.Query, warn: false
  alias MyApp.Repo
  alias MyApp.Blog.Post

  def list_posts, do: Repo.all(Post)
  def get_post!(id), do: Repo.get!(Post, id)

  def create_post(attrs) do
    %Post{}
    |> Post.changeset(attrs)
    |> Repo.insert()
  end

  def update_post(%Post{} = post, attrs) do
    post |> Post.changeset(attrs) |> Repo.update()
  end

  def delete_post(%Post{} = post), do: Repo.delete(post)

  def change_post(%Post{} = post, attrs \\ %{}), do: Post.changeset(post, attrs)
end
```

An ActiveRecord model does three jobs at once: it maps a table, it validates, and it holds business logic. Phoenix splits those into three places — **schema** maps the table, **changeset** validates a proposed change, **context** holds the logic and is the public API.

**The context is the only door into a domain slice.** A controller or LiveView calls `Blog.create_post/1`. It does not call `Repo.insert/1`, and it should not know `Post` exists. The schema is an implementation detail of the context, the same way a table is an implementation detail of the schema.

Three things people get stuck on:

**"This is just a service object."** Kind of — except it's the default rather than the escape hatch, and it's coarse-grained. Not one class per action (`CreatePostService`), but one module per bounded slice of the domain, with every operation on that slice as a function. `Accounts`, `Billing`, `Blog`. If you find yourself writing `Blog.PostCreator`, you've reinvented the thing Rails people reach for when models get fat, and missed the point.

**There is no `Context` module to inherit from.** Look at `blog.ex` again: it's a plain module with an alias and some functions. `mix phx.gen.context` is a code generator, nothing more. Phoenix provides zero runtime support for contexts, which means the discipline is entirely social — and also that there's nothing to fight when your domain doesn't fit the generator's shape. Delete the generated functions you don't want. They're yours.

**The naming is a design prompt, not a rule.** The generator will happily make a context per schema if you let it, which gets you a `Post` context and a `Comment` context and no benefit at all. The question the split is asking is "what are the four or five *areas* of this system, and what can you do in each?" — the same question DDD calls a bounded context. Getting it wrong initially is fine and expected; they're modules, and renaming a module is a find-and-replace.

What you get for the discipline: a domain layer with no web types in it, which means you can call it from a LiveView, a controller, an Oban job, a mix task, and a test, identically. That's the whole trade.

---

## 8. Ecto — Not an ORM, and Not Trying to Be

### `Repo` is the only thing that touches the database

```elixir
Repo.all(Post)
Repo.get!(Post, id)
Repo.insert(changeset)
Repo.update(changeset)
Repo.delete(post)
Repo.preload(post, :comments)
```

There is no `Post.all`, no `post.save`, no `post.destroy`. A schema struct is inert data — it has no connection, no dirty tracking, no idea a database exists. Every trip to the database is a visible call to `Repo`.

This one design choice removes an entire category of Rails bug. "Something saved a record and I can't find what" is not a question you can have here, because saving requires the word `Repo` on the line that does it.

### Changesets are data, not methods

```elixir
def changeset(post, attrs) do
  post
  |> cast(attrs, [:title, :body, :published])   # whitelist — this is strong_parameters
  |> validate_required([:title, :body])
  |> validate_length(:title, max: 200)
  |> unique_constraint(:slug)
end
```

A changeset is a struct describing a *proposed* change: the original data, the casted changes, the errors, and whether it's valid. It is not a method on a model and it doesn't mutate anything. Three consequences, each one an aha:

**Different operations get different changesets.** Rails gives you one `validates` block plus `on: :create`, `if: :password_required?`, and a growing thicket of conditionals. Here you write `registration_changeset`, `email_changeset`, `password_changeset` — separate functions with separate rules. The generated `phx.gen.auth` code does exactly this, and it's worth reading for that reason alone.

**`cast/3` is `strong_parameters`, and it lives with the validations.** The whitelist of assignable fields is the first line of the changeset instead of a separate concern in the controller — which is the right place for it, since the rules for "what may be set" and "what must be true" are the same rules.

**A failed write hands the changeset back.** `Repo.insert/1` returns `{:ok, post}` or `{:error, changeset}`, and that changeset carries both the errors *and* the user's submitted input. That's the entire reason re-rendering a form after a failed save is a one-liner:

```elixir
case Blog.create_post(params) do
  {:ok, post} ->
    {:noreply, socket |> put_flash(:info, "Post created") |> push_navigate(to: ~p"/posts/#{post}")}

  {:error, %Ecto.Changeset{} = changeset} ->
    {:noreply, assign(socket, form: to_form(changeset))}
end
```

`to_form/1` turns the changeset into something `<.input field={@form[:title]} />` renders with the right value, the right name, and the right error message attached. No `@post.errors.full_messages`, no re-fetching, no flash-and-redirect dance.

### Queries are composable values

```elixir
import Ecto.Query

query = from p in Post, where: p.published == true

query =
  if term do
    from p in query, where: ilike(p.title, ^"%#{term}%")
  else
    query
  end

query |> order_by(desc: :inserted_at) |> limit(20) |> Repo.all()
```

An `Ecto.Query` is a data structure. You can build it, pass it to another function, store it in a module attribute, and add to it — and nothing happens until a `Repo` call. ActiveRecord relations are lazy too, but they're lazy *proxies* that fire when something touches them, which is why `.to_a` placement matters and why relations leak into views and quietly run queries. Ecto queries can't fire by accident; they aren't connected to anything.

Note the `^` on `^"%#{term}%"`: it's the pin operator from the Elixir guide, and here it means "this is a bound parameter from outside the query." Ecto uses it to separate query structure from user data, which is also why SQL injection through the query DSL isn't really a thing.

### No callbacks. None.

There is no `before_save`, no `after_create`, no `around_destroy`. If creating a post should send an email, you write that in the context function:

```elixir
def create_post(attrs) do
  with {:ok, post} <- %Post{} |> Post.changeset(attrs) |> Repo.insert() do
    Notifications.deliver_new_post(post)
    {:ok, post}
  end
end
```

More lines than `after_create :notify`. Also the only place in the system where creating a post causes anything, findable with one grep, testable without stubbing a lifecycle, and inert when a test factory or a data migration inserts a row. Callbacks are the ActiveRecord feature that most reliably becomes the thing everyone is afraid of in a four-year-old codebase, and Ecto's answer is simply to not have them.

### Associations never load themselves

```elixir
post = Repo.get!(Post, id)
post.comments
# => #Ecto.Association.NotLoaded<association :comments is not loaded>

post = Repo.get!(Post, id) |> Repo.preload(:comments)
post.comments   # => [%Comment{}, ...]
```

No lazy loading means **no accidental N+1 — ever.** In Rails, `posts.each { |p| p.comments }` in a view is a silent 200-query page. In Phoenix, that expression returns 200 `NotLoaded` structs and your page visibly breaks in development. The fix is `Repo.preload/2` or a `preload:` in the query. You pay for it by having to think about what you need; you're paid back by never shipping the other thing.

### Transactions

```elixir
Ecto.Multi.new()
|> Ecto.Multi.insert(:user, User.changeset(%User{}, attrs))
|> Ecto.Multi.insert(:profile, fn %{user: user} -> Profile.changeset(%Profile{}, user) end)
|> Repo.transaction()
# => {:ok, %{user: ..., profile: ...}} | {:error, :profile, changeset, changes_so_far}
```

`Ecto.Multi` is a transaction as a data structure — you build the list of operations, then run it. The error tuple tells you *which named step* failed and what had already succeeded, which is considerably better than catching `ActiveRecord::Rollback` and guessing. Use `Repo.transaction/1` with a plain function for simple cases; reach for `Multi` when there's more than one write or the steps depend on each other.

---

## 9. LiveView

The main event. A LiveView is a process on the server that holds your UI state and pushes HTML diffs to the browser over a websocket.

### The lifecycle

```
HTTP GET → mount/3 (disconnected) → render/1 → static HTML sent, page paints
        ↓
websocket connects → mount/3 (connected!) → render/1 → diffs from here on
        ↓
user clicks → handle_event/3 → new assigns → render/1 → diff pushed
```

**`mount/3` runs twice.** Once for the ordinary HTTP request — which is what makes the first paint fast and the page indexable — and again when the websocket connects. `connected?(socket)` tells you which one you're in:

```elixir
def mount(_params, _session, socket) do
  if connected?(socket) do
    Journal.subscribe_entries(socket.assigns.current_scope)
  end

  {:ok,
   socket
   |> assign(:page_title, "Listing Entries")
   |> stream(:entries, list_entries(socket.assigns.current_scope))}
end
```

Anything with an ongoing cost — a PubSub subscription, a timer, a `Process.monitor` — goes inside that `if`. Skip the check and you subscribe twice, or subscribe a process that's about to be thrown away. This is the number one LiveView newcomer bug.

### A LiveView is a GenServer

Not "like" one. It is one, and everything from the Elixir guide transfers directly:

| GenServer | LiveView |
|---|---|
| state | `socket.assigns` |
| `handle_cast/2` | `handle_event/3` (a browser event) |
| `handle_info/2` | `handle_info/2` (a message from anywhere in your app) |
| `{:noreply, new_state}` | `{:noreply, new_socket}` |

Which means: it processes one message at a time, in order. It can receive messages from any process in the system, not just the browser. It's supervised, so a crash kills that tab's state and the client reconnects and remounts. And — the part that bites — **slow work in `handle_event/3` freezes that user's entire UI**, because the loop is busy. For anything slow, `assign_async/3` or `start_async/3` runs the work in a separate task and delivers the result as a message.

### What actually goes over the wire

HEEx compiles your template into static segments and dynamic holes. The statics are sent once, at mount. After that, an update sends only the dynamic values that changed — often a few dozen bytes for a click.

This is why HEEx must parse HTML, and why you can't build a template by string concatenation. It's also why **change tracking depends on `assign`**: LiveView compares assigns between renders to decide what to re-send. Compute a value in the template instead of assigning it and it's recomputed and re-sent every time; mutate a nested struct outside of `assign` and the comparison may not notice.

### Forms

Here's the generated form LiveView, essentially verbatim:

```elixir
def render(assigns) do
  ~H"""
  <Layouts.app flash={@flash}>
    <.header>{@page_title}</.header>

    <.form for={@form} id="post-form" phx-change="validate" phx-submit="save">
      <.input field={@form[:title]} type="text" label="Title" />
      <.input field={@form[:body]} type="textarea" label="Body" />
      <.button phx-disable-with="Saving..." variant="primary">Save Post</.button>
    </.form>
  </Layouts.app>
  """
end

def handle_event("validate", %{"post" => post_params}, socket) do
  changeset = Blog.change_post(socket.assigns.post, post_params)
  {:noreply, assign(socket, form: to_form(changeset, action: :validate))}
end

def handle_event("save", %{"post" => post_params}, socket) do
  case Blog.update_post(socket.assigns.post, post_params) do
    {:ok, post} ->
      {:noreply,
       socket
       |> put_flash(:info, "Post updated successfully")
       |> push_navigate(to: ~p"/posts/#{post}")}

    {:error, %Ecto.Changeset{} = changeset} ->
      {:noreply, assign(socket, form: to_form(changeset))}
  end
end
```

`phx-change="validate"` fires on every keystroke, runs your *real* changeset, and re-renders the errors. Live validation with no client-side validation library, no duplicated rules, and no drift between what the browser checks and what the database will accept — because there's only one set of rules and the server owns it.

`phx-disable-with` handles the double-submit problem declaratively. The `{:error, changeset}` branch is the entire failure path.

### Streams — for lists you don't want in memory

```elixir
socket |> stream(:posts, Blog.list_posts())
...
{:noreply, stream_delete(socket, :posts, post)}
{:noreply, stream_insert(socket, :posts, post, at: 0)}
```

```heex
<div id="posts" phx-update="stream">
  <div :for={{dom_id, post} <- @streams.posts} id={dom_id}>{post.title}</div>
</div>
```

The naive approach — keeping a 10,000-item list in assigns — costs you that list in memory per connected user. A stream hands items to the client and forgets them server-side, keeping only DOM ids. This is why the generators use streams for index pages by default, and why the row helpers destructure `{_id, post}` tuples.

### Navigation

| | What it does |
|---|---|
| `<.link navigate={~p"/posts"}>` | Tear down this LiveView, mount another. No page reload. |
| `<.link patch={~p"/posts?page=2"}>` | Same LiveView, new URL → `handle_params/3`. No remount. |
| `<.link href={~p"/logout"}>` | Ordinary full-page HTTP request. |
| `push_navigate/2`, `push_patch/2` | The same two, from server code. |

`live_action` (set by the third argument in your router's `live` macro) is how one LiveView serves `:index`, `:new`, and `:edit` — you match on it in `handle_params` or `apply_action`.

### Function components vs LiveComponents

A **function component** (`<.header>`) is a function. No state, no process, no lifecycle. Use these for essentially everything.

A **LiveComponent** (`<.live_component module={...} id={...}>`) has its own state and lifecycle — and here's the part that surprises everyone: **it runs inside the parent LiveView's process.** It is not a separate process, it has no independent failure domain, and its `handle_event` blocks the parent just like the parent's own. It's a state-and-callback organizing tool, not a concurrency tool. If you want a genuinely independent process, that's a separate LiveView (nested via `live_render/3`) or a GenServer.

### JS commands — client-side behavior without JavaScript

```heex
<.link phx-click={JS.push("delete", value: %{id: post.id}) |> hide("##{id}")}
       data-confirm="Are you sure?">
  Delete
</.link>
```

`Phoenix.LiveView.JS` builds a list of client-side operations that run in the browser *immediately*, without a server round trip — hide the row now, tell the server after. That's optimistic UI, and it's the generated default. For genuinely custom JS you write a hook (`phx-hook`), which is the Stimulus-shaped escape hatch.

### When not to use LiveView

It needs a live websocket, so it's a poor fit for offline-capable apps, for pages that must work with JS disabled, and for highly interactive canvas/drawing work where a round trip per interaction is too slow. It's also not an API. Regular controllers and `mix phx.gen.json` are still there, and mixing both in one app is normal.

---

## 10. Real-Time: PubSub, Channels, Presence

`Phoenix.PubSub` is already in your supervision tree — look back at `application.ex`. Using it is two functions:

```elixir
Phoenix.PubSub.subscribe(MyApp.PubSub, "room:42")
Phoenix.PubSub.broadcast(MyApp.PubSub, "room:42", {:new_message, msg})
```

Subscribing registers *your process* against a topic; broadcasting sends the message to every subscriber's mailbox. In a LiveView, those arrive at `handle_info/2`.

The Rails equivalent requires Redis, because Rails processes can't address each other. Here the registry is a process and the transport is the VM. And because `DNSCluster` is already in your children list, once you run more than one node they discover each other and **PubSub spans the cluster automatically** — no Redis, no adapter config, no extra infrastructure. This is the single biggest "oh" moment for a Rails developer who has maintained an ActionCable deployment.

**Channels** are the lower-level websocket API, for when the client isn't a LiveView — a React app, iOS, a game. You write a `Channel` module with `join/3` and `handle_in/3`; the official JS/Swift/Kotlin clients handle reconnection and message queueing. `mix phx.gen.channel`.

**Presence** tracks who's connected to a topic, across the cluster, using CRDTs so nodes converge without a coordinator. Getting "who's in this room" right, including netsplits, is genuinely hard, and it's `mix phx.gen.presence` plus about twenty lines.

---

## 11. Auth — Generated Code, Not a Gem

```bash
mix phx.gen.auth Accounts User users
```

Devise is a gem you configure and, eventually, fight. `phx.gen.auth` is a **generator that writes ~1,500 lines into your repo and then gets out of the way**: schema, changesets, session controller, LiveViews for registration/login/settings/confirmation, a `UserAuth` plug module, tests for all of it. There's no engine mounted, no DSL, no `devise :registerable, :confirmable`. When you need login to work differently, you edit the function.

Phoenix 1.8 defaults to **magic-link login** (email a token, no password required to sign in), with passwords optional and sudo-mode re-authentication for sensitive actions. Read the generated `Accounts` context — it's the best worked example of multiple changesets per schema you'll find.

### Scopes — the 1.8 idea worth stealing

```elixir
defmodule MyApp.Accounts.Scope do
  @moduledoc """
  Defines the scope of the caller to be used throughout the app.
  """
  alias MyApp.Accounts.User

  defstruct user: nil

  def for_user(%User{} = user), do: %__MODULE__{user: user}
  def for_user(nil), do: nil
end
```

Rails gives you `current_user` — ambient state, reachable from a controller, often smuggled into models via `Current.user` or a thread local. Phoenix 1.8 makes the caller an explicit **argument**. Every scoped context function takes it first:

```elixir
def list_entries(%Scope{} = scope) do
  Repo.all_by(Entry, user_id: scope.user.id)
end

def get_entry!(%Scope{} = scope, id) do
  Repo.get_by!(Entry, id: id, user_id: scope.user.id)
end

def update_entry(%Scope{} = scope, %Entry{} = entry, attrs) do
  true = entry.user_id == scope.user.id
  ...
end
```

Three things are happening there, and all three are worth noticing.

The `%Scope{} = scope` in the head means a call without a scope **doesn't compile past the first test** — you can't forget the caller, because the function won't match. Authorization stops being a thing you remember and becomes a thing the shape of the code requires.

`Repo.all_by(Entry, user_id: scope.user.id)` means the tenant filter is inside the context, not in a controller `before_action` someone can skip. There is no way to reach the unscoped query from outside.

And `true = entry.user_id == scope.user.id` is the Elixir guide's "`1 = x` is an assertion" idea doing real work: if that comparison is ever false, the function raises immediately rather than proceeding with someone else's record. It's a one-token assertion that an IDOR bug becomes a crash.

The struct has one field today. It's designed to grow — org id, permissions, impersonation, API-key-vs-human — which turns "can this caller do this" into pattern matching rather than a permissions lookup scattered through the app.

### The two-place rule again

```elixir
pipeline :browser do
  ...
  plug :fetch_current_scope_for_user           # for HTTP requests
end

live_session :require_authenticated_user,
  on_mount: [{MyAppWeb.UserAuth, :require_authenticated}] do   # for LiveView
  live "/users/settings", UserLive.Settings, :edit
end
```

Plugs for the HTTP boundary, `on_mount` for the LiveView boundary. Both, always. See §5.

---

## 12. Testing

ExUnit, no RSpec. Two generated case templates:

```elixir
defmodule MyApp.BlogTest do
  use MyApp.DataCase          # database, no HTTP
  ...
end

defmodule MyAppWeb.PostControllerTest do
  use MyAppWeb.ConnCase       # database + a %Plug.Conn{} and ~p routes
  ...
end
```

### Genuinely parallel database tests

```elixir
use MyApp.DataCase, async: true
```

```elixir
def setup_sandbox(tags) do
  pid = Ecto.Adapters.SQL.Sandbox.start_owner!(MyApp.Repo, shared: not tags[:async])
  on_exit(fn -> Ecto.Adapters.SQL.Sandbox.stop_owner(pid) end)
end
```

Each async test gets its own database connection wrapped in a transaction that's rolled back at the end. Tests run concurrently across every core, against one database, with no cleanup and no interference. Rails' parallel testing forks worker processes and gives each one its *own database* (`test-0`, `test-1`, ...) precisely because it can't do this. Here it's one line per test module.

(The sandbox is Postgres-shaped. On MySQL or SQLite, leave `async` off.)

### Fixtures are functions

```elixir
def post_fixture(attrs \\ %{}) do
  {:ok, post} =
    attrs
    |> Enum.into(%{title: "some title", body: "some body"})
    |> MyApp.Blog.create_post()

  post
end
```

No factory_bot, no DSL, no `FactoryBot.define`. The generator writes a plain function per schema into `test/support/fixtures/`, and it calls your real context function — so a fixture that stops working means your actual creation path is broken. Reach for a factory library later if you want traits and sequences; most apps don't.

### Connection tests

```elixir
test "lists all posts", %{conn: conn} do
  conn = get(conn, ~p"/posts")
  assert html_response(conn, 200) =~ "Listing Posts"
end
```

Note `~p` — verified routes work in tests too, so a test can't reference a route that doesn't exist.

### LiveView tests drive the real process

```elixir
test "saves new post", %{conn: conn} do
  {:ok, lv, _html} = live(conn, ~p"/posts/new")

  assert lv
         |> form("#post-form", post: %{title: ""})
         |> render_change() =~ "can&#39;t be blank"

  assert {:ok, _lv, html} =
           lv
           |> form("#post-form", post: %{title: "Hello", body: "World"})
           |> render_submit()
           |> follow_redirect(conn, ~p"/posts")

  assert html =~ "Post created successfully"
end
```

No browser, no Selenium, no Capybara, no flakiness — and yet this is a *real* integration test: it mounts the actual LiveView process, sends it actual events, and asserts on actual rendered HTML.

This is the thing that's hard to replicate elsewhere. Testing a Turbo or React UI at this level means driving a browser, because the state lives in the browser. LiveView's state lives in a process on the same machine as the test, so the test can just talk to it. A freshly generated app with `phx.gen.auth` and one scaffold ships with about 126 passing tests you didn't write, covering paths you'd otherwise skip.

---

## 13. Everything Else Rails Gave You

| Rails | Phoenix | Note |
|---|---|---|
| Rack | Plug | same idea, sharper edges |
| Puma / Unicorn | Bandit | pure Elixir, in-process, no separate server |
| ActiveRecord | Ecto | §8 |
| ActiveJob / Sidekiq | Oban | Postgres-backed, no Redis; or plain `Task`/GenServer for trivia |
| ActionMailer | Swoosh | `mix phx.gen.notifier`; dev inbox at `/dev/mailbox` |
| ActionCable | Channels / LiveView | §10 |
| ActiveStorage | *(nothing built in)* | LiveView uploads + S3 direct; `Waffle` if you want a library |
| Sprockets / Webpacker / importmap | esbuild + Tailwind | **no Node.js required** — both ship as precompiled binaries |
| RSpec / Minitest | ExUnit | §12 |
| factory_bot | plain fixture functions | §12 |
| I18n | Gettext | standard `.po` files, `mix gettext.extract` |
| Rails engines | a library + a `scope`/`forward` | no engine machinery needed |
| `rails c` | `iex -S mix` | attaches to the *running* system |
| `rails routes` | `mix phx.routes` | |
| `rails db:migrate` | `mix ecto.migrate` | migrations look nearly identical |
| credentials / dotenv | `config/runtime.exs` + env vars | §14 |
| Rubocop | `mix format` + Credo | format is built in and canonical |
| New Relic / Scout | Telemetry + LiveDashboard | `/dev/dashboard` out of the box |

Two worth expanding.

**No Node in a default Phoenix app.** `esbuild` and `tailwind` are Hex packages that download a platform binary; `mix assets.build` runs them. There's no `package.json`, no `node_modules`, no asset pipeline to debug on deploy. 1.8 also ships daisyUI on top of Tailwind, which is why the generated components have real styling.

**LiveDashboard is not a gem you add later.** `/dev/dashboard` gives you request metrics, every process in the VM with its memory and message queue, ETS tables, and a live Ecto query view. Since it's a LiveView, you can put it behind auth and run it in production. Finding a leaking process by sorting the process list by mailbox size is a debugging move with no Rails equivalent.

---

## 14. Config and Deployment

### Four config files, and one that's different

```
config/config.exs      compile time, all environments
config/dev.exs         compile time, dev
config/test.exs        compile time, test
config/prod.exs        compile time, prod
config/runtime.exs     RUNTIME — every environment, on boot
```

**Everything except `runtime.exs` is evaluated at compile time**, and the values are baked into the compiled artifact. Read a secret from `System.get_env/1` in `prod.exs` and you've read the environment of the *build machine*.

This is the same trap the Elixir guide flags about module attributes, and it's the most common Phoenix production bug. The rule: anything that varies per deploy — database URL, secret key base, API keys, host — goes in `config/runtime.exs`, which runs when the release boots.

The legitimate use of compile-time config is deciding what code to compile at all. The generated router does exactly that:

```elixir
if Application.compile_env(:my_app, :dev_routes) do
  scope "/dev" do
    live_dashboard "/dashboard", metrics: MyAppWeb.Telemetry
    forward "/mailbox", Plug.Swoosh.MailboxPreview
  end
end
```

`compile_env/2` (rather than `get_env/2`) is the honest spelling — it records the value at compile time and makes the runtime complain if it later disagrees.

### Releases

```bash
mix phx.gen.release --docker    # writes a Dockerfile and release scripts
MIX_ENV=prod mix release        # a self-contained tarball
_build/prod/rel/my_app/bin/my_app start
```

A release bundles your compiled code *and the Erlang VM* into a directory that runs with no Elixir, no Mix, no Hex, and no build toolchain on the target. There is no Bundler on the server, no Passenger, no `RAILS_ENV=production bundle exec`. Start it and it's serving.

`bin/my_app remote` opens an IEx shell attached to the running production node — the same REPL from §2, on the live system. Use with the appropriate respect.

### Clustering, for free

`DNSCluster` is already in your supervision tree. Point it at a headless service (`MY_APP_HEADLESS.namespace.svc.cluster.local`) and your nodes find each other, form an Erlang cluster, and PubSub starts spanning them. Multi-node real-time with zero additional infrastructure — no Redis, no message broker, no sticky sessions.

---

## 15. Gotchas That Will Bite You

- **`mount/3` runs twice.** Guard subscriptions, timers, and expensive work with `if connected?(socket)`.
- **Router pipelines don't run on LiveView events.** Auth needs a plug *and* an `on_mount`. This one is a security bug, not an inconvenience.
- **`conn` is immutable.** `put_resp_header(conn, ...)` returns a new conn; ignore the return value and nothing happens. Pipe everything.
- **`redirect/2` doesn't stop the plug chain.** You need `|> halt()`.
- **Compile-time config.** Secrets read outside `runtime.exs` come from the build machine. §14.
- **Change tracking follows `assign`.** Computing in the template instead of assigning means it re-renders and re-sends every time.
- **A LiveComponent runs in the parent's process.** It isn't isolation or concurrency; it's code organization.
- **Slow work in `handle_event/3` freezes that user's UI.** It's a GenServer. Use `assign_async/3` or `start_async/3`.
- **Unhandled messages crash a LiveView.** Any process can send yours anything; without a matching `handle_info/2` clause, it dies. Add a catch-all if you subscribe to chatty topics.
- **`~p` mistakes are warnings, not errors.** Run `mix compile --warnings-as-errors` in CI — the generated `mix precommit` alias already does.
- **Associations are `NotLoaded` until preloaded.** Not a bug; the point. `Repo.preload/2`.
- **Don't call `Repo` from `_web`.** The moment a LiveView does its own query, the context boundary is decoration.
- **Don't let the app call into `_web`.** Same rule, more damaging: it's what makes the domain reusable.
- **`phx.gen.live` gives you a starting point, not an architecture.** The generated context is four CRUD functions. Real domains have `publish_post`, not `update_post(post, %{published: true})`.
- **Flash in LiveView needs `put_flash/3` *and* a rendered `<.flash_group>`.** The layout does it; a custom layout might not.
- **`push_navigate` vs `push_patch`.** Patch stays in the same LiveView and calls `handle_params/3`; navigate tears down and remounts. Using navigate for pagination throws away all your state.

---

## 16. A Worked Example

This is the generated output of `mix phx.gen.live Journal Entry entries title:string body:text` in an app that already ran `phx.gen.auth` — so the generator produces the scoped, real-time version. It's about forty lines, and it's a complete multi-user live-updating feature.

**The context** — authorization, persistence, and broadcasting, all behind one public API:

```elixir
defmodule MyApp.Journal do
  @moduledoc "The Journal context."

  import Ecto.Query, warn: false
  alias MyApp.Repo
  alias MyApp.Journal.Entry
  alias MyApp.Accounts.Scope

  @doc """
  Subscribes to scoped notifications about any entry changes.

  The broadcasted messages match the pattern:

    * {:created, %Entry{}}
    * {:updated, %Entry{}}
    * {:deleted, %Entry{}}
  """
  def subscribe_entries(%Scope{} = scope) do
    Phoenix.PubSub.subscribe(MyApp.PubSub, "user:#{scope.user.id}:entries")
  end

  defp broadcast_entry(%Scope{} = scope, message) do
    Phoenix.PubSub.broadcast(MyApp.PubSub, "user:#{scope.user.id}:entries", message)
  end

  def list_entries(%Scope{} = scope) do
    Repo.all_by(Entry, user_id: scope.user.id)
  end

  def get_entry!(%Scope{} = scope, id) do
    Repo.get_by!(Entry, id: id, user_id: scope.user.id)
  end

  def create_entry(%Scope{} = scope, attrs) do
    with {:ok, entry = %Entry{}} <-
           %Entry{}
           |> Entry.changeset(attrs, scope)
           |> Repo.insert() do
      broadcast_entry(scope, {:created, entry})
      {:ok, entry}
    end
  end

  def update_entry(%Scope{} = scope, %Entry{} = entry, attrs) do
    true = entry.user_id == scope.user.id

    with {:ok, entry = %Entry{}} <-
           entry
           |> Entry.changeset(attrs, scope)
           |> Repo.update() do
      broadcast_entry(scope, {:updated, entry})
      {:ok, entry}
    end
  end
end
```

**The schema** — the scope reaches in here too, so ownership can't be set from params:

```elixir
defmodule MyApp.Journal.Entry do
  use Ecto.Schema
  import Ecto.Changeset

  schema "entries" do
    field :title, :string
    field :body, :string
    field :user_id, :id
    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(entry, attrs, user_scope) do
    entry
    |> cast(attrs, [:title, :body])          # user_id is NOT castable
    |> validate_required([:title, :body])
    |> put_change(:user_id, user_scope.user.id)
  end
end
```

**The LiveView** — subscribe on connect, re-render on broadcast:

```elixir
def mount(_params, _session, socket) do
  if connected?(socket) do
    Journal.subscribe_entries(socket.assigns.current_scope)
  end

  {:ok,
   socket
   |> assign(:page_title, "Listing Entries")
   |> stream(:entries, list_entries(socket.assigns.current_scope))}
end

def handle_event("delete", %{"id" => id}, socket) do
  entry = Journal.get_entry!(socket.assigns.current_scope, id)
  {:ok, _} = Journal.delete_entry(socket.assigns.current_scope, entry)
  {:noreply, stream_delete(socket, :entries, entry)}
end

def handle_info({type, %MyApp.Journal.Entry{}}, socket)
    when type in [:created, :updated, :deleted] do
  {:noreply,
   stream(socket, :entries, list_entries(socket.assigns.current_scope), reset: true)}
end
```

### What just happened

Open this page in two tabs. Create an entry in one, and the other updates — no polling, no JavaScript, no Redis, no ActionCable configuration. That behavior is entirely accounted for by three lines: the `subscribe_entries` in `mount`, the `broadcast_entry` in `create_entry`, and the `handle_info` clause.

Read it again for the things that *aren't* there. No `current_user` global — the scope is an argument, and `%Scope{} = scope` in every head means you can't omit it. No authorization in the web layer — `list_entries` can only return your rows, and `update_entry`'s `true = ...` assertion turns an ownership mismatch into an immediate crash. No `after_create` callback — `create_entry` broadcasts because the line is there, visible, in the one function that creates entries. No N+1, because nothing loads itself. No nested conditionals — `with` handles the failure path by falling through, and `{:error, changeset}` flows back to the form untouched.

And notice the shape of the whole thing: `handle_event` and `handle_info` are the same kind of function. A click from this user's browser and a broadcast from another user's request arrive at the same process, as messages, and are handled the same way. Once you see that, "real-time" stops being a feature you add and becomes the ordinary case.

---

## 17. Where to Go Next

1. **Generate an app and read every generated line.** `mix phx.new demo && cd demo && mix phx.gen.auth Accounts User users && mix phx.gen.live Blog Post posts title:string body:text`. Unlike Devise or Rails scaffolds, all of it is yours and all of it is idiomatic. An hour spent reading `accounts.ex` and `user_auth.ex` is worth three tutorials.
2. **The [official Phoenix guides](https://hexdocs.pm/phoenix/overview.html).** Genuinely excellent, and unusually honest about tradeoffs. Read the "Contexts" and "Ecto" pages even if you skip the rest.
3. **"Programming Phoenix LiveView" (Bruce Tate & Sophie DeBenedetto)** for LiveView in depth, and **"Programming Ecto" (Darin Wilson & Eric Meadows-Jönsson)** for the part that will otherwise take you longest.
4. **Chris McCord's LiveView talks.** Watching someone build a multiplayer feature in ten minutes is what makes the process model click.
5. **Read your app's generated `AGENTS.md`.** Phoenix 1.8 ships one — a concise statement of current house style, and a decent cheat sheet regardless of whether you use AI tooling.
6. **Turn on `mix precommit` from day one** so warnings-as-errors catches your `~p` typos while they're still cheap.

Plan for this rhythm: the router, controllers, and generators will feel familiar in an afternoon. Contexts and Ecto changesets will feel like extra work for two weeks and then like the reason your four-year-old app is still pleasant. LiveView will take longer, because the thing to learn isn't its API — it's thinking of a page as a supervised process that happens to have a browser attached. That last shift is the one Rails can't give you, and it's what the trip is for.
