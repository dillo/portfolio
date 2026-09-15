# How Rails Loads Your Code

> Approved guide content. Baseline: Rails 8.0 with Zeitwerk and conventional application directories.

**How does Rails make your classes available, and what happens when you edit them?**

In a Rails application, you can write `User.find(1)` without first requiring `app/models/user.rb`. You can also edit a controller, refresh the browser, and see the change without restarting the server.

These familiar conveniences involve a few separate mechanisms. Understanding them starts with what it means to load a Ruby file. From there, we can explain how Rails locates your classes, when it loads them, and how it replaces them during development.

## 1. What does “loading code” mean?

Suppose you save this file:

```ruby
# greeting.rb
class Greeting
  def self.message
    "Hello"
  end
end
```

The file exists, but a running Ruby program does not yet know about `Greeting`. Saving a file does not create a class inside that program.

Open plain Ruby's console, `irb`, in the same directory. You can see the difference:

```ruby
Greeting.message # => NameError: uninitialized constant Greeting

require_relative "greeting"
Greeting.message # => "Hello"
```

**Loading is the step between having code in a file and having its definitions available in the running program.** Here, `require_relative` tells Ruby to evaluate `greeting.rb`, creating the class and defining its method.

Loading the file makes `message` available; calling `Greeting.message` runs it and returns `"Hello"`.

Rails takes care of that loading step for application classes. That is why it is easy to overlook that the step exists.

## 2. Rails arranges the loading for you

Move our class into a Rails application:

```ruby
# app/services/greeting.rb
class Greeting
  def self.message
    "Hello"
  end
end
```

Application code can now call `Greeting.message` without an explicit `require_relative`.

Rails uses **Zeitwerk**, a Ruby code loader, to make this work. Rails tells Zeitwerk which directories contain application code. Zeitwerk uses their structure to connect constant names with files, and sets up Ruby autoloads so that referencing a constant can load its file.

Their responsibilities fit together like this:

| Component | Responsibility                                                                    |
| --------- | --------------------------------------------------------------------------------- |
| Rails     | Configures application directories and decides when loading and reloading happen. |
| Zeitwerk  | Maps file paths to expected constants and manages loading those files.            |
| Ruby      | Evaluates the files and executes your application code.                           |

