// ==UserScript==
// @name        google-scholar.js
// @namespace   https://github.com/organizations/gdut
// @match http://scholar.google.com/scholar*
// @match http://scholar.google.com/scholar.bib*
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function() {
    var utils = {
        tmpl: function(str, data) {
            var re = /\{\{([\w ]+)\}\}/, ret = str;
            var r;

            while ((r = re.exec(ret)) !== null) {
                ret = ret.replace(r[0], data[r[1].trim()]);
            }

            return ret;
        },

        createElement: function(raw) {
            var fake = document.createElement('div');
            fake.innerHTML = raw;
            return fake.childNodes[0];
        }
    };

    var inject = function() {
        var pattern = /.*gs_ocit\(\{\}.*'(.*)',.*/,
            links = document.querySelectorAll('.gs_rt a'),
            fl = document.querySelectorAll('.gs_r .gs_ri .gs_fl'),
            i;

        for (i = fl.length - 1;i >= 0;i--) {
            var url = links[i].href,
                cite = document.getElementById('gs_rm_md' + i),
                info;

            if (!cite) continue;
            cite = pattern.exec(cite.innerHTML);
            if (!cite) continue;
            info = cite[1];

            fl[i].appendChild(utils.createElement(utils.tmpl(
                '<a href="#" data-id={{ id }} data-url={{ url }} ' +
                'class="google-scholar-js-cite">' +
                'Import cite into BibTeX</a>', {
                id: info,
                url: url
            })));
        }
    };

    var bind = function() {
        var buttons = document.querySelectorAll('.google-scholar-js-cite'),
            i;

        var importCite = function(e) {
            e.preventDefault();

            var element = e.target,
                origin_url = element.getAttribute('data-url'),
                url = utils.tmpl(
                    'http://scholar.google.com/scholar.bib?q=info:{{ id }}' +
                    ':scholar.google.com/&output=citation',
                    {id: element.getAttribute('data-id')}
                ),
                tmpl = utils.tmpl('},\n  url={{{url}}}\n}', {url: origin_url});

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(resp) {
                    if (resp.status < 200 || resp.status > 300) return;

                    alert(resp.responseText.replace('}\n}', tmpl));
                }
            });
        };

        for (i = buttons.length - 1;i >= 0;i--) {
            buttons[i].onclick = importCite;
        }
    };


    // kick off
    (function() {
        if (document.location.pathname !== '/scholar') {
            return;
        }

        inject();
        bind();
    })(); 
})();

