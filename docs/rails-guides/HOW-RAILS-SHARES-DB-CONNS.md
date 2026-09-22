# How Rails Shares Database Connections

*Rails 8 · Active Record · Puma · Solid Queue*

**Anchor question:** Why are requests waiting for a connection when the database is not running a slow query?

By the end of this guide you'll be able to answer that from first principles, and you'll be able to count — on paper, before deploying — how many database connections your application actually asks for.

---

## Start with what you already know

You write this in a controller:

```ruby
class OrdersController < ApplicationController
  def show
    @order = Order.find(params[:id])
  end
end
```

`Order.find` sends SQL to PostgreSQL and gets rows back. To do that, something has to hold an open **database connection** — a live TCP socket to the database server, already authenticated, with session state on the server side.

You never opened that socket. You never closed it. You also never passed it to `Order.find`. Somewhere between "Rails booted" and "this line ran," a connection was found, used, and put back.

This guide is about that "somewhere." Understanding it is what lets you answer the anchor question, because the waiting in that question happens *before* any SQL is sent.

---

## What is a connection pool?

Opening a database connection is expensive — a TCP handshake, TLS, authentication, and server-side setup, typically a few milliseconds. Doing that per query would dominate your response time. So Rails keeps connections open and reuses them.

The object that holds them is `ActiveRecord::ConnectionAdapters::ConnectionPool`. A pool is:

- **A bounded set of open connections.** The bound is the `pool` setting in `config/database.yml`, default `5`.
- **Lazily filled.** The pool starts empty. It opens a new connection only when someone asks for one and none is free, and only while it's still below its limit.
- **Per process, in memory.** A pool is a plain Ruby object living in one process's heap. Two processes cannot share one. This fact does most of the work later in this guide.
- **Per database configuration.** One pool per entry in `database.yml` per process — so an app with `primary` and `queue` databases has two pools in every process, each with its own limit.

Two terms you'll need for the rest of the guide:

- **Checkout** — a thread takes a connection out of the pool. While checked out, that connection belongs to that thread alone and no other thread may use it.
- **Checkin** — the thread gives it back. The connection stays open; only the *ownership* is released.

Connections are borrowed, not created and destroyed. Keep that distinction in mind: a "connection" in `pool: 5` is a slot that gets lent out repeatedly, not a per-request resource.

---

## Who is doing the borrowing? Puma workers and threads

The pool lends connections to **threads**. So to know how many borrowers you have, you need to know how your web server creates threads.

Puma has two dials:

- **Workers** — separate OS processes, forked from a parent. Puma calls this *clustered mode*. Each worker has its own Ruby heap, and therefore **its own connection pool**.
- **Threads** — inside each worker, Puma runs a thread pool. Each thread serves one request at a time, start to finish.

Rails 8's generated `config/puma.rb` sets threads and leaves workers to Puma:

```ruby
threads_count = ENV.fetch("RAILS_MAX_THREADS", 3)
threads threads_count, threads_count
```

There is no `workers` line in the generated file. Puma's own default is `0` workers (single process), overridden by the `WEB_CONCURRENCY` environment variable. So the two dials come from two different places: **Rails' template sets threads; Puma reads `WEB_CONCURRENCY` for workers.**

So there are two counts, and they answer different questions:

