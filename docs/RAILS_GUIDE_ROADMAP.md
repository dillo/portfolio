# Rails Guide Roadmap

Topic ideas for working Rails developers who want to understand the mechanisms behind everyday code. Each guide should also be approachable for someone learning Rails.

## Editorial approach

- Start with a practical question or surprising behavior.
- Follow one request, query, job, or piece of data through the system.
- Explain which component owns each responsibility and where configuration belongs.
- Use small examples and distinguish development from production when relevant.
- Keep each lesson focused; link to deeper material instead of becoming an installation tutorial.
- Check version-specific behavior against current official documentation when drafting.

## Existing guides

- Rails Asset Pipelines: Sprockets, Propshaft, and development versus production.
- How Rails Handles a Request: Puma, Rack, middleware, engines, and gems.

## Rails under the hood

### 1. How Puma Runs Your Rails Application

**Anchor question:** What actually happens when several requests reach my Rails application at once?

Cover the master process, workers, thread pools, and where Rails runs. Explain how Puma, CRuby’s Global VM Lock, and the operating system cooperate, and what happens when every request thread is busy. Connect worker and thread counts to database connection pools and the `workers` and `threads` settings in `config/puma.rb`. Introduce preloading, memory, graceful shutdowns, and restarts.

Place this guide immediately after the request-path introduction and before database connection pools. Keep the existing guide’s Puma overview brief; use this dedicated lesson for the deeper explanation.

