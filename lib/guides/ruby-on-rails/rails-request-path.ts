import type { Lesson } from '../types'

export const railsRequestPath: Lesson = {
  slug: 'rails-request-path',
  title: 'How Rails Handles a Request',
  tagline: 'How Puma, Rack, middleware, engines, and gems fit together.',
  intro:
    'Routes, controllers, models, and views handle your application’s work. But how does a browser request reach that code? Follow the request through the server and into Rails, then see where each piece is configured.',
  minutes: 10,
  sections: [
    {
      heading: 'The pieces and their responsibilities',
      blocks: [
        {
          kind: 'list',
          items: [
            '**Puma** accepts HTTP connections and runs your Ruby web application.',
            '**Rack** defines the interface between a Ruby web server and application code.',
            'A **Rack application** accepts a request environment and returns a response through that interface.',
            '**Rack middleware** wraps another Rack application to inspect, change, or answer requests.',
            'A **Rails engine** integrates reusable Rails functionality into a host application.',
            'A **Ruby gem** packages Ruby code for distribution and reuse.',
          ],
        },
        {
          kind: 'p',
          text: 'These are different responsibilities, so one library can fit several categories. A gem might contain middleware, an engine, or both. Rails itself is a Rack application.',
        },
      ],
    },
    {
      heading: 'Puma connects HTTP to Ruby',
      blocks: [
        { kind: 'code', lang: 'sh', code: 'bin/rails server' },
        {
          kind: 'p',
          text: 'This normally starts Puma. It listens on a port, accepts HTTP requests, calls your application through Rack, and sends the response to the client. Your Rails code runs inside Puma’s application-serving process.',
        },
        {
          kind: 'p',
          text: 'Puma uses **threads** to handle multiple requests in progress within one process. In cluster mode, it runs multiple **worker processes**. Each worker runs its own copy of your Rails application; the threads within that worker share its application memory.',
        },
        {
          kind: 'p',
          text: '**Puma manages the request thread pool**: how many threads are available and which requests they handle. **CRuby (MRI)**, the usual Ruby interpreter, manages their turns executing Ruby code through the **Global VM Lock (GVL)**. The operating system also schedules the underlying threads.',
        },
        {
          kind: 'p',
          text: 'The GVL allows only one thread per worker to execute Ruby code at a time, but **a request does not need to finish before another runs**. Threads take turns, and a thread waiting for a database query or an external API response can release the lock so another can execute Ruby code.',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            'Request A runs Ruby code, then waits for a database query.',
            'Request B runs Ruby code in another thread while A waits.',
            'A’s query returns; A resumes when its thread gets a turn.',
          ],
        },
        {
          kind: 'p',
          text: 'Both requests are in progress together, even though their Ruby code is not executing simultaneously. Threads help use waiting time; they do not make Ruby-heavy calculations run in parallel within one worker.',
        },
        {
          kind: 'p',
          text: 'Each worker has its own lock, so separate workers can execute Ruby code at the same time on different CPU cores. For example, two workers with five request threads each can handle up to ten requests in progress, with up to two threads executing Ruby code at once.',
        },
        {
          kind: 'p',
          text: 'More concurrency increases demand on memory and resources such as database connections. Settings belong in `config/puma.rb` and should match the deployment. A production reverse proxy or load balancer may sit in front of Puma.',
        },
      ],
    },
    {
      heading: 'Rack is a calling convention',
      blocks: [
        {
          kind: 'p',
          text: 'A Rack application is a Ruby object with a `call(env)` method. The environment hash contains request information, such as `REQUEST_METHOD` and `PATH_INFO`. The method returns three elements: status, headers, and body.',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: 'class HelloApp\n  def call(env)\n    [\n      200,\n      { "content-type" => "text/plain" },\n      ["Hello from Ruby!\\n"]\n    ]\n  end\nend',
        },
        {
          kind: 'p',
          text: 'This is a complete Rack application without Rails. `200` is the HTTP status; the hash contains response headers; the array supplies the body’s text. A normal enumerable Rack body yields strings rather than being a bare string itself. The lowercase header names follow Rack 3’s requirements.',
        },
      ],
    },
    {
      heading: 'Middleware wraps the next application',
      blocks: [
        {
          kind: 'p',
          text: 'Middleware follows the same interface but holds a reference to the next application. It can do work before delegating, modify the returned response, or respond immediately.',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: '# lib/middleware/add_lesson_header.rb\nclass AddLessonHeader\n  def initialize(app)\n    @app = app\n  end\n\n  def call(env)\n    status, headers, body = @app.call(env)\n\n    [status, headers.merge("x-lesson" => "rails-request-path"), body]\n  end\nend',
        },
        {
          kind: 'p',
          text: 'Here, `@app.call(env)` delegates to the next application. The middleware adds a header to its response and preserves the status and body. Wrapping `HelloApp.new` in `AddLessonHeader.new(...)` would apply this behavior to the earlier example.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Requests go in; responses unwind',
          text: 'With `A(B(endpoint))`, the request enters A, then B, then the endpoint. The response tuple returns through B, then A. If A responds immediately, B and the endpoint never run. Returning the tuple does not mean the body has already reached the browser; body delivery can happen afterward.',
        },
      ],
    },
    {
      heading: 'Adding middleware to Rails',
      blocks: [
        {
          kind: 'p',
          text: 'Load the custom class and register it in your existing application configuration. `YourApp` below represents your application’s module name; keep its other configuration.',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: '# config/application.rb\n# Add alongside the existing requires:\nrequire_relative "../lib/middleware/add_lesson_header"\n\nmodule YourApp\n  class Application < Rails::Application\n    config.middleware.use AddLessonHeader\n  end\nend',
        },
        {
          kind: 'p',
          text: '`require_relative` loads the class; `config.middleware.use` appends it to Rails’ middleware stack, before the router. Rails supplies the next application to `initialize(app)` when building the stack. On incoming requests, middleware ahead of yours runs first. On responses, that order reverses.',
        },
        {
          kind: 'p',
          text: 'Choose placement based on dependencies. For example, code that needs Rails’ request ID should run after the middleware that assigns it. Use this instead of the `use` registration:',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: 'config.middleware.insert_after ActionDispatch::RequestId, AddLessonHeader',
        },
        {
          kind: 'p',
          text: '`insert_before` places it before an existing middleware. Application-wide registration belongs in `config/application.rb`; environment-specific registration can go in `config/environments/production.rb`, for example. Inspect the final order, including gem additions, with `bin/rails middleware`.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Middleware stays loaded',
          text: 'Restart the server after changing middleware. If your application uses `config.autoload_lib`, add `middleware` to its existing ignore list: this example loads that directory explicitly, outside Rails’ reloading mechanism.',
        },
      ],
    },
    {
      heading: 'Engines contribute Rails functionality',
      blocks: [
        {
          kind: 'p',
          text: 'An engine can contribute controllers, models, views, routes, assets, and initializers. Imagine a reusable support center whose engine declares an isolated namespace:',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: 'module SupportCenter\n  class Engine < Rails::Engine\n    isolate_namespace SupportCenter\n  end\nend',
        },
        {
          kind: 'p',
          text: 'Mount its routes in the host application’s `config/routes.rb`, using a clear URL prefix. Routes are matched in order, so consider overlapping routes when choosing the mount’s position.',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: '# config/routes.rb\nRails.application.routes.draw do\n  mount SupportCenter::Engine => "/support"\nend',
        },
        {
          kind: 'p',
          text: 'The host router can now send `/support/articles` into the engine’s routes. The engine shares the host’s application-serving processes; mounting creates no server or port. Namespace isolation prevents naming collisions, but does not create a security boundary or separate memory.',
        },
        {
          kind: 'p',
          text: 'Engines that only contribute other functionality need no route mount. You may also encounter **Railtie**, Rails’ basic extension mechanism for configuration, initializers, and tasks. Engines build on it with application-like capabilities.',
        },
      ],
    },
    {
      heading: 'Gems package the code',
      blocks: [
        {
          kind: 'p',
          text: 'A gem packages Ruby code with a name, version, and dependencies. It might provide a general-purpose library, Puma itself, middleware, or an engine. “Gem” describes packaging; “middleware” and “engine” describe what the code does.',
        },
        {
          kind: 'p',
          text: 'A middleware gem included in your bundle does not necessarily enter Rails’ stack automatically. Some gems register through a Railtie or engine; others need explicit configuration. Follow the gem’s instructions to avoid duplicate registration.',
        },
        {
          kind: 'p',
          text: 'For example, the `rack-cors` gem provides `Rack::Cors`. Once the gem is available and loaded, an initializer registers it and configures which browser origins may read matching responses:',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: '# config/initializers/cors.rb\nRails.application.config.middleware.insert_before 0, Rack::Cors do\n  allow do\n    origins "https://frontend.example.com"\n    resource "/api/*", headers: :any, methods: [:get]\n  end\nend',
        },
        {
          kind: 'p',
          text: 'The example origin and paths should match your application. `insert_before 0` places CORS middleware first so it can apply headers even when downstream middleware responds early. The gem supplies the code; the initializer configures its place and behavior in the stack.',
        },
      ],
    },
    {
      heading: 'config.ru connects the server to Rails',
      blocks: [
        {
          kind: 'p',
          text: '`config.ru` is the Rack startup file that tells a server such as Puma which application to serve. A modern Rails-generated file contains:',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: 'require_relative "config/environment"\n\nrun Rails.application\nRails.application.load_server',
        },
        {
          kind: 'list',
          items: [
            '`require_relative` loads and initializes Rails.',
            '`run Rails.application` identifies the Rack application that receives requests.',
            '`Rails.application.load_server` runs Rails’ server-specific startup hooks.',
          ],
        },
        {
          kind: 'p',
          text: 'This file is evaluated during startup, rather than on every request. Rack also supports `use SomeMiddleware` before `run`: that wraps the entire Rails application, outside Rails’ own middleware stack.',
        },
        {
          kind: 'p',
          text: 'For ordinary Rails middleware, prefer `config.middleware` so you can position it among Rails’ components and inspect it with `bin/rails middleware`. Reserve `config.ru` customization for deliberately composing applications or middleware outside Rails. Engine route mounts belong in Rails’ routes file.',
        },
      ],
    },
    {
      heading: 'Follow one request',
      blocks: [
        {
          kind: 'code',
          lang: 'text',
          code: 'Browser\n  → Puma\n    → Optional middleware added by config.ru\n      → Rails.application\n        → Rails middleware stack\n          → Rails router\n            → Host controller or mounted engine',
        },
        {
          kind: 'p',
          text: 'For `/support/articles`, Puma invokes the application assembled at startup. Middleware handles or delegates the request. If it reaches the host router, the `/support` mount directs it into the engine. Its endpoint returns a response through the surrounding middleware, and Puma sends it to the client.',
        },
        {
          kind: 'p',
          text: 'Gems and engines help assemble the application at startup. Rack defines how its pieces call one another. Middleware participates in request handling, and Puma connects that Ruby code to HTTP clients.',
        },
      ],
    },
  ],
  takeaways: [
    'Puma serves the application; Rack defines the interface it calls. Rails is a Rack application.',
    'Middleware wraps the next application. Requests enter in stack order; responses unwind in reverse, and early responses can skip downstream code.',
    '`config.middleware.use` appends middleware. Use relative insertion when order matters, and inspect the final stack with `bin/rails middleware`.',
    'Mount engine routes in `config/routes.rb`. A mounted engine normally shares the host’s server processes.',
    'Gems package code, which may include middleware or engines. Registration may be automatic or explicitly configured.',
    '`config.ru` connects the server to the Rack application; normal Rails middleware configuration belongs inside Rails.',
  ],
  goDeeper: [
    { label: 'Puma documentation', url: 'https://puma.io/puma/' },
    { label: 'Rack 3.2 specification', url: 'https://rack.github.io/rack/3.2/SPEC_rdoc.html' },
    { label: 'Rails on Rack', url: 'https://guides.rubyonrails.org/rails_on_rack.html' },
    { label: 'Rails engines', url: 'https://guides.rubyonrails.org/engines.html' },
    { label: 'What is a gem?', url: 'https://guides.rubygems.org/what-is-a-gem/' },
    {
      label: 'Rack::Cors configuration',
      url: 'https://github.com/cyu/rack-cors#rails-configuration',
    },
    {
      label: 'Rails autoloading and reloading',
      url: 'https://guides.rubyonrails.org/autoloading_and_reloading_constants.html',
    },
    {
      label: 'Rack::Builder and config.ru',
      url: 'https://rack.github.io/rack/3.2/Rack/Builder.html',
    },
    {
      label: 'Rails-generated config.ru',
      url: 'https://github.com/rails/rails/blob/main/railties/lib/rails/generators/rails/app/templates/config.ru.tt',
    },
  ],
}
