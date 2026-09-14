import type { Lesson } from '../types'

export const howPumaRunsYourRailsApplication: Lesson = {
  slug: 'how-puma-runs-your-rails-application',
  title: 'How Puma Runs Your Rails Application',
  tagline: 'What actually happens when several requests reach your Rails application at once?',
  intro:
    'Imagine seven people opening your orders page together. Puma has two worker processes, each with three request threads. Six requests can occupy those threads; the seventh must wait for capacity. Even among those first six, some may be waiting for the database or for a turn to execute Ruby.',
  minutes: 10,
  sections: [
    {
      heading: 'Where Rails runs',
      blocks: [
        {
          kind: 'callout',
          tone: 'note',
          title: 'Scope of this guide',
          text: 'These examples cover ordinary HTTP requests on CRuby (MRI), with cluster mode on an operating system that supports `fork`, such as Linux. Configuration behavior was checked against Puma 8.0.2. Examples use explicit settings rather than relying on generated defaults.',
        },
        {
          kind: 'p',
          text: 'In **single mode**, one Puma process loads Rails and serves requests. There is no separate master process managing application workers.',
        },
        {
          kind: 'p',
          text: 'In **cluster mode**, a master process starts and supervises worker processes. The workers accept connections on a shared listening socket and run the application. The master does not execute controllers or dispatch each request to a chosen worker.',
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'Puma master — supervises workers\n├── Worker 1 — Rails application, its own GVL\n│   ├── Request thread A\n│   ├── Request thread B\n│   └── Request thread C\n└── Worker 2 — Rails application, its own GVL\n    ├── Request thread D\n    ├── Request thread E\n    └── Request thread F',
        },
        {
          kind: 'p',
          text: 'Threads within a worker share its application memory. Workers have separate application state: changing a Ruby object in worker 1 does not update that object in worker 2.',
        },
      ],
    },
    {
      heading: 'Follow request A into Rails',
      blocks: [
        {
          kind: 'p',
          text: 'Puma receives and buffers the HTTP request. An available request thread calls the Rack application, which takes request A through Rails middleware, routing, and its controller. That same thread handles the ordinary response write and becomes available again afterward. Returning from the controller alone does not mean the thread is free.',
        },
        {
          kind: 'p',
          text: 'Suppose the controller queries the database before rendering the orders page. While the database works, A still occupies its Puma request thread. Waiting does not return that thread to the pool.',
        },
      ],
    },
    {
      heading: 'Busy threads are not all executing Ruby',
      blocks: [
        {
          kind: 'p',
          text: 'On CRuby, the **Global VM Lock (GVL)** allows only one thread in a process to execute ordinary Ruby code at a time. Blocking I/O can release the GVL, allowing another thread to run. Some native extensions also release it; other Ruby implementations have different constraints.',
        },
        {
          kind: 'p',
          text: "For our example, assume A's database driver releases the GVL during the query:",
        },
        {
          kind: 'list',
          items: [
            "A runs the controller's Ruby code, then waits for SQL results.",
            'B gets a turn executing Ruby while A waits.',
            "A's query finishes. A can resume Ruby execution once it gets the GVL again.",
          ],
          ordered: true,
        },
        {
          kind: 'p',
          text: 'A and B are **concurrent**: both requests are in progress. Their Ruby instructions are taking turns. Each worker has its own GVL, so workers 1 and 2 can execute Ruby in parallel when CPU capacity is available.',
        },
        {
          kind: 'p',
          text: 'Three components cooperate: Puma supplies the request threads and work; CRuby controls access to Ruby execution; the operating system schedules the underlying processes and threads on CPUs. Puma does not reserve a CPU core for each worker.',
        },
        {
          kind: 'p',
          text: 'Threads in the same worker share class variables. If one request stores its current user in `@@current_user`, another request can overwrite that value before the first request finishes using it. The GVL prevents simultaneous Ruby execution, but threads can still take turns between the assignment and the read. Keep request-specific values in local variables or instance variables on that request’s controller instance.',
        },
      ],
    },
    {
      heading: 'What happens to request seven?',
      blocks: [
        {
          kind: 'p',
          text: "Once all six request threads are occupied, another request cannot enter Rails through one of them until capacity becomes available. Depending on how far its connection has progressed, it may wait in Puma's work queue, the operating system's queue of unaccepted connections, or an upstream proxy. Puma's reported work backlog and the socket backlog measure different queues.",
        },
        {
          kind: 'p',
          text: "Think of the seventh visitor's response time as:",
        },
        {
          kind: 'code',
          lang: 'text',
          code: 'waiting for capacity + application work and waits + response delivery',
        },
        {
          kind: 'p',
          text: "That is why a page can feel slow even when its controller's logged duration looks normal. A burst might clear quickly; sustained arrivals beyond capacity keep increasing the wait until requests time out or fail.",
        },
      ],
    },
    {
      heading: 'Configure workers and threads together',
      blocks: [
        {
          kind: 'p',
          text: 'This illustrative fragment belongs in an existing `config/puma.rb`:',
        },
        {
          kind: 'code',
          lang: 'ruby',
          code: '# Example counts for this lesson, not a universal recommendation.\nworkers 2\nthreads 3, 3',
        },
        {
          kind: 'p',
          text: "`workers 2` starts two application workers plus the master. `threads 3, 3` sets each worker's minimum and maximum request pool size to three. A range such as `threads 1, 3` lets the pool grow with demand. Internal Puma threads are additional to this request pool. `workers 0` selects single mode; `workers 1` still selects cluster mode.",
        },
        {
          kind: 'p',
          text: 'For this example:',
        },
        {
          kind: 'code',
          lang: 'text',
          code: '2 workers × 3 request threads = 6 ordinary requests being serviced at once',
        },
        {
          kind: 'p',
          text: 'This is a concurrency ceiling, not six requests per second or six simultaneous Ruby computations.',
        },
        {
          kind: 'p',
          text: 'Production commonly supplies counts through environment variables read by the configuration, such as `WEB_CONCURRENCY` and `RAILS_MAX_THREADS`. Inspect the deployed configuration and startup output. A development server using one process and code reloading is not a production capacity test. Measure realistic traffic with production settings, watching response times, CPU, memory, and database demand. More threads can help overlap I/O, but increase memory use and contention; more workers also consume memory and compete for available CPUs.',
        },
      ],
    },
    {
      heading: 'A request thread may wait for a database connection',
      blocks: [
        {
          kind: 'p',
          text: 'Each worker has its own Active Record connection pools. For a simple application with one database pool per worker and no extra database-using threads, a pool size of three gives each of our three request threads room to borrow a connection. Add or adjust this setting in the relevant existing `config/database.yml` configuration:',
        },
        {
          kind: 'code',
          lang: 'yaml',
          code: 'pool: 3',
        },
        {
          kind: 'p',
          text: 'Two workers then have capacity for six database connections in total. Connections are borrowed as needed; six request threads do not necessarily mean six active queries.',
        },
        {
          kind: 'p',
          text: "If a worker's pool has only two connections, a third thread needing one waits when both are checked out. If none becomes available within `checkout_timeout`, Active Record raises a connection timeout error. That waiting request still occupies its Puma thread.",
        },
        {
          kind: 'p',
          text: "Three deployment replicas would raise this example's web connection capacity to eighteen. Background jobs, asynchronous queries, and other connection pools require their own allowance.",
        },
      ],
    },
    {
      heading: 'Preloading changes how workers start',
      blocks: [
        {
          kind: 'p',
          text: 'In the cluster setup described here, workers are forked from the master whether or not preloading is enabled. **Without preloading**, the master forks workers first, and each worker then loads and initializes Rails independently. **With preloading**, the master loads and initializes Rails first, then forks workers that inherit the loaded application.',
        },
        {
          kind: 'p',
          text: 'A **memory page** is a fixed-size chunk of memory that the OS manages—often 4 KB, though the size varies. A page holds bytes; it doesn’t correspond neatly to a Ruby object. It might contain several small objects or part of a larger one.',
        },
        {
          kind: 'p',
          text: 'Each process has its own *virtual memory*: addresses through which it accesses memory. The OS maps those addresses to physical memory in RAM. Separate processes can have mappings to the same physical pages.',
        },
        {
          kind: 'p',
          text: 'When Puma forks workers after preloading, the operating system can share those physical pages through **copy-on-write**. When a worker modifies a shared page, the OS gives it a private copy. The other processes keep their existing versions. This can save memory, but does not turn Ruby objects into shared mutable state across workers.',
        },
        {
          kind: 'p',
          text: '`preload_app!` explicitly enables this behavior. Current Puma can also enable preloading automatically when there is more than one worker, unless `prune_bundler` is enabled. Check your installed version and effective configuration.',
        },
        {
          kind: 'p',
          text: "Forking needs care: open client sockets can be inherited, while background Ruby threads do not carry over into the child. Follow each library's fork handling guidance for connection cleanup and worker initialization.",
        },
      ],
    },
    {
      heading: 'Shutdown and restart are part of serving requests',
      blocks: [
        {
          kind: 'p',
          text: "A graceful stop gives ongoing work a chance to finish. Puma's shutdown timeouts and the hosting platform's termination deadline bound that opportunity; a forced termination can interrupt requests. Coordinate traffic draining with the platform. A worker health timeout is not a general controller execution timeout.",
        },
        {
          kind: 'p',
          text: 'Two restart strategies matter here:',
        },
        {
          kind: 'list',
          items: [
            '**Hot restart:** restarts Puma itself and reloads the application. On supported Unix platforms, listening sockets survive, though requests may wait while the application boots.',
            '**Phased restart:** replaces cluster workers one at a time while retaining the master. Old and new application versions can overlap. Application upgrades this way require preloading disabled and `prune_bundler` enabled; this cannot upgrade Puma itself.',
          ],
        },
        {
          kind: 'p',
          text: 'A preloaded deployment can use a hot restart or have its platform replace application instances. Restart behavior must match how the application boots.',
        },
      ],
    },
  ],
  takeaways: [
    'Workers provide separate application processes; request threads share memory inside a worker.',
    'A request can occupy a thread while waiting for I/O, the GVL, or a database connection.',
    'Worker and thread counts set concurrency capacity. The workload determines throughput and response time.',
    'Database pools, memory, CPU capacity, and deployment lifecycle all constrain useful concurrency.',
  ],
  goDeeper: [
    {
      label: 'Puma architecture',
      url: 'https://puma.io/puma/file.architecture.html',
    },
    {
      label: 'Puma and the GVL',
      url: 'https://puma.io/puma/',
    },
    {
      label: 'Rails concurrency and parallelism',
      url: 'https://guides.rubyonrails.org/tuning_performance_for_deployment.html',
    },
    {
      label: 'Puma configuration DSL',
      url: 'https://puma.io/puma/Puma/DSL.html',
    },
    {
      label: 'Active Record connection pools',
      url: 'https://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/ConnectionPool.html',
    },
    {
      label: 'Puma restart documentation',
      url: 'https://puma.io/puma/file.restart.html',
    },
  ],
}