You normally configure this through Rails. You do not need to create a Zeitwerk loader yourself or add `require` calls for models, controllers, and services. [Zeitwerk documentation](https://github.com/fxn/zeitwerk)

## 3. How does Zeitwerk know which file to load?

**Zeitwerk uses a file's path to determine the name it should define.** It can establish that connection before Ruby evaluates the file.

Take our existing file, `app/services/greeting.rb`:

1. Rails identifies `app/services` as a directory containing application code.
2. Zeitwerk sees `greeting.rb` inside it and derives the name `Greeting` from the filename.
3. It registers an autoload connecting `Greeting` to that file. When Ruby needs `Greeting`, that registration tells it which file to load.

```text
app/services/ + greeting.rb → Greeting
starting point   filename     expected name
```

That starting directory is called an **autoload root**. Rails includes directories such as `app/models` and `app/controllers`, and includes `app/services` if it exists at boot. Naming starts _inside_ the root, which is why our class is `Greeting`, rather than `Services::Greeting`.

A subdirectory adds another part to the name:

```text
app/services/ + admin/ + greeting.rb → Admin::Greeting
starting point  namespace  filename    expected name
```

Here, the file must define `class Greeting` inside `module Admin`. Ruby calls these names **constants**; `Admin::Greeting` is a constant inside the `Admin` namespace.

The same rule gives `app/models/user.rb` → `User` and `app/controllers/users_controller.rb` → `UsersController`.

**The path supplies the expected name; the file supplies its definition.** If `greeting.rb` defines `Welcome` instead, the registration still points `Greeting` to that file, but loading it fails because the promised definition is missing. Keeping the path and definition in agreement is what makes automatic loading possible. [Rails naming conventions](https://guides.rubyonrails.org/v8.0/autoloading_and_reloading_constants.html#project-structure)

## 4. Autoloading: load a definition when it is needed

We now have a connection from `Greeting` to `app/services/greeting.rb`. When does Rails arrange for that file to load?

In a typical development application, Rails sets up Zeitwerk's autoloads so files can wait until their definitions are needed. **Autoloading is what happens when using a constant triggers its file to load.**

Suppose `Greeting` has not been loaded yet, and a controller action reaches this line:

```ruby
render plain: Greeting.message
```

Ruby needs to resolve `Greeting` before it can call `message`:

1. `Greeting` has an autoload registration, but its class does not exist yet.
2. Ruby follows the connection Zeitwerk registered and evaluates `app/services/greeting.rb`.
3. The file creates the `Greeting` class and defines `message`.
4. Ruby continues with `Greeting.message`, which returns `"Hello"`.

In our plain Ruby example, we had to call `require_relative` before using the class. Here, **using `Greeting` triggers that loading step automatically**.

Rails arranges for application classes to be available on demand. The first constant lookup triggers the actual loading, and Zeitwerk's registration tells Ruby which file to evaluate.

Later calls use the class already in memory. Autoloading does not mean reading the file again every time you use the class. [Zeitwerk autoloading](https://github.com/fxn/zeitwerk#autoloading)

## 5. Eager loading: load definitions upfront

With autoloading, our first call to `Greeting.message` caused Ruby to load `greeting.rb`. What if Rails arranged for that file to be loaded before any request arrived?

That is **eager loading**: Rails asks its loaders to load the files in the configured eager-load paths during boot, whether or not a request will use them.

Follow the same `Greeting` example:

1. Rails starts booting the application and sets up its loaders.
2. During eager loading, Zeitwerk reaches `app/services/greeting.rb` and has Ruby evaluate it.
3. Ruby creates the `Greeting` class and defines `message`. As we learned earlier, defining the method does not call it.
4. Later, a controller calls `Greeting.message`. The class is already available, so Ruby runs the method and returns `"Hello"`.

```text
Autoloading:
  Boot → first use of Greeting → load greeting.rb → call message

Eager loading:
  Boot → load greeting.rb → later request → call message
```

**The file and its definition are the same. What changes is when Ruby evaluates the file: during boot, rather than at its first use.**

Rails controls this through `config.eager_load`. It is typically `false` in development and `true` in production. Development can start without loading every unused application class; production does that loading work during startup so requests find those definitions ready to use. [Rails eager loading](https://guides.rubyonrails.org/v8.0/autoloading_and_reloading_constants.html#eager-loading)

### Eager loading also reaches files you have not used

Recall that a file must define the name Zeitwerk derives from its path. Suppose you add this file:

```ruby
# app/services/report_export.rb
class ReportExporter
end
```

The filename promises `ReportExport`, but the file defines `ReportExporter`.

With autoloading, that mistake can stay hidden if your local requests and tests never load the file. With eager loading, Zeitwerk reaches it during boot and raises `Zeitwerk::NameError` because the expected definition is missing.

The error appears earlier because eager loading covers files you have not used yet. Referencing `ReportExport` locally would expose the same mismatch.

Fix it by aligning the names—for example, rename the file to `report_exporter.rb` if `ReportExporter` is the intended class name.

## 6. Reloading: pick up changes after boot

Whether `Greeting` was autoloaded on first use or eager loaded during boot, Ruby now has its definition in memory. Calling `Greeting.message` returns `"Hello"`.

Now edit `greeting.rb` so the method returns `"Welcome"`. You have changed the file on disk, but the running program still has the class it created earlier. As we learned with autoloading, another call normally reuses that class without reading the file again.

**Reloading lets the running application replace a loaded definition with the version you just saved.**

Follow the edit in a typical development server:

1. You save the change to `greeting.rb`.
2. Rails detects the change. Before processing the next request, it tells Zeitwerk—the main autoloader managing reloadable application code—to unload those constants and set up autoloads again.
3. For `Greeting`, unloading removes the name's connection to the old class. The next lookup can trigger loading again.
4. The request calls `Greeting.message`. Ruby loads the edited file through its autoload registration, creates the new class, and runs the method. This time it returns `"Welcome"`.

```text
File on disk:    "Hello" → save edit → "Welcome"
Loaded class:   "Hello" → unload → next lookup loads edited file → "Welcome"
```

Rails decides when that reset happens; Zeitwerk manages unloading and setting up the file connections; Ruby evaluates the edited file when it is needed. Rails resets the reloadable constants together, including ones whose files you did not edit.

**Saving changes the source file. Reloading allows later code to use a new class built from that file.** Existing references to the old class need separate attention, which we will look at next.

Rails controls this behavior with `config.enable_reloading`, typically enabled in development and disabled in production. In production, new application code normally takes effect when you restart or replace the application processes during deployment.

We can now put the two settings together:

| Setting                   | Question                                             | Typical development | Typical production |
| ------------------------- | ---------------------------------------------------- | ------------------- | ------------------ |
| `config.eager_load`       | Should definitions load upfront?                     | `false`             | `true`             |
| `config.enable_reloading` | Can application definitions be replaced after edits? | `true`              | `false`            |

These settings are independent. An upgraded or customized application may use different values. [Rails reloading](https://guides.rubyonrails.org/v8.0/autoloading_and_reloading_constants.html#reloading), [Rails configuration](https://guides.rubyonrails.org/v8.0/configuring.html)

## 7. Reloading does not replace objects you already hold

In the previous section, the next request picked up the edited `Greeting` class. But what happens if we saved the original class in a variable before reloading?

Try this in a development Rails console with `Greeting.message` returning `"Hello"`:

```ruby
saved_class = Greeting
saved_class.message # => "Hello"
```

Now edit `greeting.rb` so `message` returns `"Welcome"`, then run:

```ruby
reload!

Greeting.message    # => "Welcome"
saved_class.message # => "Hello"
```

The console needs the explicit `reload!`; it does not automatically reload after file edits.

Why are the results different?

1. `saved_class = Greeting` stores the actual class object in the variable.
2. During the reload, Zeitwerk removes the `Greeting` constant's connection to that object. It does not change what `saved_class` holds.
3. Looking up `Greeting` again loads the edited file and creates a new class. Calling through `saved_class` still uses the old one.

**Reloading changes what a fresh lookup finds. It does not update every reference you saved earlier.** A variable still holding the old class is called a **stale reference**. Instances created from that class also keep their original class.

In this console, assigning `saved_class = Greeting` again picks up the new class. Recreate old instances when you need them to use the new implementation too. The same issue matters when application configuration retains a class beyond a reload. [Rails stale objects](https://guides.rubyonrails.org/v8.0/autoloading_and_reloading_constants.html#reloading-and-stale-objects)

## 8. Some setup must run again after a reload

We have seen that reloading creates a new class. Any configuration we applied to the old class may need to be applied to the new one too.

Change our `Greeting` example to make the message configurable. Here, `class_attribute` provides a setting on the class, initially `"Hello"`:

```ruby
# app/services/greeting.rb
class Greeting
  class_attribute :text, default: "Hello"

  def self.message
    text
  end
end
```

Suppose application setup changes `Greeting.text` to `"Welcome"`. After a reload, the newly created class starts with the default from the file: `"Hello"`. It needs that assignment again.

Files in `config/initializers` normally run once during boot. To register setup that also runs after reloads, put it inside a `to_prepare` block:

```ruby
# config/initializers/greeting.rb
Rails.application.config.to_prepare do
  Greeting.text = "Welcome"
end
```

1. At boot, Rails runs the block. The `Greeting` lookup loads the class, and the assignment sets its text to `"Welcome"`.
2. After a reload, Rails runs the block again. The lookup loads the replacement class, and the assignment configures that class too.
3. In either case, subsequent calls to `Greeting.message` return `"Welcome"`.

**If a class is recreated, setup for that class must be repeatable too.** The initializer registers the block once; Rails calls the block at the appropriate times. This also avoids autoloading a reloadable class directly during ordinary initialization, which Rails disallows.

Assigning the same value twice is harmless. Keep preparation blocks safe to repeat because Rails can also run them twice during boot. Appending to a permanent list, for example, could create duplicate entries. [Rails setup for reloadable code](https://guides.rubyonrails.org/v8.0/autoloading_and_reloading_constants.html#autoload-on-boot-and-on-each-reload)

## 9. Some code should stay loaded until restart

Earlier, `saved_class` kept using the old `Greeting` class after a reload. The same problem can occur when a long-lived part of Rails holds application objects.

Consider custom middleware called `RequestTimer`. Middleware wraps the application to do work before or after a request. Rails builds that stack during boot:

1. Rails loads `RequestTimer` and builds the stack using an instance of it.
2. Requests pass through that existing instance.
3. An application reload does not rebuild the stack. Replacing the `RequestTimer` constant would leave the stack using its old instance and class.

**Reloading a middleware definition would not replace the middleware already handling requests.** Keep that definition loaded for the lifetime of the stack, and restart the server to pick up edits.

One way to arrange this is to put the middleware in `lib/middleware/request_timer.rb`, defining `RequestTimer`, and require it explicitly:

```ruby
# config/application.rb, inside your Application class
# Preserve any other entries in your existing ignore list.
config.autoload_lib(ignore: %w(assets tasks middleware))

require_relative "../lib/middleware/request_timer"
config.middleware.use RequestTimer
```

The first line lets Zeitwerk manage eligible code in `lib`, but excludes the listed directories. That keeps `lib/middleware` out of autoloading and reloading. The next line uses the explicit loading step from section 1, and the last registers the middleware with Rails.

This explains the different experience when editing a controller and middleware: Rails arranges for later requests to find a replacement controller class, while the middleware stack continues using the objects built at boot.

Rails also provides a separate Zeitwerk loader for code that can autoload but must not reload. Its settings are `config.autoload_once_paths` and `config.autoload_lib_once`. This is an alternative to explicit requiring when framework setup needs to retain classes across reloads. [Rails code retained during boot](https://guides.rubyonrails.org/v8.0/autoloading_and_reloading_constants.html#use-case-2-during-boot-load-code-that-remains-cached)

## 10. Check loading deliberately

Recall `report_export.rb`, which incorrectly defined `ReportExporter`. Autoloading could leave that mistake hidden until something used the file. Eager loading exposed it by loading the file during boot.

You can ask Rails to perform that loading check locally:

```sh
bin/rails zeitwerk:check
```

1. The task asks Rails to eager load the application.
2. Zeitwerk loads the files and checks that each defines the expected constant.
3. It reports the mismatch in `report_export.rb`. Rename the file to `report_exporter.rb` if `ReportExporter` is the intended name, then run the check again.

**You can check whether the application loads without manually exercising every feature.** Read warnings about custom autoload directories missing from eager-load paths: those files are outside the check's coverage.

Use the same idea in CI by explicitly eager loading in the test environment:

```sh
RAILS_ENV=test bin/rails runner 'Rails.application.eager_load!'
```

This reaches definitions that ordinary tests may never reference. Remember the distinction from section 1: loading defines methods; it does not run all of them. Keep the application tests as well. A successful check in the test environment also does not verify production-specific configuration.

To watch the loading process itself, temporarily add `Rails.autoloaders.log!` after `config.load_defaults` in `config/application.rb` and restart. Zeitwerk's trace shows the steps we have followed: registering autoloads, loading files, and unloading constants during a reload. [Rails loading checks and troubleshooting](https://guides.rubyonrails.org/v8.0/autoloading_and_reloading_constants.html#testing)

## Takeaways

- Loading evaluates a Ruby file so its definitions become available.
- Zeitwerk connects constant names to files using directory and filename conventions.
- Autoloading waits until a definition is needed; eager loading prepares definitions upfront.
- Reloading lets future lookups use edited definitions, while existing references may still point to old objects.
- Setup that uses reloadable classes can run in `to_prepare`. Code retained by the middleware stack needs a lifetime that extends until restart.
- An eager-load check can uncover files that your local requests and tests have never loaded.
