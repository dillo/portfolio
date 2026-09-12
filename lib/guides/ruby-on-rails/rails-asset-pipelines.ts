import type { Lesson } from '../types'

// Adapted from the supplied rails-asset-pipelines.pdf; source links retained below.
export const railsAssetPipelines: Lesson = {
  slug: 'rails-asset-pipelines',
  title: 'Rails Asset Pipelines',
  tagline: 'A beginner’s guide to Sprockets and Propshaft in development and production.',
  intro:
    'An asset pipeline manages the files a browser downloads: CSS, JavaScript, images, and fonts. This guide follows those files through Sprockets and Propshaft, from editing locally to preparing them for visitors.',
  minutes: 6,
  sections: [
    {
      heading: 'The terminology',
      blocks: [
        {
          kind: 'p',
          text: '**Sprockets** and **Propshaft** are two implementations of the Rails asset pipeline. Rails 8 made Propshaft the default for new applications. Existing applications can still use Sprockets.',
        },
      ],
    },
    {
      heading: 'What both systems do',
      blocks: [
        {
          kind: 'p',
          text: 'Both systems find assets in configured directories and let your views reference them through Rails helpers. For example, a view can ask for an image by its original filename:',
        },
        { kind: 'code', lang: 'erb', code: '<%= image_tag "logo.png" %>' },
        {
          kind: 'p',
          text: 'For production, the pipeline adds a **fingerprint** to the filename: a hash derived from the file’s content. A name like `logo.png` becomes something like `logo-a1b2c3.png`.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Why fingerprint filenames?',
          text: 'When the content changes, the fingerprint changes. Browsers can cache the old URL for a long time, while updated pages point to the new URL. Rails helpers resolve the original filename to the prepared asset’s URL.',
        },
      ],
    },
    {
      heading: 'Sprockets in development',
      blocks: [
        { kind: 'p', text: 'Start Rails, typically with:' },
        { kind: 'code', lang: 'sh', code: 'bin/rails server' },
        {
          kind: 'p',
          text: 'When the browser requests an asset, Sprockets processes it on demand. It can combine files using directives such as `//= require`. With the appropriate processors installed, it can also convert Sass into CSS or CoffeeScript into JavaScript.',
        },
        {
          kind: 'list',
          items: [
            'Sprockets caches processed results and rebuilds affected assets when their source files change.',
            'The normal workflow is edit, save, then refresh the browser. You generally do not run `assets:precompile` locally.',
            'Depending on the Sprockets version and debug settings, development assets may be served separately to make debugging easier.',
          ],
        },
      ],
    },
    {
      heading: 'Sprockets in production',
      blocks: [
        { kind: 'p', text: 'During the build or deployment, run:' },
        {
          kind: 'code',
          lang: 'sh',
          code: 'RAILS_ENV=production bin/rails assets:precompile',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            'Sprockets processes the assets selected by the application’s manifest and precompile configuration.',
            'It converts supported source formats, combines files as instructed, and minifies them if compressors are configured.',
            'It writes fingerprinted output into `public/assets` and generates a manifest mapping original names to generated filenames.',
            'Rails helpers use that mapping to generate the correct asset URLs.',
          ],
        },
        {
          kind: 'p',
          text: 'A static file server, Rails’ configured static serving, or a CDN delivers the prepared files. Normal production setups prepare assets before deployment, rather than compiling them for each visitor.',
        },
      ],
    },
    {
      heading: 'Propshaft in development',
      blocks: [
        {
          kind: 'p',
          text: 'Start Rails; Propshaft serves assets from the configured asset directories. It expects browser-ready files, such as ordinary CSS and JavaScript. It detects changes, so the normal workflow remains edit, save, then refresh. Asset precompilation is not normally necessary.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Propshaft’s scope',
          text: 'Propshaft does not bundle files, compile Sass or TypeScript, or minify code. It does perform limited processing, such as updating CSS asset URLs to reference fingerprinted filenames.',
        },
      ],
    },
    {
      heading: 'Propshaft in production',
      blocks: [
        { kind: 'p', text: 'During the build or deployment, run the same command:' },
        {
          kind: 'code',
          lang: 'sh',
          code: 'RAILS_ENV=production bin/rails assets:precompile',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            'Propshaft copies assets from its configured paths, excluding explicitly excluded directories, into `public/assets`.',
            'It fingerprints the files, updates supported asset references, and writes `public/assets/.manifest.json`.',
            'Rails helpers use that manifest to generate the correct URLs. Prepared files are then served as static assets.',
          ],
        },
        {
          kind: 'p',
          text: 'Here, **precompile** mainly means preparing and fingerprinting files. Propshaft itself does not turn them into bundled, minified CSS or JavaScript.',
        },
      ],
    },
    {
      heading: 'Where extra tools fit with Propshaft',
      blocks: [
        {
          kind: 'p',
          text: 'If you use Sass, Tailwind, TypeScript, or a JavaScript bundler, a separate tool produces browser-ready files for Propshaft.',
        },
        {
          kind: 'list',
          items: [
            '**In development**, that tool usually runs in watch mode, rebuilding output when you edit source files. A configured `bin/dev` commonly starts both Rails and these watchers.',
            '**In production**, those builds must finish before Propshaft prepares their output. Rails integration gems commonly connect the build steps to `assets:precompile`.',
          ],
        },
        {
          kind: 'p',
          text: 'With plain CSS and JavaScript loaded through Rails’ default import-map setup, you can avoid a separate bundling step. **Import maps** let browsers resolve JavaScript imports; they do not compile or bundle JavaScript.',
        },
      ],
    },
  ],
  takeaways: [
    'Both pipelines locate assets and prepare fingerprinted filenames so browsers can cache files while pages reference updated versions.',
    'Sprockets can process and combine assets, with compilation and compression depending on the installed processors and configuration.',
    'Propshaft expects browser-ready files. Separate build tools handle compilation, bundling, or minification when needed.',
    'Development usually means edit, save, and refresh. Production uses `assets:precompile` to prepare assets before visitors request them.',
  ],
  goDeeper: [
    {
      label: 'Rails 8 announcement: Propshaft becomes the default',
      url: 'https://rubyonrails.org/2024/11/7/rails-8-no-paas-required',
    },
    {
      label: 'Rails Guides: The Asset Pipeline',
      url: 'https://guides.rubyonrails.org/asset_pipeline.html',
    },
    { label: 'Sprockets documentation', url: 'https://github.com/rails/sprockets' },
    {
      label: 'Rails 7.2 Guides: The Asset Pipeline (Sprockets)',
      url: 'https://guides.rubyonrails.org/v7.2/asset_pipeline.html',
    },
    { label: 'Propshaft documentation', url: 'https://github.com/rails/propshaft' },
  ],
}