[Puma documentation](https://puma.io/puma/)

### 2. How Rails Loads Your Code

**Anchor question:** Why does this work in development but fail when the application boots in production?

Cover Zeitwerk, file-to-constant naming, autoloading, eager loading, and reloading. Explain why controller edits appear immediately while middleware changes require a restart, and how stale class references arise.

[Rails autoloading guide](https://guides.rubyonrails.org/autoloading_and_reloading_constants.html)

### 3. How Rails Shares Database Connections

**Anchor question:** Why are requests waiting for a connection when the database is not running a slow query?

Connect Puma workers and threads to Active Record connection pools. Explain borrowing and returning connections, pool exhaustion, and total database demand across web and background job processes. Use one simple deployment example.

[Active Record connection pools](https://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/ConnectionPool.html)

### 4. When Active Record Actually Runs SQL

**Anchor question:** Which line hits the database, and why did this loop execute 100 queries?

Follow a relation from `User.where(...)` to loaded Ruby objects. Cover lazy evaluation, association loading, N+1 queries, and the different purposes of `joins`, `includes`, and `preload`.

[Active Record query interface](https://guides.rubyonrails.org/active_record_querying.html)

### 5. Background Jobs: What Happens After perform_later?

**Anchor question:** Which process runs this job, and what happens if it fails halfway through?

Distinguish Active Job from backends such as Solid Queue and Sidekiq. Follow enqueueing, argument serialization, queue storage, worker execution, and completion. Explain web versus job processes, retries, idempotency, and transaction timing. Keep backend-specific guarantees explicit.

This was previously titled “What Happens After perform_later?”; background jobs are now explicit in the title.

[Active Job guide](https://guides.rubyonrails.org/active_job_basics.html)

### 6. What a Database Transaction Actually Protects

**Anchor question:** How did the email get sent when the record was rolled back?

Explain commit and rollback, `after_save` versus `after_commit`, and the boundary between database changes and external effects such as emails or API calls. Include a short note on nested transactions and savepoints.

[Active Record transactions](https://api.rubyonrails.org/classes/ActiveRecord/Transactions/ClassMethods.html)

### 7. Where Rails Caches Actually Live

**Anchor question:** Why does one request see the cached value while another does not?

Distinguish query caching, fragment caching, and `Rails.cache`. Explain keys, expiration, invalidation, and process-local versus shared cache stores. Keep browser and CDN caching for the HTTP caching lesson.

[Rails caching guide](https://guides.rubyonrails.org/caching_with_rails.html)

### 8. What Happens When Rails Boots?

**Anchor question:** Where should this configuration go, and when does it run?

Trace `config/boot.rb`, Bundler, `config/application.rb`, environment configuration, and initializers. Connect gems, Railties, and engines to startup order. Explain which work runs once at boot versus during requests.

[Rails initialization guide](https://guides.rubyonrails.org/initialization.html)

### 9. Class Methods, Shared State, and Request Safety

**Anchor question:** Why are class variables risky in Rails, and are class methods safe to use?

Follow two overlapping requests through a class method that stores the current user on the class, showing how one request can overwrite another's value. Distinguish method placement from data ownership: arguments and local variables, instance variables on a request's controller instance, class instance variables (`@user` inside a class method), and class variables (`@@user`). Explain what `self` refers to in each example and why changing `@@user` to `@user` inside a class method does not make the value private to a request.

Define atomicity with an assignment followed by a read, and explain why the GVL does not protect that entire sequence. Cover state persisting between requests, class-variable sharing across inheritance, and separate state in different Puma workers. Show a safe rewrite using arguments and local variables. Briefly introduce shared mutable caches and synchronization, including why a process-local mutex does not coordinate separate workers; leave database race conditions to the dedicated constraints and locking guide.

Build on the Puma lesson's workers-and-threads explanation. Keep the focus on choosing storage whose lifetime and sharing match the data, rather than treating all class methods as unsafe.

## Web and backend fundamentals for Rails developers

### 10. HTTP Beyond Routes and Controllers

**Anchor question:** What does the client actually send, and what does Rails send back?

Read one request and response: method, URL, headers, status, and body. Cover safe and idempotent methods, redirects, content negotiation, and `Content-Type` versus `Accept`. Connect these to Rails routes and rendering.

[HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)

### 11. Designing REST APIs in Rails

**Anchor question:** What makes an API predictable beyond returning JSON?

Introduce resources, representations, stateless requests, and the uniform interface. Apply these ideas to resource routes, method semantics, status codes, pagination, and consistent errors. Distinguish practical API conventions from REST’s architectural constraints; JSON and CRUD alone do not define REST.

[REST overview](https://developer.mozilla.org/en-US/docs/Glossary/REST)

### 12. HTTP/1.1, HTTP/2, and HTTP/3: What Changes for Rails?

**Anchor question:** If the browser uses HTTP/3, does my Rails application need to change?

Explain persistent connections, HTTP/2 multiplexing over TCP, and HTTP/3 over QUIC. Introduce head-of-line blocking with a simple example. Trace browser-to-proxy and proxy-to-Puma connections separately: they can use different HTTP versions. Separate transport improvements from controller behavior and application processing speed.

[Evolution of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP)

### 13. Before Puma: DNS, TLS, Reverse Proxies, and Load Balancers

**Anchor question:** What happens between entering a URL and reaching the Rails server?

Follow hostname resolution, connection establishment, TLS termination, proxying, and load balancing. Explain where HTTPS can terminate, why forwarded headers matter, and which layer can produce a gateway error. Build on the existing request-path guide without repeating its Rack explanation.

### 14. Cookies, Sessions, and Authentication

**Anchor question:** How does Rails recognize a user on the next request?

Trace a session cookie through login and subsequent requests. Explain signed versus encrypted cookies, cookie-backed versus server-side sessions, expiration, and authentication versus authorization. Introduce bearer tokens only to clarify how they differ from cookie-based credentials.

[Rails security guide](https://guides.rubyonrails.org/security.html)

### 15. CORS, CSRF, and the Browser Security Model

**Anchor question:** Why does this API request work in curl but fail in the browser?

Explain origins, same-origin policy, CORS preflight, credentials, and CSRF protection. Show which behavior the browser enforces and which protections the server implements. Keep CORS permission, authentication, and CSRF defense distinct.

[Rails security guide](https://guides.rubyonrails.org/security.html)

### 16. HTTP Caching: Browsers, CDNs, and Conditional Requests

**Anchor question:** Why did the browser reuse a response, or receive a 304 instead of a body?

Trace `Cache-Control`, freshness, `ETag`, conditional requests, and `Vary`. Explain private versus shared caches and where Rails participates. Connect this to fingerprinted assets and distinguish HTTP caching from `Rails.cache`.

### 17. Timeouts, Retries, and Idempotency

**Anchor question:** If a request times out, did the operation fail—or did only the response get lost?

Use one external API call to explain connection and read timeouts, bounded retries, backoff, and idempotency keys. Show how a repeated operation can create duplicates and why retry policies must account for side effects. Connect the same reasoning to background jobs.

### 18. Webhooks: Receiving Events Reliably

**Anchor question:** What if the same event arrives twice, arrives late, or arrives out of order?

Follow signature verification, durable receipt, acknowledgment, background processing, and deduplication. Explain why delivery and successful business processing are separate steps. Use a hypothetical provider and check its actual delivery contract when choosing a real example.

### 19. Database Constraints, Indexes, and Race Conditions

**Anchor question:** How did duplicate records appear when the model validates uniqueness?

Explain application validations versus database constraints, unique indexes, concurrent writes, and the role of locking. Introduce query plans to show when an index helps. Make database-specific behavior explicit.

[Active Record querying and locking](https://guides.rubyonrails.org/active_record_querying.html)

### 20. Finding Where a Slow Request Spends Its Time

**Anchor question:** Is the delay in Rails, the database, an external service, or a queue?

Connect request IDs, structured logs, timing, metrics, and traces. Follow one request across a web process and a background job. Distinguish waiting time from CPU work and average latency from slow-tail behavior.

## Suggested starting order

1. Puma — builds on the request-path guide with processes, concurrency, configuration, and lifecycle.
2. Database connection pools — directly extends the Puma concurrency explanation.
3. Class methods and shared state — applies the Puma concurrency model to everyday Ruby code and request safety.
4. Background jobs — explains where asynchronous work runs and how failures behave.
5. Autoloading and reloading — resolves common development and startup surprises.
6. HTTP fundamentals — establishes vocabulary for the broader web topics.
7. REST API design — applies HTTP semantics to everyday Rails endpoints.
8. HTTP/2 and HTTP/3 — connects browser transport to deployment infrastructure.

These are candidate lessons, not a commitment to publish every topic. Each should remain a short, self-contained guide with a concrete example and links for further reading.
