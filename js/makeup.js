/* Makekup - client-side static site generator / transformer
 * https://github.com/schettino72/makeup
 * MIT License
 */

function Makeup (content_id, pages){
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
	$(window).bind('hashchange', $.proxy(this.hash_changed, this));
    this.hash_changed();
}

Makeup.PROCESSOR_MAP = {'md': function(data) { return markdown.toHTML(data);}};


Makeup.prototype.hash_changed = function() {
    var path = '/'; //default path
	if ( location.hash ) {
		path = location.hash.substring(1); // substring removes '#'
	}
    this.set_page(path);
};

Makeup.prototype.set_page = function(path){
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
    this.pos = opts.pos || position;
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

Section.prototype.load = function(pos, section){
    this.$ele = $('#' + this.pos);
    $.ajax({
        url: this.src,
        context: this,
        success: this.load_cb
    });
};

Section.prototype.load_cb = function(data){
    if (this.processor){
        data = this.processor(data);
    }
    this.$ele.html(data);
    $.each(this.child, function(_, child){
        child.load();
    });
};
