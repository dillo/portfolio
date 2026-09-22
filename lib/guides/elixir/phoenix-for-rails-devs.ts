import type { Lesson } from '../types'

// Content source: docs/elixir-guides/phoenix-for-rails-devs.md
export const phoenixForRailsDevs: Lesson = {
  slug: 'phoenix-for-rails-devs',
  title: 'Phoenix for Rails Developers',
  tagline: 'Rails is a framework your app lives inside. Phoenix is a library your app uses.',
  intro:
    'You already know Rails. This guide leans on that: every concept is framed as "here is the Rails you know, here is what changes." It assumes you have been through the Elixir crash course — pattern matching, tagged tuples, GenServers, and immutability show up on every page here.\n\nChris McCord built Phoenix after years of Rails, and it shows: `mix phx.new`, generators, migrations, a router, controllers, MVC-ish naming. The familiarity gets you productive in a day and then quietly misleads you for a month. Almost every real difference follows from one sentence: Rails is a framework your app lives *inside*, Phoenix is a library your app *uses*.',
  minutes: 30,
  sections: [
    {
      heading: '1. The three things that actually change',
      blocks: [
        {
          kind: 'callout',
          tone: 'note',
          title: 'Versions',
          text: 'Phoenix 1.8, LiveView 1.2, Elixir 1.18+. Everything shown is real generated output from `mix phx.new`, not paraphrase.',
        },
        { kind: 'heading', text: '1. Your app is not "a Phoenix app"' },
        {
          kind: 'p',
          text: '`rails s` boots Rails, which loads your code into itself. `mix phx.server` boots **your** OTP application, which starts a supervision tree that happens to contain a web server. Here is the actual file the generator writes:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '# lib/my_app/application.ex\ndef start(_type, _args) do\n  children = [\n    MyAppWeb.Telemetry,\n    MyApp.Repo,\n    {Ecto.Migrator, repos: ..., skip: skip_migrations?()},\n    {DNSCluster, query: Application.get_env(:my_app, :dns_cluster_query) || :ignore},\n    {Phoenix.PubSub, name: MyApp.PubSub},\n    # Start a worker by calling: MyApp.Worker.start_link(arg)\n    # {MyApp.Worker, arg},\n    # Start to serve requests, typically the last entry\n    MyAppWeb.Endpoint\n  ]\n\n  Supervisor.start_link(children, strategy: :one_for_one, name: MyApp.Supervisor)\nend',
        },
        {
          kind: 'p',
          text: 'Read that list again. The database pool, the cluster discovery, the pub/sub system, and the HTTP endpoint are **peers** — and the endpoint is deliberately last, because everything it depends on must already be up. That commented-out `{MyApp.Worker, arg}` line is an invitation: background processes are first-class residents here, not a separate Sidekiq deployment that happens to load the same code.',
        },
        {
          kind: 'p',
          text: 'The consequences are structural. Your web layer is one subsystem among several, so a batch importer or a websocket-only service is the same app with a different child list. Supervision applies to the whole thing, so "the web server died" is a restart of one child rather than an outage. And there is no "Rails is booted" global state to reason about — there is a tree, and you can see all of it in one screen.',
        },
        { kind: 'heading', text: '2. A request is a value, not an object graph' },
        {
          kind: 'p',
          text: 'There is no `ActionDispatch::Request`, no controller instance, no `@variables`, no ambient `request`/`response`/`session` methods. There is one struct, `%Plug.Conn{}`, and the entire request lifecycle is that struct being piped through plain functions:',
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'conn → endpoint plugs → router → pipeline plugs → your controller → conn',
        },
        {
          kind: 'p',
          text: 'Every one of those arrows is a function taking a conn and returning a conn. Your controller action is not special; it is just the last plug in the chain. The endpoint file literally ends with `plug MyAppWeb.Router` — the router is a plug, the same kind of thing as `Plug.Session`.',
        },
        {
          kind: 'p',
          text: 'Rails draws a hard line between middleware (Rack, configured in `application.rb`), filters (`before_action`, inherited from a superclass), and actions (methods on a controller instance). Phoenix has one concept doing all three jobs.',
        },
        { kind: 'heading', text: '3. The default UI is stateful and lives on the server' },
        {
          kind: 'p',
          text: 'LiveView is not a bolt-on; since 1.7 it is the thing the generators reach for by default. Each connected user gets a process holding their UI state, and the server pushes HTML diffs over a websocket. Most of what you would reach for Turbo, Stimulus, or React to do, you do in Elixir.',
        },
        {
          kind: 'p',
          text: 'This is affordable for exactly one reason: a process costs a few KB and microseconds to spawn. Ten thousand concurrent users means ten thousand processes, which is an unremarkable amount of work for the BEAM.',
        },
        { kind: 'heading', text: 'These are one design, not three facts' },
        {
          kind: 'p',
          text: "Cheap processes are what make a process-per-connection UI practical, which is what makes LiveView possible. Supervision is what makes it safe to hold that much state in memory — a crashed LiveView takes down one browser tab's state, and the client reconnects and remounts. And the conn-as-a-value model is just immutability applied to HTTP.",
        },
        {
          kind: 'p',
          text: 'If Rails is "convention over configuration", Phoenix is "explicitness over magic, paid for by a runtime that makes concurrency free." You will type more. You will also be able to answer "what happens when this request arrives" by reading code top to bottom.',
        },
      ],
    },
    {
      heading: '2. Setup',
      blocks: [
        {
          kind: 'code',
          lang: 'bash',
          code: 'mix archive.install hex phx_new      # one-time: installs the generator\nmix phx.new my_app                   # Postgres by default\ncd my_app && mix setup               # deps.get + db create/migrate + assets\nmix phx.server                       # http://localhost:4000\niex -S mix phx.server                # ...with a REPL attached',
        },
        {
          kind: 'p',
          text: 'Useful `phx.new` flags: `--database sqlite3|mysql`, `--no-ecto`, `--no-html` (API only), `--umbrella`, `--binary-id` (UUID primary keys — decide on day one).',
        },
        {
          kind: 'p',
          text: '**`iex -S mix phx.server` is the one to internalise.** It is not `rails console`; it is a REPL attached to the *running server*. The same BEAM instance serving requests is the one at your prompt. You can inspect a live GenServer\'s state, send a message to a connected user\'s LiveView process, call `Repo.all/1`, or open `:observer.start()` and watch every process in the system while traffic flows through it. There is no separate boot, and no "console mode" where things behave differently.',
        },
        {
          kind: 'p',
          text: 'A few Mix tasks that map to things you know:',
        },
        {
          kind: 'code',
          lang: 'bash',
          code: 'mix ecto.gen.migration add_posts     # rails g migration\nmix ecto.migrate                     # rails db:migrate\nmix phx.routes                       # rails routes\nmix test                             # rspec\nmix format                           # rubocop -a, but built in and non-negotiable\nmix precommit                        # generated alias: compile --warnings-as-errors, format, test',
        },
        {
          kind: 'p',
          text: "That last one is new in 1.8 and worth adopting — `--warnings-as-errors` matters more in Phoenix than you would expect, because several of the framework's best safety features (verified routes, unused assigns) report as *warnings*.",
        },
      ],
    },
    {
      heading: '3. The two-tree layout',
      blocks: [
        {
          kind: 'code',
          lang: 'text',
          code: 'lib/\n  my_app/               # your application. No web here, ever.\n    application.ex      #   the supervision tree\n    repo.ex\n    blog.ex             #   a context (public API of a domain slice)\n    blog/post.ex        #   an Ecto schema\n  my_app_web/           # ONE interface onto your application\n    endpoint.ex\n    router.ex\n    controllers/\n    live/\n    components/\n  my_app_web.ex         # the `use MyAppWeb, :controller` hub',
        },
        {
          kind: 'p',
          text: 'Rails puts `app/models` and `app/controllers` side by side as equals, which quietly teaches you that the domain and the delivery mechanism are the same size of thing. Phoenix splits them at the top level and names the split: `lib/my_app` is your application, `lib/my_app_web` is a web interface *onto* it.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The rule that makes this pay off',
          text: '`_web` may call into the app; the app must never call into `_web`. Hold that line and you get a CLI, a background job runner, a GraphQL layer, or a test suite that exercises real logic without HTTP — for free, because the domain never knew about HTTP in the first place.',
        },
        { kind: 'heading', text: '`my_app_web.ex` — where the conventions live' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyAppWeb do\n  def controller do\n    quote do\n      use Phoenix.Controller, formats: [:html, :json]\n      use Gettext, backend: MyAppWeb.Gettext\n      import Plug.Conn\n      unquote(verified_routes())\n    end\n  end\n\n  def live_view do\n    quote do\n      use Phoenix.LiveView\n      unquote(html_helpers())\n    end\n  end\n\n  # ...router, channel, html, live_component, html_helpers...\n\n  defmacro __using__(which) when is_atom(which) do\n    apply(__MODULE__, which, [])\n  end\nend',
        },
        {
          kind: 'p',
          text: 'This is what `use MyAppWeb, :controller` at the top of every controller expands to. Rails achieves the same thing through `ApplicationController` and a pile of framework-level `included do` hooks you cannot see. Phoenix puts it in one ordinary file in your repo, and you are expected to edit it: adding an alias here makes it available in every LiveView, no inheritance involved.',
        },
        {
          kind: 'p',
          text: "The file's own moduledoc warns you not to define functions inside those `quote` blocks — put them in a module and `import` it. Good advice; the injected code is compiled into *every* controller, so anything you add is paid for 200 times.",
        },
      ],
    },
    {
      heading: '4. Plug — the whole request model',
      blocks: [
        {
          kind: 'p',
          text: 'Plug is Rack, but with the fuzziness removed. A plug is either a function or a module:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '# function plug: (conn, opts) -> conn\ndef require_admin(conn, _opts) do\n  if conn.assigns.current_user.admin? do\n    conn\n  else\n    conn |> put_flash(:error, "nope") |> redirect(to: ~p"/") |> halt()\n  end\nend\n\n# module plug: init/1 (compile time) + call/2 (runtime)\ndefmodule MyAppWeb.RequestTimer do\n  def init(opts), do: opts\n  def call(conn, _opts), do: assign(conn, :started_at, System.monotonic_time())\nend',
        },
        {
          kind: 'p',
          text: 'That is the entire abstraction. Now look at the generated endpoint, which is a plug made of plugs:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyAppWeb.Endpoint do\n  use Phoenix.Endpoint, otp_app: :my_app\n\n  socket "/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]]\n\n  plug Plug.Static, at: "/", from: :my_app, ...\n  plug Plug.RequestId\n  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]\n  plug Plug.Parsers, parsers: [:urlencoded, :multipart, :json], ...\n  plug Plug.MethodOverride\n  plug Plug.Head\n  plug Plug.Session, @session_options\n  plug MyAppWeb.Router\nend',
        },
        {
          kind: 'p',
          text: "**The last line is the aha.** Your router is a plug. Your controller is a plug. Your endpoint is a plug built from plugs, one of which is the router, which dispatches to more plugs. Your entire web application is a single function from `conn` to `conn`, and you are looking at its definition. Rails' middleware-vs-filter-vs-action distinction is not simplified here; it does not exist.",
        },
        {
          kind: 'p',
          text: 'Two things follow that trip people up.',
        },
        {
          kind: 'p',
          text: '**`conn` is immutable.** `put_resp_header(conn, ...)` returns a *new* conn. Forget to use the return value and your header silently vanishes — the classic Phoenix beginner bug, and the reason plug code is written as a pipe.',
        },
        {
          kind: 'p',
          text: "**`halt/1` is how you stop the chain.** It sets a flag; subsequent plugs check it and pass through. Rails' `before_action` halts by rendering or redirecting, which is implicit and occasionally surprising. Here, `redirect/2` alone does *not* stop later plugs from running — you need `|> halt()`.",
        },
      ],
    },
    {
      heading: '5. The router',
      blocks: [
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyAppWeb.Router do\n  use MyAppWeb, :router\n\n  pipeline :browser do\n    plug :accepts, ["html"]\n    plug :fetch_session\n    plug :fetch_live_flash\n    plug :put_root_layout, html: {MyAppWeb.Layouts, :root}\n    plug :protect_from_forgery\n    plug :put_secure_browser_headers\n    plug :fetch_current_scope_for_user     # added by phx.gen.auth\n  end\n\n  pipeline :api do\n    plug :accepts, ["json"]\n  end\n\n  scope "/", MyAppWeb do\n    pipe_through :browser\n\n    get "/", PageController, :home\n    resources "/posts", PostController       # yes, resources exists\n    live "/entries", EntryLive.Index, :index\n  end\nend',
        },
        {
          kind: 'p',
          text: "A `pipeline` is a named, reusable stack of plugs. A `scope` applies one or more pipelines to a group of routes. Together they replace Rails' `ApplicationController` filter inheritance — and notice what that buys you: **an admin area with different filters is a scope, not a subclass.** No `Admin::BaseController < ApplicationController`, no `skip_before_action`, no working out which of four ancestors added the filter you are trying to remove. The stack for any route is the list of pipelines named next to it.",
        },
        {
          kind: 'p',
          text: '`mix phx.routes` prints the table, same as `rails routes`.',
        },
        { kind: 'heading', text: '`live_session` and the gotcha that catches everyone' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'scope "/", MyAppWeb do\n  pipe_through [:browser, :require_authenticated_user]\n\n  live_session :require_authenticated_user,\n    on_mount: [{MyAppWeb.UserAuth, :require_authenticated}] do\n    live "/users/settings", UserLive.Settings, :edit\n  end\nend',
        },
        {
          kind: 'p',
          text: 'Why is authentication declared *twice* there — once as a plug, once as an `on_mount`?',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Router pipelines only run on the initial HTTP request',
          text: 'Once a LiveView is connected, events arrive over a websocket and never touch the router again. A `plug :require_authenticated_user` protects the first page load and then has no further say. `on_mount` hooks are the LiveView equivalent, running on both the HTTP mount and the websocket mount. Get this wrong and you build something that looks secure in the browser and is not.',
        },
        { kind: 'heading', text: 'Verified routes — `~p`' },
        {
          kind: 'code',
          lang: 'elixir',
          code: '~p"/posts"\n~p"/posts/#{post}"\n~p"/posts/#{post}/edit?return_to=show"',
        },
        {
          kind: 'p',
          text: "Rails' `post_path(post)` is a runtime helper generated from your routes: it reads as Ruby, and a typo is a `NoMethodError` whenever that line finally executes. `~p` is a compile-time-checked sigil that reads as a *URL*. Forget to add a route and the compiler says so:",
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'warning: no route path for MyAppWeb.Router matches "/posts/#{post}"\n  │\n  95 │   defp return_path("show", post), do: ~p"/posts/#{post}"\n  │                                         ~\n  │\n  └─ lib/my_app_web/live/post_live/form.ex:95',
        },
        {
          kind: 'p',
          text: 'Every dead link in the app, located before it ran. Two details matter: interpolated structs go through `Phoenix.Param` (so `#{post}` becomes `post.id`, or your slug if you implement the protocol), and **it is a warning, not an error** — which is exactly why the generated `mix precommit` alias runs `compile --warnings-as-errors`.',
        },
      ],
    },
    {
      heading: '6. Controllers, HEEx, and components',
      blocks: [
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyAppWeb.PageController do\n  use MyAppWeb, :controller\n\n  def home(conn, _params) do\n    render(conn, :home)\n  end\nend',
        },
        {
          kind: 'p',
          text: 'An action is a two-argument function: `(conn, params) -> conn`. No instance, so no instance variables — you attach data with `assign(conn, :posts, posts)` and it lands in the template\'s `@posts`. There is no implicit "render the template named after the action with whatever ivars I happened to set"; `render/2` names the template.',
        },
        { kind: 'heading', text: 'Templates are functions now' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyAppWeb.PageHTML do\n  use MyAppWeb, :html\n  embed_templates "page_html/*"\nend',
        },
        {
          kind: 'p',
          text: '`embed_templates` compiles every `.heex` file in that directory into a **function** on this module. `render(conn, :home)` calls `MyAppWeb.PageHTML.home(assigns)`.',
        },
        {
          kind: 'p',
          text: 'Phoenix 1.7 deleted view objects entirely (`Phoenix.View` is gone). If you remember the old `PostView` with helper methods, its replacement is: put the function in the HTML module. A template and its helpers are now just a module of functions that return HTML.',
        },
        { kind: 'heading', text: 'HEEx is not ERB' },
        {
          kind: 'code',
          lang: 'heex',
          code: '<div class={["card", @active && "card-active"]}>\n  <h1>{@post.title}</h1>\n  <p :if={@post.subtitle}>{@post.subtitle}</p>\n  <ul>\n    <li :for={tag <- @post.tags}>{tag}</li>\n  </ul>\n</div>',
        },
        {
          kind: 'p',
          text: '`{...}` interpolates, in bodies and attributes; `<%= %>` is still there for block forms; `:if` and `:for` are attributes rather than wrapper tags.',
        },
        {
          kind: 'p',
          text: "The real difference is underneath. ERB is a string templating language that happens to emit HTML — it has no idea what a tag is. **HEEx parses the HTML.** That is why it can tell you at compile time that you left a `<div>` unclosed, why attribute interpolation is escaped in an attribute-aware way, and — most importantly — why it can split your template into static chunks and dynamic holes. That split is the entire foundation of LiveView's diffing. HEEx *has* to understand HTML for LiveView to work at all.",
        },
        { kind: 'heading', text: 'Function components replace partials' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'attr :title, :string, required: true\nattr :rest, :global\nslot :actions\n\ndef header(assigns) do\n  ~H"""\n  <header class="flex justify-between" {@rest}>\n    <h1>{@title}</h1>\n    <div>{render_slot(@actions)}</div>\n  </header>\n  """\nend',
        },
        {
          kind: 'code',
          lang: 'heex',
          code: '<.header title="Listing Posts">\n  <:actions>\n    <.button variant="primary" navigate={~p"/posts/new"}>New Post</.button>\n  </:actions>\n</.header>',
        },
        {
          kind: 'p',
          text: 'A partial was a file rendered with a locals hash that nobody checked. A function component is a function with **declared, compile-checked attributes** and named slots. Pass an attribute it did not declare, or forget a required one, and you get a warning at compile time pointing at the call site.',
        },
        {
          kind: 'p',
          text: '`attr :rest, :global` is the escape hatch for pass-through HTML attributes, and `slot` is `yield` with names and multiple blocks. Your generated app ships a pile of these in `core_components.ex` — `<.input>`, `<.table>`, `<.flash>`, `<.icon>` — as ordinary code in your repo that you are expected to edit, not a gem to configure.',
        },
      ],
    },
    {
      heading: '7. Contexts — the part Rails developers fight',
      blocks: [
        {
          kind: 'p',
          text: 'This is the section to read twice. It is where most Rails-to-Phoenix friction lives, and the friction is almost always about a thing Rails fused that Phoenix splits.',
        },
        {
          kind: 'p',
          text: '`mix phx.gen.live Blog Post posts title:string body:text` generates two files that matter:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '# lib/my_app/blog/post.ex — the SCHEMA: what a row looks like\ndefmodule MyApp.Blog.Post do\n  use Ecto.Schema\n  import Ecto.Changeset\n\n  schema "posts" do\n    field :title, :string\n    field :body, :string\n    field :published, :boolean, default: false\n    timestamps(type: :utc_datetime)\n  end\n\n  @doc false\n  def changeset(post, attrs) do\n    post\n    |> cast(attrs, [:title, :body, :published])\n    |> validate_required([:title, :body])\n  end\nend',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: '# lib/my_app/blog.ex — the CONTEXT: what you can DO\ndefmodule MyApp.Blog do\n  @moduledoc "The Blog context."\n  import Ecto.Query, warn: false\n  alias MyApp.Repo\n  alias MyApp.Blog.Post\n\n  def list_posts, do: Repo.all(Post)\n  def get_post!(id), do: Repo.get!(Post, id)\n\n  def create_post(attrs) do\n    %Post{}\n    |> Post.changeset(attrs)\n    |> Repo.insert()\n  end\n\n  def update_post(%Post{} = post, attrs) do\n    post |> Post.changeset(attrs) |> Repo.update()\n  end\n\n  def delete_post(%Post{} = post), do: Repo.delete(post)\n\n  def change_post(%Post{} = post, attrs \\\\ %{}), do: Post.changeset(post, attrs)\nend',
        },
        {
          kind: 'p',
          text: 'An ActiveRecord model does three jobs at once: it maps a table, it validates, and it holds business logic. Phoenix splits those into three places — **schema** maps the table, **changeset** validates a proposed change, **context** holds the logic and is the public API.',
        },
        {
          kind: 'p',
          text: '**The context is the only door into a domain slice.** A controller or LiveView calls `Blog.create_post/1`. It does not call `Repo.insert/1`, and it should not know `Post` exists. The schema is an implementation detail of the context, the same way a table is an implementation detail of the schema.',
        },
        {
          kind: 'p',
          text: 'Three things people get stuck on:',
        },
        {
          kind: 'p',
          text: '**"This is just a service object."** Kind of — except it is the default rather than the escape hatch, and it is coarse-grained. Not one class per action (`CreatePostService`), but one module per bounded slice of the domain, with every operation on that slice as a function. `Accounts`, `Billing`, `Blog`. If you find yourself writing `Blog.PostCreator`, you have reinvented the thing Rails people reach for when models get fat, and missed the point.',
        },
        {
          kind: 'p',
          text: "**There is no `Context` module to inherit from.** Look at `blog.ex` again: it is a plain module with an alias and some functions. `mix phx.gen.context` is a code generator, nothing more. Phoenix provides zero runtime support for contexts, which means the discipline is entirely social — and also that there is nothing to fight when your domain does not fit the generator's shape. Delete the generated functions you do not want. They are yours.",
        },
        {
          kind: 'p',
          text: '**The naming is a design prompt, not a rule.** The generator will happily make a context per schema if you let it, which gets you a `Post` context and a `Comment` context and no benefit at all. The question the split is asking is "what are the four or five *areas* of this system, and what can you do in each?" — the same question DDD calls a bounded context. Getting it wrong initially is fine and expected; they are modules, and renaming a module is a find-and-replace.',
        },
        {
          kind: 'p',
          text: 'What you get for the discipline: a domain layer with no web types in it, which means you can call it from a LiveView, a controller, an Oban job, a mix task, and a test, identically. That is the whole trade.',
        },
      ],
    },
    {
      heading: '8. Ecto — not an ORM, and not trying to be',
      blocks: [
        { kind: 'heading', text: '`Repo` is the only thing that touches the database' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'Repo.all(Post)\nRepo.get!(Post, id)\nRepo.insert(changeset)\nRepo.update(changeset)\nRepo.delete(post)\nRepo.preload(post, :comments)',
        },
        {
          kind: 'p',
          text: 'There is no `Post.all`, no `post.save`, no `post.destroy`. A schema struct is inert data — it has no connection, no dirty tracking, no idea a database exists. Every trip to the database is a visible call to `Repo`.',
        },
        {
          kind: 'p',
          text: 'This one design choice removes an entire category of Rails bug. "Something saved a record and I cannot find what" is not a question you can have here, because saving requires the word `Repo` on the line that does it.',
        },
        { kind: 'heading', text: 'Changesets are data, not methods' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def changeset(post, attrs) do\n  post\n  |> cast(attrs, [:title, :body, :published])   # whitelist — this is strong_parameters\n  |> validate_required([:title, :body])\n  |> validate_length(:title, max: 200)\n  |> unique_constraint(:slug)\nend',
        },
        {
          kind: 'p',
          text: 'A changeset is a struct describing a *proposed* change: the original data, the casted changes, the errors, and whether it is valid. It is not a method on a model and it does not mutate anything. Three consequences, each one an aha.',
        },
        {
          kind: 'p',
          text: '**Different operations get different changesets.** Rails gives you one `validates` block plus `on: :create`, `if: :password_required?`, and a growing thicket of conditionals. Here you write `registration_changeset`, `email_changeset`, `password_changeset` — separate functions with separate rules. The generated `phx.gen.auth` code does exactly this, and it is worth reading for that reason alone.',
        },
        {
          kind: 'p',
          text: '**`cast/3` is `strong_parameters`, and it lives with the validations.** The whitelist of assignable fields is the first line of the changeset instead of a separate concern in the controller — which is the right place for it, since the rules for "what may be set" and "what must be true" are the same rules.',
        },
        {
          kind: 'p',
          text: "**A failed write hands the changeset back.** `Repo.insert/1` returns `{:ok, post}` or `{:error, changeset}`, and that changeset carries both the errors *and* the user's submitted input. That is the entire reason re-rendering a form after a failed save is a one-liner:",
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'case Blog.create_post(params) do\n  {:ok, post} ->\n    {:noreply, socket |> put_flash(:info, "Post created") |> push_navigate(to: ~p"/posts/#{post}")}\n\n  {:error, %Ecto.Changeset{} = changeset} ->\n    {:noreply, assign(socket, form: to_form(changeset))}\nend',
        },
        {
          kind: 'p',
          text: '`to_form/1` turns the changeset into something `<.input field={@form[:title]} />` renders with the right value, the right name, and the right error message attached. No `@post.errors.full_messages`, no re-fetching, no flash-and-redirect dance.',
        },
        { kind: 'heading', text: 'Queries are composable values' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'import Ecto.Query\n\nquery = from p in Post, where: p.published == true\n\nquery =\n  if term do\n    from p in query, where: ilike(p.title, ^"%#{term}%")\n  else\n    query\n  end\n\nquery |> order_by(desc: :inserted_at) |> limit(20) |> Repo.all()',
        },
        {
          kind: 'p',
          text: 'An `Ecto.Query` is a data structure. You can build it, pass it to another function, store it in a module attribute, and add to it — and nothing happens until a `Repo` call. ActiveRecord relations are lazy too, but they are lazy *proxies* that fire when something touches them, which is why `.to_a` placement matters and why relations leak into views and quietly run queries. Ecto queries cannot fire by accident; they are not connected to anything.',
        },
        {
          kind: 'p',
          text: 'Note the `^` on `^"%#{term}%"`: it is the pin operator from the Elixir guide, and here it means "this is a bound parameter from outside the query." Ecto uses it to separate query structure from user data, which is also why SQL injection through the query DSL is not really a thing.',
        },
        { kind: 'heading', text: 'No callbacks. None.' },
        {
          kind: 'p',
          text: 'There is no `before_save`, no `after_create`, no `around_destroy`. If creating a post should send an email, you write that in the context function:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def create_post(attrs) do\n  with {:ok, post} <- %Post{} |> Post.changeset(attrs) |> Repo.insert() do\n    Notifications.deliver_new_post(post)\n    {:ok, post}\n  end\nend',
        },
        {
          kind: 'p',
          text: "More lines than `after_create :notify`. Also the only place in the system where creating a post causes anything, findable with one grep, testable without stubbing a lifecycle, and inert when a test factory or a data migration inserts a row. Callbacks are the ActiveRecord feature that most reliably becomes the thing everyone is afraid of in a four-year-old codebase, and Ecto's answer is simply to not have them.",
        },
        { kind: 'heading', text: 'Associations never load themselves' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'post = Repo.get!(Post, id)\npost.comments\n# => #Ecto.Association.NotLoaded<association :comments is not loaded>\n\npost = Repo.get!(Post, id) |> Repo.preload(:comments)\npost.comments   # => [%Comment{}, ...]',
        },
        {
          kind: 'p',
          text: 'No lazy loading means **no accidental N+1 — ever.** In Rails, `posts.each { |p| p.comments }` in a view is a silent 200-query page. In Phoenix, that expression returns 200 `NotLoaded` structs and your page visibly breaks in development. The fix is `Repo.preload/2` or a `preload:` in the query. You pay for it by having to think about what you need; you are paid back by never shipping the other thing.',
        },
        { kind: 'heading', text: 'Transactions' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'Ecto.Multi.new()\n|> Ecto.Multi.insert(:user, User.changeset(%User{}, attrs))\n|> Ecto.Multi.insert(:profile, fn %{user: user} -> Profile.changeset(%Profile{}, user) end)\n|> Repo.transaction()\n# => {:ok, %{user: ..., profile: ...}} | {:error, :profile, changeset, changes_so_far}',
        },
        {
          kind: 'p',
          text: '`Ecto.Multi` is a transaction as a data structure — you build the list of operations, then run it. The error tuple tells you *which named step* failed and what had already succeeded, which is considerably better than catching `ActiveRecord::Rollback` and guessing. Use `Repo.transaction/1` with a plain function for simple cases; reach for `Multi` when there is more than one write or the steps depend on each other.',
        },
      ],
    },
    {
      heading: '9. LiveView',
      blocks: [
        {
          kind: 'p',
          text: 'The main event. A LiveView is a process on the server that holds your UI state and pushes HTML diffs to the browser over a websocket.',
        },
        { kind: 'heading', text: 'The lifecycle' },
        {
          kind: 'code',
          lang: 'text',
          code: 'HTTP GET → mount/3 (disconnected) → render/1 → static HTML sent, page paints\n        ↓\nwebsocket connects → mount/3 (connected!) → render/1 → diffs from here on\n        ↓\nuser clicks → handle_event/3 → new assigns → render/1 → diff pushed',
        },
        {
          kind: 'p',
          text: '**`mount/3` runs twice.** Once for the ordinary HTTP request — which is what makes the first paint fast and the page indexable — and again when the websocket connects. `connected?(socket)` tells you which one you are in:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def mount(_params, _session, socket) do\n  if connected?(socket) do\n    Journal.subscribe_entries(socket.assigns.current_scope)\n  end\n\n  {:ok,\n   socket\n   |> assign(:page_title, "Listing Entries")\n   |> stream(:entries, list_entries(socket.assigns.current_scope))}\nend',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The number one LiveView newcomer bug',
          text: 'Anything with an ongoing cost — a PubSub subscription, a timer, a `Process.monitor` — goes inside that `if connected?(socket)`. Skip the check and you subscribe twice, or subscribe a process that is about to be thrown away.',
        },
        { kind: 'heading', text: 'A LiveView is a GenServer' },
        {
          kind: 'p',
          text: 'Not "like" one. It is one, and everything from the Elixir guide transfers directly:',
        },
        {
          kind: 'table',
          headers: ['GenServer', 'LiveView'],
          rows: [
            ['state', '`socket.assigns`'],
            ['`handle_cast/2`', '`handle_event/3` (a browser event)'],
            ['`handle_info/2`', '`handle_info/2` (a message from anywhere in your app)'],
            ['`{:noreply, new_state}`', '`{:noreply, new_socket}`'],
          ],
        },
        {
          kind: 'p',
          text: "Which means: it processes one message at a time, in order. It can receive messages from any process in the system, not just the browser. It is supervised, so a crash kills that tab's state and the client reconnects and remounts. And — the part that bites — **slow work in `handle_event/3` freezes that user's entire UI**, because the loop is busy. For anything slow, `assign_async/3` or `start_async/3` runs the work in a separate task and delivers the result as a message.",
        },
        { kind: 'heading', text: 'What actually goes over the wire' },
        {
          kind: 'p',
          text: 'HEEx compiles your template into static segments and dynamic holes. The statics are sent once, at mount. After that, an update sends only the dynamic values that changed — often a few dozen bytes for a click.',
        },
        {
          kind: 'p',
          text: 'This is why HEEx must parse HTML, and why you cannot build a template by string concatenation. It is also why **change tracking depends on `assign`**: LiveView compares assigns between renders to decide what to re-send. Compute a value in the template instead of assigning it and it is recomputed and re-sent every time; mutate a nested struct outside of `assign` and the comparison may not notice.',
        },
        { kind: 'heading', text: 'Forms' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def render(assigns) do\n  ~H"""\n  <Layouts.app flash={@flash}>\n    <.header>{@page_title}</.header>\n\n    <.form for={@form} id="post-form" phx-change="validate" phx-submit="save">\n      <.input field={@form[:title]} type="text" label="Title" />\n      <.input field={@form[:body]} type="textarea" label="Body" />\n      <.button phx-disable-with="Saving..." variant="primary">Save Post</.button>\n    </.form>\n  </Layouts.app>\n  """\nend\n\ndef handle_event("validate", %{"post" => post_params}, socket) do\n  changeset = Blog.change_post(socket.assigns.post, post_params)\n  {:noreply, assign(socket, form: to_form(changeset, action: :validate))}\nend\n\ndef handle_event("save", %{"post" => post_params}, socket) do\n  case Blog.update_post(socket.assigns.post, post_params) do\n    {:ok, post} ->\n      {:noreply,\n       socket\n       |> put_flash(:info, "Post updated successfully")\n       |> push_navigate(to: ~p"/posts/#{post}")}\n\n    {:error, %Ecto.Changeset{} = changeset} ->\n      {:noreply, assign(socket, form: to_form(changeset))}\n  end\nend',
        },
        {
          kind: 'p',
          text: '`phx-change="validate"` fires on every keystroke, runs your *real* changeset, and re-renders the errors. Live validation with no client-side validation library, no duplicated rules, and no drift between what the browser checks and what the database will accept — because there is only one set of rules and the server owns it.',
        },
        {
          kind: 'p',
          text: '`phx-disable-with` handles the double-submit problem declaratively. The `{:error, changeset}` branch is the entire failure path.',
        },
        { kind: 'heading', text: 'Streams — for lists you do not want in memory' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'socket |> stream(:posts, Blog.list_posts())\n...\n{:noreply, stream_delete(socket, :posts, post)}\n{:noreply, stream_insert(socket, :posts, post, at: 0)}',
        },
        {
          kind: 'code',
          lang: 'heex',
          code: '<div id="posts" phx-update="stream">\n  <div :for={{dom_id, post} <- @streams.posts} id={dom_id}>{post.title}</div>\n</div>',
        },
        {
          kind: 'p',
          text: 'The naive approach — keeping a 10,000-item list in assigns — costs you that list in memory per connected user. A stream hands items to the client and forgets them server-side, keeping only DOM ids. This is why the generators use streams for index pages by default, and why the row helpers destructure `{_id, post}` tuples.',
        },
        { kind: 'heading', text: 'Navigation' },
        {
          kind: 'table',
          headers: ['Form', 'What it does'],
          rows: [
            [
              '`<.link navigate={~p"/posts"}>`',
              'Tear down this LiveView, mount another. No page reload.',
            ],
            [
              '`<.link patch={~p"/posts?page=2"}>`',
              'Same LiveView, new URL → `handle_params/3`. No remount.',
            ],
            ['`<.link href={~p"/logout"}>`', 'Ordinary full-page HTTP request.'],
            ['`push_navigate/2`, `push_patch/2`', 'The same two, from server code.'],
          ],
        },
        {
          kind: 'p',
          text: "`live_action` (set by the third argument in your router's `live` macro) is how one LiveView serves `:index`, `:new`, and `:edit` — you match on it in `handle_params` or `apply_action`.",
        },
        { kind: 'heading', text: 'Function components vs LiveComponents' },
        {
          kind: 'p',
          text: 'A **function component** (`<.header>`) is a function. No state, no process, no lifecycle. Use these for essentially everything.',
        },
        {
          kind: 'p',
          text: "A **LiveComponent** (`<.live_component module={...} id={...}>`) has its own state and lifecycle — and here is the part that surprises everyone: **it runs inside the parent LiveView's process.** It is not a separate process, it has no independent failure domain, and its `handle_event` blocks the parent just like the parent's own. It is a state-and-callback organising tool, not a concurrency tool. If you want a genuinely independent process, that is a separate LiveView (nested via `live_render/3`) or a GenServer.",
        },
        { kind: 'heading', text: 'JS commands — client-side behaviour without JavaScript' },
        {
          kind: 'code',
          lang: 'heex',
          code: '<.link phx-click={JS.push("delete", value: %{id: post.id}) |> hide("##{id}")}\n       data-confirm="Are you sure?">\n  Delete\n</.link>',
        },
        {
          kind: 'p',
          text: '`Phoenix.LiveView.JS` builds a list of client-side operations that run in the browser *immediately*, without a server round trip — hide the row now, tell the server after. That is optimistic UI, and it is the generated default. For genuinely custom JS you write a hook (`phx-hook`), which is the Stimulus-shaped escape hatch.',
        },
        { kind: 'heading', text: 'When not to use LiveView' },
        {
          kind: 'p',
          text: 'It needs a live websocket, so it is a poor fit for offline-capable apps, for pages that must work with JS disabled, and for highly interactive canvas or drawing work where a round trip per interaction is too slow. It is also not an API. Regular controllers and `mix phx.gen.json` are still there, and mixing both in one app is normal.',
        },
      ],
    },
    {
      heading: '10. Real-time: PubSub, Channels, Presence',
      blocks: [
        {
          kind: 'p',
          text: '`Phoenix.PubSub` is already in your supervision tree — look back at `application.ex`. Using it is two functions:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'Phoenix.PubSub.subscribe(MyApp.PubSub, "room:42")\nPhoenix.PubSub.broadcast(MyApp.PubSub, "room:42", {:new_message, msg})',
        },
        {
          kind: 'p',
          text: "Subscribing registers *your process* against a topic; broadcasting sends the message to every subscriber's mailbox. In a LiveView, those arrive at `handle_info/2`.",
        },
        {
          kind: 'p',
          text: 'The Rails equivalent requires Redis, because Rails processes cannot address each other. Here the registry is a process and the transport is the VM. And because `DNSCluster` is already in your children list, once you run more than one node they discover each other and **PubSub spans the cluster automatically** — no Redis, no adapter config, no extra infrastructure. This is the single biggest "oh" moment for a Rails developer who has maintained an ActionCable deployment.',
        },
        {
          kind: 'p',
          text: '**Channels** are the lower-level websocket API, for when the client is not a LiveView — a React app, iOS, a game. You write a `Channel` module with `join/3` and `handle_in/3`; the official JS/Swift/Kotlin clients handle reconnection and message queueing. `mix phx.gen.channel`.',
        },
        {
          kind: 'p',
          text: '**Presence** tracks who is connected to a topic, across the cluster, using CRDTs so nodes converge without a coordinator. Getting "who is in this room" right, including netsplits, is genuinely hard, and it is `mix phx.gen.presence` plus about twenty lines.',
        },
      ],
    },
    {
      heading: '11. Auth — generated code, not a gem',
      blocks: [
        {
          kind: 'code',
          lang: 'bash',
          code: 'mix phx.gen.auth Accounts User users',
        },
        {
          kind: 'p',
          text: 'Devise is a gem you configure and, eventually, fight. `phx.gen.auth` is a **generator that writes ~1,500 lines into your repo and then gets out of the way**: schema, changesets, session controller, LiveViews for registration/login/settings/confirmation, a `UserAuth` plug module, tests for all of it. There is no engine mounted, no DSL, no `devise :registerable, :confirmable`. When you need login to work differently, you edit the function.',
        },
        {
          kind: 'p',
          text: 'Phoenix 1.8 defaults to **magic-link login** (email a token, no password required to sign in), with passwords optional and sudo-mode re-authentication for sensitive actions. Read the generated `Accounts` context — it is the best worked example of multiple changesets per schema you will find.',
        },
        { kind: 'heading', text: 'Scopes — the 1.8 idea worth stealing' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyApp.Accounts.Scope do\n  @moduledoc """\n  Defines the scope of the caller to be used throughout the app.\n  """\n  alias MyApp.Accounts.User\n\n  defstruct user: nil\n\n  def for_user(%User{} = user), do: %__MODULE__{user: user}\n  def for_user(nil), do: nil\nend',
        },
        {
          kind: 'p',
          text: 'Rails gives you `current_user` — ambient state, reachable from a controller, often smuggled into models via `Current.user` or a thread local. Phoenix 1.8 makes the caller an explicit **argument**. Every scoped context function takes it first:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def list_entries(%Scope{} = scope) do\n  Repo.all_by(Entry, user_id: scope.user.id)\nend\n\ndef get_entry!(%Scope{} = scope, id) do\n  Repo.get_by!(Entry, id: id, user_id: scope.user.id)\nend\n\ndef update_entry(%Scope{} = scope, %Entry{} = entry, attrs) do\n  true = entry.user_id == scope.user.id\n  ...\nend',
        },
        {
          kind: 'p',
          text: 'Three things are happening there, and all three are worth noticing.',
        },
        {
          kind: 'p',
          text: 'The `%Scope{} = scope` in the head means a call without a scope **does not compile past the first test** — you cannot forget the caller, because the function will not match. Authorisation stops being a thing you remember and becomes a thing the shape of the code requires.',
        },
        {
          kind: 'p',
          text: '`Repo.all_by(Entry, user_id: scope.user.id)` means the tenant filter is inside the context, not in a controller `before_action` someone can skip. There is no way to reach the unscoped query from outside.',
        },
        {
          kind: 'p',
          text: 'And `true = entry.user_id == scope.user.id` is the Elixir guide\'s "`1 = x` is an assertion" idea doing real work: if that comparison is ever false, the function raises immediately rather than proceeding with someone else\'s record. It is a one-token assertion that turns an IDOR bug into a crash.',
        },
        {
          kind: 'p',
          text: 'The struct has one field today. It is designed to grow — org id, permissions, impersonation, API-key-vs-human — which turns "can this caller do this" into pattern matching rather than a permissions lookup scattered through the app.',
        },
        { kind: 'heading', text: 'The two-place rule again' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'pipeline :browser do\n  ...\n  plug :fetch_current_scope_for_user           # for HTTP requests\nend\n\nlive_session :require_authenticated_user,\n  on_mount: [{MyAppWeb.UserAuth, :require_authenticated}] do   # for LiveView\n  live "/users/settings", UserLive.Settings, :edit\nend',
        },
        {
          kind: 'p',
          text: 'Plugs for the HTTP boundary, `on_mount` for the LiveView boundary. Both, always.',
        },
      ],
    },
    {
      heading: '12. Testing',
      blocks: [
        {
          kind: 'p',
          text: 'ExUnit, no RSpec. Two generated case templates:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyApp.BlogTest do\n  use MyApp.DataCase          # database, no HTTP\n  ...\nend\n\ndefmodule MyAppWeb.PostControllerTest do\n  use MyAppWeb.ConnCase       # database + a %Plug.Conn{} and ~p routes\n  ...\nend',
        },
        { kind: 'heading', text: 'Genuinely parallel database tests' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'use MyApp.DataCase, async: true\n\ndef setup_sandbox(tags) do\n  pid = Ecto.Adapters.SQL.Sandbox.start_owner!(MyApp.Repo, shared: not tags[:async])\n  on_exit(fn -> Ecto.Adapters.SQL.Sandbox.stop_owner(pid) end)\nend',
        },
        {
          kind: 'p',
          text: "Each async test gets its own database connection wrapped in a transaction that is rolled back at the end. Tests run concurrently across every core, against one database, with no cleanup and no interference. Rails' parallel testing forks worker processes and gives each one its *own database* (`test-0`, `test-1`, ...) precisely because it cannot do this. Here it is one line per test module.",
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'The sandbox is Postgres-shaped',
          text: 'On MySQL or SQLite, leave `async` off.',
        },
        { kind: 'heading', text: 'Fixtures are functions' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def post_fixture(attrs \\\\ %{}) do\n  {:ok, post} =\n    attrs\n    |> Enum.into(%{title: "some title", body: "some body"})\n    |> MyApp.Blog.create_post()\n\n  post\nend',
        },
        {
          kind: 'p',
          text: 'No factory_bot, no DSL, no `FactoryBot.define`. The generator writes a plain function per schema into `test/support/fixtures/`, and it calls your real context function — so a fixture that stops working means your actual creation path is broken. Reach for a factory library later if you want traits and sequences; most apps do not.',
        },
        { kind: 'heading', text: 'Connection tests' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'test "lists all posts", %{conn: conn} do\n  conn = get(conn, ~p"/posts")\n  assert html_response(conn, 200) =~ "Listing Posts"\nend',
        },
        {
          kind: 'p',
          text: 'Note `~p` — verified routes work in tests too, so a test cannot reference a route that does not exist.',
        },
        { kind: 'heading', text: 'LiveView tests drive the real process' },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'test "saves new post", %{conn: conn} do\n  {:ok, lv, _html} = live(conn, ~p"/posts/new")\n\n  assert lv\n         |> form("#post-form", post: %{title: ""})\n         |> render_change() =~ "can&#39;t be blank"\n\n  assert {:ok, _lv, html} =\n           lv\n           |> form("#post-form", post: %{title: "Hello", body: "World"})\n           |> render_submit()\n           |> follow_redirect(conn, ~p"/posts")\n\n  assert html =~ "Post created successfully"\nend',
        },
        {
          kind: 'p',
          text: 'No browser, no Selenium, no Capybara, no flakiness — and yet this is a *real* integration test: it mounts the actual LiveView process, sends it actual events, and asserts on actual rendered HTML.',
        },
        {
          kind: 'p',
          text: "This is the thing that is hard to replicate elsewhere. Testing a Turbo or React UI at this level means driving a browser, because the state lives in the browser. LiveView's state lives in a process on the same machine as the test, so the test can just talk to it. A freshly generated app with `phx.gen.auth` and one scaffold ships with about 126 passing tests you did not write.",
        },
      ],
    },
    {
      heading: '13. Everything else Rails gave you',
      blocks: [
        {
          kind: 'table',
          headers: ['Rails', 'Phoenix', 'Note'],
          rows: [
            ['Rack', 'Plug', 'same idea, sharper edges'],
            ['Puma / Unicorn', 'Bandit', 'pure Elixir, in-process, no separate server'],
            ['ActiveRecord', 'Ecto', 'see §8'],
            [
              'ActiveJob / Sidekiq',
              'Oban',
              'Postgres-backed, no Redis; or plain `Task`/GenServer for trivia',
            ],
            ['ActionMailer', 'Swoosh', '`mix phx.gen.notifier`; dev inbox at `/dev/mailbox`'],
            ['ActionCable', 'Channels / LiveView', 'see §10'],
            [
              'ActiveStorage',
              '*(nothing built in)*',
              'LiveView uploads + S3 direct; `Waffle` if you want a library',
            ],
            [
              'Sprockets / Webpacker / importmap',
              'esbuild + Tailwind',
              '**no Node.js required** — both ship as precompiled binaries',
            ],
            ['RSpec / Minitest', 'ExUnit', 'see §12'],
            ['factory_bot', 'plain fixture functions', 'see §12'],
            ['I18n', 'Gettext', 'standard `.po` files, `mix gettext.extract`'],
            ['Rails engines', 'a library + a `scope`/`forward`', 'no engine machinery needed'],
            ['`rails c`', '`iex -S mix`', 'attaches to the *running* system'],
            ['`rails routes`', '`mix phx.routes`', ''],
            ['`rails db:migrate`', '`mix ecto.migrate`', 'migrations look nearly identical'],
            ['credentials / dotenv', '`config/runtime.exs` + env vars', 'see §14'],
            ['Rubocop', '`mix format` + Credo', 'format is built in and canonical'],
            ['New Relic / Scout', 'Telemetry + LiveDashboard', '`/dev/dashboard` out of the box'],
          ],
        },
        {
          kind: 'p',
          text: '**No Node in a default Phoenix app.** `esbuild` and `tailwind` are Hex packages that download a platform binary; `mix assets.build` runs them. There is no `package.json`, no `node_modules`, no asset pipeline to debug on deploy. 1.8 also ships daisyUI on top of Tailwind, which is why the generated components have real styling.',
        },
        {
          kind: 'p',
          text: '**LiveDashboard is not a gem you add later.** `/dev/dashboard` gives you request metrics, every process in the VM with its memory and message queue, ETS tables, and a live Ecto query view. Since it is a LiveView, you can put it behind auth and run it in production. Finding a leaking process by sorting the process list by mailbox size is a debugging move with no Rails equivalent.',
        },
      ],
    },
    {
      heading: '14. Config and deployment',
      blocks: [
        { kind: 'heading', text: 'Four config files, and one that is different' },
        {
          kind: 'code',
          lang: 'text',
          code: 'config/config.exs      compile time, all environments\nconfig/dev.exs         compile time, dev\nconfig/test.exs        compile time, test\nconfig/prod.exs        compile time, prod\nconfig/runtime.exs     RUNTIME — every environment, on boot',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The most common Phoenix production bug',
          text: 'Everything except `runtime.exs` is evaluated at compile time, and the values are baked into the compiled artifact. Read a secret from `System.get_env/1` in `prod.exs` and you have read the environment of the *build machine*. Anything that varies per deploy — database URL, secret key base, API keys, host — goes in `config/runtime.exs`.',
        },
        {
          kind: 'p',
          text: 'The legitimate use of compile-time config is deciding what code to compile at all. The generated router does exactly that:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'if Application.compile_env(:my_app, :dev_routes) do\n  scope "/dev" do\n    live_dashboard "/dashboard", metrics: MyAppWeb.Telemetry\n    forward "/mailbox", Plug.Swoosh.MailboxPreview\n  end\nend',
        },
        {
          kind: 'p',
          text: '`compile_env/2` (rather than `get_env/2`) is the honest spelling — it records the value at compile time and makes the runtime complain if it later disagrees.',
        },
        { kind: 'heading', text: 'Releases' },
        {
          kind: 'code',
          lang: 'bash',
          code: 'mix phx.gen.release --docker    # writes a Dockerfile and release scripts\nMIX_ENV=prod mix release        # a self-contained tarball\n_build/prod/rel/my_app/bin/my_app start',
        },
        {
          kind: 'p',
          text: 'A release bundles your compiled code *and the Erlang VM* into a directory that runs with no Elixir, no Mix, no Hex, and no build toolchain on the target. There is no Bundler on the server, no Passenger, no `RAILS_ENV=production bundle exec`. Start it and it is serving.',
        },
        {
          kind: 'p',
          text: '`bin/my_app remote` opens an IEx shell attached to the running production node — the same REPL from §2, on the live system. Use with the appropriate respect.',
        },
        { kind: 'heading', text: 'Clustering, for free' },
        {
          kind: 'p',
          text: '`DNSCluster` is already in your supervision tree. Point it at a headless service (`MY_APP_HEADLESS.namespace.svc.cluster.local`) and your nodes find each other, form an Erlang cluster, and PubSub starts spanning them. Multi-node real-time with zero additional infrastructure — no Redis, no message broker, no sticky sessions.',
        },
      ],
    },
    {
      heading: '15. Gotchas that will bite you',
      blocks: [
        {
          kind: 'list',
          items: [
            '**`mount/3` runs twice.** Guard subscriptions, timers, and expensive work with `if connected?(socket)`.',
            '**Router pipelines do not run on LiveView events.** Auth needs a plug *and* an `on_mount`. This one is a security bug, not an inconvenience.',
            '**`conn` is immutable.** `put_resp_header(conn, ...)` returns a new conn; ignore the return value and nothing happens. Pipe everything.',
            '**`redirect/2` does not stop the plug chain.** You need `|> halt()`.',
            '**Compile-time config.** Secrets read outside `runtime.exs` come from the build machine.',
            '**Change tracking follows `assign`.** Computing in the template instead of assigning means it re-renders and re-sends every time.',
            "**A LiveComponent runs in the parent's process.** It is not isolation or concurrency; it is code organisation.",
            "**Slow work in `handle_event/3` freezes that user's UI.** It is a GenServer. Use `assign_async/3` or `start_async/3`.",
            '**Unhandled messages crash a LiveView.** Any process can send yours anything; without a matching `handle_info/2` clause, it dies. Add a catch-all if you subscribe to chatty topics.',
            '**`~p` mistakes are warnings, not errors.** Run `mix compile --warnings-as-errors` in CI — the generated `mix precommit` alias already does.',
            '**Associations are `NotLoaded` until preloaded.** Not a bug; the point. `Repo.preload/2`.',
            '**Do not call `Repo` from `_web`.** The moment a LiveView does its own query, the context boundary is decoration.',
            '**Do not let the app call into `_web`.** Same rule, more damaging: it is what makes the domain reusable.',
            '**`phx.gen.live` gives you a starting point, not an architecture.** Real domains have `publish_post`, not `update_post(post, %{published: true})`.',
            '**Flash in LiveView needs `put_flash/3` *and* a rendered `<.flash_group>`.** The layout does it; a custom layout might not.',
            '**`push_navigate` vs `push_patch`.** Patch stays in the same LiveView and calls `handle_params/3`; navigate tears down and remounts. Using navigate for pagination throws away all your state.',
          ],
        },
      ],
    },
    {
      heading: '16. A worked example',
      blocks: [
        {
          kind: 'p',
          text: 'This is the generated output of `mix phx.gen.live Journal Entry entries title:string body:text` in an app that already ran `phx.gen.auth` — so the generator produces the scoped, real-time version. It is about forty lines, and it is a complete multi-user live-updating feature.',
        },
        {
          kind: 'p',
          text: '**The context** — authorisation, persistence, and broadcasting, all behind one public API:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyApp.Journal do\n  @moduledoc "The Journal context."\n\n  import Ecto.Query, warn: false\n  alias MyApp.Repo\n  alias MyApp.Journal.Entry\n  alias MyApp.Accounts.Scope\n\n  def subscribe_entries(%Scope{} = scope) do\n    Phoenix.PubSub.subscribe(MyApp.PubSub, "user:#{scope.user.id}:entries")\n  end\n\n  defp broadcast_entry(%Scope{} = scope, message) do\n    Phoenix.PubSub.broadcast(MyApp.PubSub, "user:#{scope.user.id}:entries", message)\n  end\n\n  def list_entries(%Scope{} = scope) do\n    Repo.all_by(Entry, user_id: scope.user.id)\n  end\n\n  def get_entry!(%Scope{} = scope, id) do\n    Repo.get_by!(Entry, id: id, user_id: scope.user.id)\n  end\n\n  def create_entry(%Scope{} = scope, attrs) do\n    with {:ok, entry = %Entry{}} <-\n           %Entry{}\n           |> Entry.changeset(attrs, scope)\n           |> Repo.insert() do\n      broadcast_entry(scope, {:created, entry})\n      {:ok, entry}\n    end\n  end\n\n  def update_entry(%Scope{} = scope, %Entry{} = entry, attrs) do\n    true = entry.user_id == scope.user.id\n\n    with {:ok, entry = %Entry{}} <-\n           entry\n           |> Entry.changeset(attrs, scope)\n           |> Repo.update() do\n      broadcast_entry(scope, {:updated, entry})\n      {:ok, entry}\n    end\n  end\nend',
        },
        {
          kind: 'p',
          text: '**The schema** — the scope reaches in here too, so ownership cannot be set from params:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'defmodule MyApp.Journal.Entry do\n  use Ecto.Schema\n  import Ecto.Changeset\n\n  schema "entries" do\n    field :title, :string\n    field :body, :string\n    field :user_id, :id\n    timestamps(type: :utc_datetime)\n  end\n\n  @doc false\n  def changeset(entry, attrs, user_scope) do\n    entry\n    |> cast(attrs, [:title, :body])          # user_id is NOT castable\n    |> validate_required([:title, :body])\n    |> put_change(:user_id, user_scope.user.id)\n  end\nend',
        },
        {
          kind: 'p',
          text: '**The LiveView** — subscribe on connect, re-render on broadcast:',
        },
        {
          kind: 'code',
          lang: 'elixir',
          code: 'def mount(_params, _session, socket) do\n  if connected?(socket) do\n    Journal.subscribe_entries(socket.assigns.current_scope)\n  end\n\n  {:ok,\n   socket\n   |> assign(:page_title, "Listing Entries")\n   |> stream(:entries, list_entries(socket.assigns.current_scope))}\nend\n\ndef handle_event("delete", %{"id" => id}, socket) do\n  entry = Journal.get_entry!(socket.assigns.current_scope, id)\n  {:ok, _} = Journal.delete_entry(socket.assigns.current_scope, entry)\n  {:noreply, stream_delete(socket, :entries, entry)}\nend\n\ndef handle_info({type, %MyApp.Journal.Entry{}}, socket)\n    when type in [:created, :updated, :deleted] do\n  {:noreply,\n   stream(socket, :entries, list_entries(socket.assigns.current_scope), reset: true)}\nend',
        },
        { kind: 'heading', text: 'What just happened' },
        {
          kind: 'p',
          text: 'Open this page in two tabs. Create an entry in one, and the other updates — no polling, no JavaScript, no Redis, no ActionCable configuration. That behaviour is entirely accounted for by three lines: the `subscribe_entries` in `mount`, the `broadcast_entry` in `create_entry`, and the `handle_info` clause.',
        },
        {
          kind: 'p',
          text: "Read it again for the things that *are not* there. No `current_user` global — the scope is an argument, and `%Scope{} = scope` in every head means you cannot omit it. No authorisation in the web layer — `list_entries` can only return your rows, and `update_entry`'s `true = ...` assertion turns an ownership mismatch into an immediate crash. No `after_create` callback — `create_entry` broadcasts because the line is there, visible, in the one function that creates entries. No N+1, because nothing loads itself. No nested conditionals — `with` handles the failure path by falling through, and `{:error, changeset}` flows back to the form untouched.",
        },
        {
          kind: 'p',
          text: 'And notice the shape of the whole thing: `handle_event` and `handle_info` are the same kind of function. A click from this user\'s browser and a broadcast from another user\'s request arrive at the same process, as messages, and are handled the same way. Once you see that, "real-time" stops being a feature you add and becomes the ordinary case.',
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
            '**Generate an app and read every generated line.** `mix phx.new demo && cd demo && mix phx.gen.auth Accounts User users && mix phx.gen.live Blog Post posts title:string body:text`. An hour spent reading `accounts.ex` and `user_auth.ex` is worth three tutorials.',
            '**The official Phoenix guides.** Genuinely excellent, and unusually honest about tradeoffs. Read the "Contexts" and "Ecto" pages even if you skip the rest.',
            '**"Programming Phoenix LiveView" (Bruce Tate & Sophie DeBenedetto)** for LiveView in depth, and **"Programming Ecto" (Darin Wilson & Eric Meadows-Jönsson)** for the part that will otherwise take you longest.',
            "**Chris McCord's LiveView talks.** Watching someone build a multiplayer feature in ten minutes is what makes the process model click.",
            "**Read your app's generated `AGENTS.md`.** Phoenix 1.8 ships one — a concise statement of current house style.",
            '**Turn on `mix precommit` from day one** so warnings-as-errors catches your `~p` typos while they are still cheap.',
          ],
        },
        {
          kind: 'p',
          text: 'Plan for this rhythm: the router, controllers, and generators will feel familiar in an afternoon. Contexts and Ecto changesets will feel like extra work for two weeks and then like the reason your four-year-old app is still pleasant. LiveView will take longer, because the thing to learn is not its API — it is thinking of a page as a supervised process that happens to have a browser attached. That last shift is the one Rails cannot give you, and it is what the trip is for.',
        },
      ],
    },
  ],
  takeaways: [
    'Your app is an OTP application that contains a web endpoint, not an app living inside a framework — the database pool, PubSub, and HTTP server are peers in one supervision tree.',
    'Everything in the request path is a plug: a function from `%Plug.Conn{}` to `%Plug.Conn{}`. Middleware, filters, and actions collapse into one concept.',
    '`lib/my_app` is the domain and `lib/my_app_web` is one interface onto it. The web layer may call the app; the app must never call the web layer.',
    'Ecto splits what ActiveRecord fuses: a schema maps the table, a changeset validates a proposed change, a context is the public API, and only `Repo` touches the database. No callbacks, no lazy loading, no accidental N+1.',
    'A LiveView is a GenServer with a browser attached — `socket.assigns` is its state, `handle_event/3` and `handle_info/2` are its loop, and `mount/3` runs twice.',
    'Router pipelines protect only the initial HTTP request. LiveView events bypass them, so authentication needs both a plug and an `on_mount` hook.',
    'Phoenix 1.8 scopes make the caller an explicit first argument, so authorisation becomes a pattern match the compiler and the runtime both enforce.',
  ],
  goDeeper: [
    { label: 'Phoenix — official guides', url: 'https://hexdocs.pm/phoenix/overview.html' },
    { label: 'Phoenix LiveView documentation', url: 'https://hexdocs.pm/phoenix_live_view/' },
    { label: 'Ecto documentation', url: 'https://hexdocs.pm/ecto/Ecto.html' },
    { label: 'Plug documentation', url: 'https://hexdocs.pm/plug/readme.html' },
  ],
}
