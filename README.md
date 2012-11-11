Makeup
===========

_Makeup_ is a static site generator / transformer that runs completely on client side.

That means there is no "build" step required before you deploy your
website files. And of course there is nothing to be installed.

http://schettino72.github.com/makeup

Features
-----------

* no "build" step
* convert markdown to HTML (can be extended to support other formats)
* multiple content source files in a single page



Drawbacks
------------

* the whole site will use a single URL where different pages are accessible
  through URL hashes (like http://example.com#/path/to/page)
* the content is loaded by ajax (can not be crawled by search engines)
* an "index" with info of all pages must be loaded on page view
  (so not suitable for very large websites)


How to use it
---------------

For a sample check a _makeup_ website <http://schettino72.github.com/makeup> source
<https://github.com/schettino72/makeup/tree/gh-pages>

Makeup is based on the idea that the pages in your website are divided in
**sections**. Each page contains one or more section, and each section
might contain other sections.

Makeup does not use any type of template system. Sections are inserted
into a HTML document using the _id_ of HTML elements as a reference to
the position where the sections should be inserted.

Each section contains the folowing attributes attributes:

* src (string) -> the url to load the section content
* pos (string) -> the _id_ of the HTML element where the section will be inserted
* processor (function) -> function that performs some kind on transformation
                          on the content (i.e. convert markdown to HTML)
* child (list of section) -> the section might contain a list of child sections
* title (string) -> only used if section is a page, this will be used as the
                    _title_ of the HTML document.


1) Create a base HTML template where you include jQuery, and makeup.js

2) Create an instance of Makeup, it takes 2 parameters:
   * _pos_ (string), to be used as _section.pos_ for all pages.
   * _pages_ (plain object) where the key is the path location of the page
     and the value is a _section_.


3) By default the _processor_ is guessed based on the _src_ name.
   If the file extensions ends with a ".md" the markdown processor will be used.
   Use the _processor_ value `null` to indicate no processing should be done.

4) If the _pos_ of a child section has the same name as the _src_ you can
   describe it by a single string:

    child: [{src: 'my_section.md', pos: 'my_section'}]
    // could be written as
    child: ['my_section.md']


5) You can add your own processor by registering it. For example the built-in
   markdown processor is resgistred like this:

   Makeup.PROCESSOR_MAP['md'] = function(data) { return markdown.toHTML(data);};



Accessing the site from file system
------------------------------------

Makeup load the pages through ajax, browsers will usually block
ajax requests to file system as a security measure.
So to test the site locally you should serve the files from
a web server.

If you have python installed you can just run the command below from
the root folder:

    $ python -m SimpleHTTPServer

