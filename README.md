Makeup
===========

_Makeup_ is a static site generator / transformer that (may) run completely on client side.

That means there is no "build" step required before you deploy your
website files. And of course there is nothing to be installed (but a webserver).

Goals
------------

* better than static HTML
    - use "HTML template" page for common content shared by pages
    - write content in markdown

* better than conventional (server-side) static site generators
    - minimal setup, no installation (easy for non-technical people)
    - easy to use, no template language required just plain HTML is enough
    - [TODO] optional use of template language (mustache)
    - [TODO] optional offline content generation

* better than dynamic sites
    - faster (use static files)
    - edit content offline
    - [TODO] optional web UI to edit content


How it works
---------------

#### HTML template

Create a basic HTML "template" file where you must include
[jquery.js](http://jquery.com/),
[markdown.js](https://github.com/evilstreak/markdown-js) and `makeup.js`

     <script src="/js/jquery.min.js"></script>
     <script src="/js/markdown.js" ></script>
     <script src="/js/makeup.js"></script>


Add an element to be the placeholder for the content:

     <div id="main"></div>

Add some javascript code to start-up _makeup_ loading some config from a JSON file:

     <script type="text/javascript">
        $.getJSON("/pages.json", function(data){
           new Makeup('main', data.pages);
        });
     </script>


#### PAGES configuration

Create a JSON file with some metadata about your pages

    {
        "pages": {
            "/": {"title": "makeup", "src": "README.md"},

            "/mypage2": {"title": "makeup - page2", "src": "/page2.html",
                       "child": ["part1.md", "part2.md"]},

            "__404__": {"title": "not found", "src": "/_404.html"}
        }
    }


The key for `pages` is the URL _route_ used to access the page.
Its values contains some data point to the location of the actual
data in the file system.

This example has only 3 pages:

 * A root page `/` with content in markdown from `README.md`

 * `mypage2` is composed of a HTML template "page.html" and content taken
   from 2 files with markdown. The template defines placeholder for the markdown
   content using an HTMl element with an ID. `<div id="part1"></div>` will
   receive the content from the file `part1.md`

 * `__404__` is a special page that will be used when a URL is not in `pages.json`


#### content files

Content can written in plain HTMl or in markdown. Markdown will be processed
by in the javascript library [markdown-js](https://github.com/evilstreak/markdown-js).

By default _makeup_ will guess the type looking at the file extension,
but it can be explicitly set.


#### server configuration

A _makeup_ up site is composed only of static files.
But it does not have a mapping one-to-one for URL's and files.

The URL mapping is handling on client-side by javascript.
The server needs to be configured to serve `index.html` for whatever
URL that does not match a file.

For example in `nginx` we have:

    server {
    	#listen   80; ## listen for ipv4; this line is default and implied

    	root /path/to/your/site;
    	index index.html index.htm;

    	# Make site accessible from http://localhost/
    	server_name localhost;

    	location / {
    		# First attempt to serve request as file, then
    		# fall back to index.html
    		try_files $uri /index.html;
    	}
    }


#### page routing

When a page is accessed the first time in a session.
It will always get the `index.html` for whatever URL.

On page load during _makeup_ initialization it will:

 * look into the current URL location
 * find the matching page according to `pages.json`
 * send an AJAX request to fetch the content
 * after receiving the content, apply a filter if any (convert markdown to HTML)
 * insert HTML into page DOM

_makeup_ will also handle every click to a link (`a`).
Instead of just sending an HTTP to the given `href` it will
try to match the URL to given route and send a request to retrieve
only the content part.

It than manipulates the browser history to give the user the impression
that he navigated to a different page.


Example
-----------

If you are reading this at [makeup.schettino72.net](http://makeup.schettino72.net)
you can check the source for this page :)

The full source can be found on the [github repo](https://github.com/schettino72/makeup/tree/gh-pages).

On the [top](#menu) it contains a menu so you can see it action...


Drawbacks
------------

By default, the content is loaded by ajax (so can not be crawled by search engines) - see roadmap below for possible solutions.


Roadmap
----------

* offline generation of HTML (make it crawlable using a static server)
* server-side implementation (make it crawlable using a dynamic server)
* support mustache templates
* web UI to edit pages


Usage
-------

_Makeup_ is based on the idea that the pages in your website are divided in
**sections**. Each page contains one or more section, and each section
might contain other sections.

_Makeup_ does not use any type of template system. Sections are inserted
into a HTML document using the _id_ of HTML elements as a reference to
the position where the sections should be inserted.

Each section contains the following attributes attributes:

* src (string) -> the path to load the section content
* pos (string) -> the _id_ of the HTML element where the section will be inserted
* processor (function) -> function that performs some kind on transformation
                          on the content (i.e. convert markdown to HTML)
* child (list of section) -> the section might contain a list of child sections
* title (string) -> only used if section is a page, this will be used as the
                    _title_ of the HTML document.


Create an instance of `Makeup`, it takes 2 parameters:

   * _pos_ (string), to be used as _section.pos_ for all pages.
   * _pages_ (plain object) where: the key is the path location of the page,
     the value is a _section_.


By default the _processor_ is guessed based on the _src_ name.
If the file extensions ends with a ".md" the markdown processor will be used.
Use the _processor_ value `null` to indicate no processing should be done.

If the _pos_ of a child section has the same name as the _src_ you can
describe it by a single string:

    child: [{src: 'my_section.md', pos: 'my_section'}]
    // could be written as
    child: ['my_section.md']


You can add your own processor by registering it. For example the built-in
markdown processor is registered like this:

   Makeup.PROCESSOR_MAP['md'] = function(data) { return markdown.toHTML(data);};



development server
--------------------

To test the site locally you should serve the files from
a web server. Remember that you need some special configuration
as explained in the _server configuration_ section above.

If you have python installed you can just the provided
[server.py](https://github.com/schettino72/makeup/blob/master/serve.py).
It has no external dependencies, just put the script in the root of your site
and execute the command:

    $ python serve.py



FAQ
-------

Can I serve a _makeup_ site on [github pages](http://pages.github.com/)?

Yes. But it has 2 caveats. First, you need to serve the site on your domain.
Second, github-pages has no support for something like nginx `try_files`...
the tricky is to use the `404.html` to serve `index.html`.
It works, but the browser will get a `404` as HTTP response
if the first page accessed is not _index.html_.
Actually this [site](http://makeup.schettino72.net) is being hosted on github-pages :)
