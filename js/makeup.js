/* Makekup - client-side static site generator / transformer
 * https://github.com/schettino72/makeup
 * MIT License
 */


function Makeup (content_id, pages){
    // @param content_id: (str) id of HTML element on template
    // @param pages: (dict) page config info

    var sections = {};
    $.each(pages, function(k,v){
        sections[k] = new Section(v, content_id);
    });
    this.pages = sections;

    // sanity check
    if (this.pages['/'] === undefined){
        throw Error('Must include root "/" page');
    }

    // bind events
	//$(window).bind('hashchange', $.proxy(this.hash_changed, this));
    //this.hash_changed();
    $('body').on('click', 'a', $.proxy(this.handle_click, this));

    this.set_page(location.pathname);
}

// processors that convert raw content into HTML
Makeup.PROCESSOR_MAP = {
    'md': function(data) { return markdown.toHTML(data);}
};


// based on jquery.pjax.js:handleClick
// https://github.com/defunkt/jquery-pjax/blob/master/jquery.pjax.js
Makeup.prototype.handle_click = function(event) {
    var link = event.currentTarget;

    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( event.which > 1 || event.metaKey || event.ctrlKey ||
         event.shiftKey || event.altKey )
        return;

    // Ignore cross origin links
    if ( location.protocol !== link.protocol || location.host !== link.host )
        return;

    // Ignore anchors on the same page
    if (link.hash && link.href.replace(link.hash, '') ===
        location.href.replace(location.hash, ''))
        return;

    // Ignore empty anchor "foo.html#"
    if (link.href === location.href + '#')
        return;

    this.set_page(link.pathname);

    event.preventDefault();
};


Makeup.prototype.set_page = function(path){
    // change location
    var page = this.pages[path];
    if (page === undefined){ // page not found
        // if no 404 (page not found) specified redirect to root
        if (this.pages['__404__'] == undefined){
            this.set_page('/');
            return
        }
        // page not found - redirect to root
        page = this.pages['__404__'];
    }
    document.title = page.title;
    page.load();
};



function Section(opts, position){

    // convert shorthand single string to dict
    if (typeof opts === 'string'){
        opts = {src: opts};
    }

    this.title = opts.title; // (str) only used by pages
    this.pos = opts.pos || position; // HTML id
    this.src = opts.src;
    this.processor = opts.processor;
    this.child = [];
    if (opts.child){
        $.each(opts.child, $.proxy(function(_,v){
            this.child.push(new Section(v));
        }, this));
    }

    // if pos not defined get it from src
    if (!this.pos){
        this.pos = this.src.split('.')[0];
    }
    if (!this.processor) {
        var parts = this.src.split('.');
        var ext = parts[parts.length-1];
        this.processor = Makeup.PROCESSOR_MAP[ext];
    }
}

Section.prototype.load = function(){
    this.$ele = $('#' + this.pos);
    $.ajax({
        url: this.src,
        context: this,
        success: this.load_cb,
        error: function(){console.log('oops');}
    });
};

Section.prototype.load_cb = function(data){
    // load content callback
    // 1 - process/convert raw data
    if (this.processor){
        data = this.processor(data);
    }
    // 2 - insert into page
    this.$ele.html(data);
    // 3 - load child elements
    $.each(this.child, function(_, child){
        child.load();
    });
};