> **Threads competing for one pool = `threads`** (one worker's worth).
> **Requests served at once, server-wide = `workers × threads`.**

The first is the one to compare against a pool's size, because a pool only ever lends to threads in its own process. The second comes back when we count what the database as a whole sees.

---

## How a connection gets borrowed and returned during a request

Now we can trace `Order.find` precisely.

1. A request arrives. Puma hands it to one of its threads.
2. Rails wraps the request in the **Rails executor** (`ActiveSupport::Executor`) — a Rack middleware-level wrapper that marks the boundaries of a unit of work.
3. Your controller calls `Order.find`. Active Record needs a connection, so it calls `checkout` on the pool for `Order`'s database.
4. The pool hands over a free connection, or opens a new one if it has room. That connection is now **leased** to this thread — "leased" is the pool's word for a connection that is checked out and has a specific owner.
5. Every subsequent query in this request — the view rendering an association, a `before_action`, anything — reuses the same leased connection. It's cached against the thread, so no further checkout happens.
6. The response is sent. The executor **completes**, and its Active Record hook calls `release_connection`, which checks the connection back in.

Step 6 is worth naming carefully, because it's the step people assume Active Record does on its own. It doesn't. Active Record registers a hook with the executor at boot:

```ruby
# activerecord/lib/active_record/railtie.rb
initializer "active_record.set_executor_hooks" do
  ActiveRecord::QueryCache.install_executor_hooks
  ActiveRecord::AsynchronousQueriesTracker.install_executor_hooks
  ActiveRecord::ConnectionAdapters::ConnectionPool.install_executor_hooks
end
```

The hook's `complete` callback walks every pool in the process and returns any connection leased to the finishing thread — unless an open, joinable transaction is still in progress, in which case it leaves it alone.

Two consequences follow, and both come up again later:

- **A connection is held for the whole request, not for the duration of a query.** From the first query to the end of the request, that slot is unavailable to anyone else — including while your code is doing something that isn't database work at all.
- **Returning is the executor's job.** Anything that runs a query *outside* an executor-wrapped unit of work (a thread you spawned yourself, a Rake task, an initializer) has no one to check its connection back in.

Active Job runs each job inside `app.reloader.wrap`, and the reloader runs the same executor hooks. So a job borrows and returns exactly the way a request does: one connection, held from first query to end of job.

---

## Our deployment example

One example, used for the rest of the guide. A Rails 8 app on PostgreSQL:

```
1 server
Puma: WEB_CONCURRENCY=2, RAILS_MAX_THREADS=5
Database: one PostgreSQL server, default max_connections = 100
```

To keep the arithmetic readable, this app uses a single database configuration — the `primary` entry — for everything. We'll come back to what changes when it doesn't.

`config/database.yml` as generated by Rails 8:

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
```

Note what this line does: **the same environment variable sizes both Puma's thread pool and Active Record's connection pool.** That's deliberate — it's how Rails keeps them matched by default. Set `RAILS_MAX_THREADS=5` and you get 5 Puma threads and a pool of 5 per worker.

It's also the one default worth double-checking, because the two fallbacks differ. If `RAILS_MAX_THREADS` is unset, Puma falls back to `3` threads while `database.yml` falls back to `pool: 5`. That direction is harmless (two spare slots). The dangerous direction is setting Puma's threads by some other means and leaving the pool at 5.

So, current state of the example:

| | count |
|---|---|
| Puma workers | 2 |
| Threads per worker | 5 |
| Pools | 2 (one per worker process) |
| Pool size, each | 5 |
| Maximum connections opened | 2 × 5 = **10** |

Ten sockets, against a `max_connections` of 100. Comfortable.

---

## What happens when all connections are checked out

Suppose all 5 threads in one worker are mid-request and each holds a connection. A sixth borrower appears in that same process. What happens?

It waits. Specifically, `ConnectionPool#checkout` finds nothing available, finds the pool already at its size limit so it cannot open a new connection, and blocks the calling thread on an internal queue. The thread is parked in Ruby — it is not talking to the database at all.

When another thread checks a connection in, the pool hands it to the longest-waiting thread. That's the normal case, and it's usually invisible: a few milliseconds of waiting under momentary load.

If no connection frees up in time, the pool gives up and raises:

```
ActiveRecord::ConnectionTimeoutError:
  could not obtain a connection from the pool within 5.000 seconds
  (waited 5.000 seconds); all pooled connections were in use
```

The exact conditions for that error are:

1. A thread asked the pool for a connection, and
2. no connection was free, and
3. the pool was already at its `pool` limit so no new one could be opened, and
4. `checkout_timeout` seconds elapsed — default **5 seconds** — with still nothing free.

All four must hold. Note what is *not* in the list: nothing about the database being slow, overloaded, or even reachable. The pool is a Ruby-side limit, enforced by Ruby-side bookkeeping.

**That is the answer to the anchor question.** Requests wait for a connection when all pool slots in their process are leased to other threads. Your database's slow query log is empty because the waiting thread never sent a query — it never got a connection to send one on.

### Before and after: the same app, one setting changed

Every pool can report its own state through `stat`, which is the easiest way to see this. The three fields that matter here: `size` is the configured limit, `busy` is how many connections are leased to a live thread, and `waiting` is how many threads are blocked right now waiting for one.

Take our example worker — `RAILS_MAX_THREADS=5`, so 5 Puma threads and `pool: 5` — under 5 concurrent requests. Sampling the pool mid-load:

```ruby
ActiveRecord::Base.connection_pool.stat
# => { size: 5, connections: 5, busy: 5, dead: 0, idle: 0,
#      waiting: 0, checkout_timeout: 5.0 }
```

Five slots, five borrowers, `waiting: 0`. Every thread that wants a connection has one.

Now raise Puma's threads to 10 by setting them directly in `config/puma.rb`, leaving `database.yml` reading `RAILS_MAX_THREADS` as before:

```ruby
threads 10, 10   # pool is still 5
```

Same traffic, same queries, same database. Under 10 concurrent requests:

```ruby
ActiveRecord::Base.connection_pool.stat
# => { size: 5, connections: 5, busy: 5, dead: 0, idle: 0,
#      waiting: 5, checkout_timeout: 5.0 }
```

Five threads are working. Five are parked in the pool's queue, and any that stay parked for 5 seconds will raise `ConnectionTimeoutError`. Latency goes up for every request that has to queue, and under sustained load some of them fail.

Why: the pool's limit didn't move. Puma created five more borrowers for a set of five slots that Active Record will not grow past its configured `size`. The extra threads don't add throughput; they add waiting. Meanwhile the database is handling exactly the same five queries it handled before — the same easy queries, at the same speed. Nothing on the database side registers that anything changed, because from its point of view nothing did.

Two situations produce that reading. The one above is the first:

- **More threads than pool slots.** The case above. Puma runs 10 threads, `pool` is 5. The database sees five easy queries and looks perfectly healthy.
- **Connections held while not querying.** Remember that a connection is leased for the whole request. A controller that queries, then spends 800 ms on an HTTP call to a payment provider, then queries again, holds its slot for all 800 ms of network wait. Here even 5 threads against 5 slots can exhaust the pool, because each slot is occupied far longer than its queries take. The database is idle; the pool is full.

---

## Background jobs borrow from the same database

Our example so far only counts web processes. Add the other half.

Rails 8 ships with **Solid Queue** as the default Active Job backend. Solid Queue runs its own processes, started by `bin/jobs`, supervised by a parent process. Its default configuration:

```yaml
# config/queue.yml
default: &default
  dispatchers:
    - polling_interval: 1
      batch_size: 500
  workers:
    - queues: "*"
      threads: 3
      processes: <%= ENV.fetch("JOB_CONCURRENCY", 1) %>
      polling_interval: 1
```

These are separate OS processes from Puma. Everything you learned about pools applies to them unchanged: each job process boots Rails, gets its own pool per database configuration, and its threads borrow and return connections through the executor.

Solid Queue processes also use connections for work that isn't your job code: polling for ready jobs, and writing heartbeat rows so the supervisor can detect a dead process. That's why Solid Queue's own guidance is to keep a worker's `threads` at or below the queue database's pool size **minus 2**.

Extend the example with `JOB_CONCURRENCY=1` — one Solid Queue worker process with the default 3 threads, plus the dispatcher and supervisor processes that `bin/jobs` starts alongside it. Those three processes each boot Rails and each get a pool of 5 against our single database.

---

## Counting total database demand

Now we can answer the question the database server cares about: how many sockets might arrive at once?

Count it as **processes × pool size**, summed over every process that connects.

| Process | Count | Pool size | Connections |
|---|---|---|---|
| Puma worker | 2 | 5 | 10 |
| Solid Queue worker | 1 | 5 | 5 |
| Solid Queue dispatcher | 1 | 5 | 5 |
| Solid Queue supervisor | 1 | 5 | 5 |
| **Ceiling** | | | **25** |

Against PostgreSQL's default `max_connections` of 100, that's comfortable. The point isn't the number; it's the shape of the arithmetic:

> Your database sees **the sum of every pool in every process**, not the number of servers, and not the number of requests.

It's a ceiling, not a steady state — pools fill lazily and shed idle connections, so the observed count is usually lower. Plan against the ceiling anyway, because it's what a traffic spike will reach.

And it multiplies fast. Scale this same app to 4 servers and it's 100 connections — exactly PostgreSQL's default limit, with nothing left for `psql`, a migration, or your monitoring agent. Nothing about your Rails code changed; you multiplied the process count.

### What changes with Rails 8's default multi-database setup

Our example used one database configuration. A default Rails 8 app in production doesn't — the generated `database.yml` defines four, one each for the app, Solid Cache, Solid Queue, and Solid Cable:

```yaml
production:
  primary:
    <<: *default
  cache:
    <<: *default
    migrations_paths: db/cache_migrate
  queue:
    <<: *default
    migrations_paths: db/queue_migrate
  cable:
    <<: *default
    migrations_paths: db/cable_migrate
```

Each entry becomes a separate pool, with its own limit, **in every process that connects to it**. A Puma worker serving a cached, Action Cable–enabled page holds a slot in `primary`, one in `cache`, and one in `cable` — three connections for one request. A Solid Queue worker holds a `queue` slot for its polling and heartbeat, and a `primary` slot for your job's `Order.update!`.

So the per-process multiplier isn't 5; it's 5 × *the number of database configurations that process actually touches*. Our 25 becomes something closer to 25 × 3 if all four databases live on one server. If they're separate servers, each server only sees its own pools — which is part of why Rails splits them.

The rule doesn't change, only the number of terms: **sum every pool in every process**.

### When you exceed the ceiling instead

This is worth counting before you scale, because exceeding `max_connections` fails differently from exhausting a pool. There, the pool has room and the checkout succeeds in opening a socket — and the database rejects it:

```
FATAL: sorry, too many clients already
```

That's a connection error at the adapter level, not `ConnectionTimeoutError`. Same root cause in spirit, opposite symptom: too much capacity requested, rather than too little configured.

---

## Configuring it

Only now, with the behavior clear, do the settings mean anything. All of these go in `config/database.yml` under a database's configuration.

**`pool`** — maximum connections this pool may open. Default `5`. Rails' generated value is `ENV.fetch("RAILS_MAX_THREADS") { 5 }`, which ties it to Puma's thread count.

Size it to the borrowers in that process, not to load: for a Puma worker, at least `RAILS_MAX_THREADS`; for a Solid Queue worker, at least `threads + 2`. Add one or two if you use background threads of your own.

**`checkout_timeout`** — seconds to wait for a free connection before raising `ConnectionTimeoutError`. Default `5`. Raising it converts fast failures into slow ones; it does not create capacity. Treat a change here as a deliberate choice about how long a request should hang before giving up, not as a fix.

**`idle_timeout`** — seconds an unused connection sits in the pool before being closed. Default `300`. Set to `0` to keep connections forever. This is why a quiet app's connection count drops on its own: the pool opened 5 connections during a burst and closed the idle ones five minutes later.

**`reaping_frequency`** — how often, in seconds, a background thread (the **Reaper**) inspects the pool. Default `60`. The Reaper does two jobs: it closes connections idle past `idle_timeout`, and it reclaims connections leased to threads that died without checking in.

Puma's side, for completeness:

- **`RAILS_MAX_THREADS`** — read by Rails' generated `puma.rb` *and* by the generated `database.yml`. Changing it moves both together, which is the behavior you want.
- **`WEB_CONCURRENCY`** — read by Puma itself to set worker count. Rails' template doesn't reference it; Puma's own configuration does. It has no effect on pool size, and every worker you add multiplies your connection ceiling by one more pool.

---

## Troubleshooting: is it the pool or something else?

Requests are slow. Here's how to tell pool waiting apart from the things it resembles.

**First, distinguish two queues.** When every Puma thread in a worker is busy, new requests wait in *Puma's* backlog before any Rails code runs. When every pool slot is leased, a thread that is already running Rails code waits in *the pool's* queue. Both look like latency. Only the second one produces `ConnectionTimeoutError`.

**Inspect the pool directly.** `stat`, which you saw above, reports every field:

```ruby
ActiveRecord::Base.connection_pool.stat
# => { size: 5, connections: 5, busy: 5, dead: 0, idle: 0,
#      waiting: 3, checkout_timeout: 5.0 }
```

- `size` — the configured limit.
- `connections` — sockets currently open (≤ `size`).
- `busy` — leased to a live thread.
- `idle` — open and available.
- `dead` — leased to a thread that died; the Reaper will reclaim these.
- `waiting` — **threads blocked waiting for a connection right now.** A non-zero value here, sampled repeatedly, is the direct confirmation that you are pool-bound.

Note that this reports one pool in one process. Our example has five processes, so one reading is one-fifth of the picture; sample it from a few of them before concluding anything.

**Then read the numbers against what you now know:**

| Symptom | Likely cause |
|---|---|
| `waiting > 0`, `busy == size`, database CPU low, no slow queries | Classic pool exhaustion. Either `pool < threads`, or requests hold connections through non-database work. |
| `ConnectionTimeoutError` in bursts under normal traffic | `pool` is smaller than the number of threads that can run at once in that process. Compare `pool` against `RAILS_MAX_THREADS`, and against Solid Queue's `threads + 2`. |
| `ConnectionTimeoutError` alongside genuinely slow queries | Not primarily a pool problem. Slow queries hold connections longer, which exhausts the pool as a side effect. Fix the queries. |
| `FATAL: sorry, too many clients already` | Not pool exhaustion. Your total ceiling — processes × pools × `pool` — exceeds the server's `max_connections`. |
| `dead > 0` repeatedly | Threads are dying while holding connections. Look for killed threads or a supervisor terminating workers mid-request. |

**Fixes, in the order worth trying:**

1. **Match `pool` to the borrowers in the process.** The cheapest fix and the most common cause.
2. **Shorten how long connections are held.** Move HTTP calls, file uploads, and other non-database work out of the span between your first and last query — ideally into a background job. This reduces demand instead of adding capacity.
3. **Add pool capacity,** having checked the new total against `max_connections`.
4. **Reduce process count or add a connection pooler** (PgBouncer and similar) if the ceiling, not the per-process pool, is the binding constraint. If you do use an external pooler, note that Active Record uses PostgreSQL advisory locks for migrations by default; the Rails configuration guide documents setting `advisory_locks: false` in `database.yml` for exactly this case.

---

## Edge cases worth knowing

These are real, but they're refinements — the mechanism above explains most incidents.

**Threads you create yourself.** A thread spawned inside a request runs *outside* the executor. If it queries, it checks out a connection from the same pool — consuming a slot its parent request doesn't know about — and nothing returns it when the thread ends until the Reaper notices. Wrap such work explicitly:

```ruby
ActiveRecord::Base.connection_pool.with_connection do |connection|
  # ...
end
```

`with_connection` checks out, yields, and checks in when the block exits. If the current thread already holds a leased connection, it yields that one and leaves the checkin to whoever borrowed it.

**`ActiveRecord::Base.connection` holds its lease.** Calling it takes a connection and keeps it leased until the end of the request or job, even if you only needed it for one statement. In Rails 8 this is still permitted by default, but `config.active_record.permanent_connection_checkout` lets you set `:deprecated` or `:disallowed` to find such call sites and migrate them to `ActiveRecord::Base.with_connection`. On a process with many threads and few connections, that difference is the whole problem.

**Asynchronous queries.** `load_async` runs queries on a separate executor thread, which borrows its own connection from the same pool. With `config.active_record.async_query_executor = :global_thread_pool`, `config.active_record.global_executor_concurrency` (default 4) sets how many such threads exist per process — and the Rails guide is explicit that pool size must cover both: with 4 Puma threads and `global_executor_concurrency` of 4, the pool should be at least 8.

**Forking.** A forked Puma worker must not reuse its parent's sockets — two processes writing to one database connection corrupts the protocol. Rails handles this by clearing and flushing pools after boot, precisely so a preloading parent doesn't hand live connections to its children; each worker then opens its own lazily on first query. Rails 8's generated `puma.rb` needs no `on_worker_boot` reconnect block.

---

## Summary

- A **connection pool** is a bounded, lazily filled set of open database connections, living in one process's memory. One pool per database configuration per process.
- Threads **check out** a connection on first query and hold it for the whole request or job. The **Rails executor** checks it back in at the end — not Active Record on its own, and not at the end of each query.
- **Puma threads** are the borrowers; **Puma workers** are separate processes, each with a separate pool. Rails 8's generated config ties both thread count and pool size to `RAILS_MAX_THREADS`.
- **Pool exhaustion** happens entirely inside Ruby: all slots leased, pool at its limit, `checkout_timeout` (5 s) elapsed. The database need not be doing anything at all — which is exactly why the slow query log is empty.
- **Total demand** is the sum of every pool in every process, web and jobs alike. Count it before scaling; `max_connections` failures look nothing like pool failures.

---

## Sources

- [Rails Guides — Configuring Rails Applications: Database Pooling](https://guides.rubyonrails.org/configuring.html#database-pooling)
- [Rails Guides — `config.active_record.permanent_connection_checkout`](https://guides.rubyonrails.org/configuring.html#config-active-record-permanent-connection-checkout)
- [Rails Guides — `config.active_record.global_executor_concurrency`](https://guides.rubyonrails.org/configuring.html#config-active-record-global-executor-concurrency)
- [Rails 8.0 source — `ActiveRecord::ConnectionAdapters::ConnectionPool`](https://github.com/rails/rails/blob/8-0-stable/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb)
- [Rails 8.0 source — pool queue and `ConnectionTimeoutError` message](https://github.com/rails/rails/blob/8-0-stable/activerecord/lib/active_record/connection_adapters/abstract/connection_pool/queue.rb)
- [Rails 8.0 source — `HashConfig` pool defaults (`pool`, `checkout_timeout`, `idle_timeout`, `reaping_frequency`)](https://github.com/rails/rails/blob/8-0-stable/activerecord/lib/active_record/database_configurations/hash_config.rb)
- [Rails 8.0 source — Active Record railtie executor hooks](https://github.com/rails/rails/blob/8-0-stable/activerecord/lib/active_record/railtie.rb)
- [Rails 8.0 source — Active Job reloader hook](https://github.com/rails/rails/blob/8-0-stable/activejob/lib/active_job/railtie.rb)
- [Rails 8.0 source — generated `config/puma.rb`](https://github.com/rails/rails/blob/8-0-stable/railties/lib/rails/generators/rails/app/templates/config/puma.rb.tt)
- [Rails 8.0 source — generated `config/database.yml` (PostgreSQL)](https://github.com/rails/rails/blob/8-0-stable/railties/lib/rails/generators/rails/app/templates/config/databases/postgresql.yml.tt)
- [Rails 8.0 source — generated `config/database.yml` (SQLite, multi-database production)](https://github.com/rails/rails/blob/8-0-stable/railties/lib/rails/generators/rails/app/templates/config/databases/sqlite3.yml.tt)
- [Puma — configuration defaults (`workers`, `WEB_CONCURRENCY`)](https://github.com/puma/puma/blob/master/lib/puma/configuration.rb)
- [Solid Queue — README, worker and dispatcher configuration](https://github.com/rails/solid_queue#configuration)
- [Solid Queue — default `config/queue.yml` template](https://github.com/rails/solid_queue/blob/main/lib/generators/solid_queue/install/templates/config/queue.yml)
- [PostgreSQL — `max_connections`](https://www.postgresql.org/docs/current/runtime-config-connection.html)
