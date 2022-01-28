(function (klartext, undefined) {

// Event handling
klartext.addEvent = function(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
}
klartext.removeEvent = function(el, type, handler) {
    if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
}
klartext.onReady = function(ready) {
    // in case the document is already rendered
    if (document.readyState!=='loading') ready();
    // modern browsers
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', ready);
    // IE <= 8
    else document.attachEvent('onreadystatechange', function(){
            if (document.readyState==='complete') ready();
    });
}

// Site search

function initSearch() {
    var request = new XMLHttpRequest();
    request.open('GET', '/assets/search.json', true);

    request.onload = function(){
        if (request.status >= 200 && request.status < 400) {
            var docs = JSON.parse(request.responseText);

            //lunr.tokenizer.separator = "/[\\s/]+/"; // {/[\s/]+/} {/[\s\-/]+/}

            var index = lunr(function(){
                this.use(lunr.de);
                //this.use(lunr.multiLanguage('en', 'de'));
                this.ref('id');
                this.field('title', { boost: 200 });
                this.field('description', { boost: 100 });
                this.field('content', { boost: 2 });
                this.field('relUrl', {boost: 1 });

                this.metadataWhitelist = ['position']

                for (var i in docs) {
                    this.add({
                        id: i,
                        title: docs[i].title,
                        content: docs[i].content,
                        description: docs[i].description,
                        relUrl: docs[i].relUrl
                    });
                }
            });

            searchLoaded(index, docs);
        } else {
            console.log('Error loading ajax request. Request status:' + request.status);
        }
    };

    request.onerror = function(){
        console.log('There was a connection error');
    };

    request.send();
}

function searchLoaded(index, docs) {
    /*var index = index;
    var docs = docs;*/
    var searchInput = document.getElementById('search-field');
    var searchResults = document.getElementById('search-results');
    var currentInput;
    var currentSearchIndex = 0;

    function showSearch() {
        document.documentElement.classList.add('search-active');
    }

    function hideSearch() {
        document.documentElement.classList.remove('search-active');
    }

    function update() {
        currentSearchIndex++;

        var input = searchInput.value;
        // wieviele Buchstaben müssen mindestens ins Suchfeld eingegeben werden
        // bevor das Sucherergebnisfenster aufspringt? === 3
        if (input.length < 3) {
            hideSearch();
            return;
        } else {
            showSearch();
            // scroll search input into view, workaround for iOS Safari
            window.scroll(0, -1);
            setTimeout(function(){ window.scroll(0, 0); }, 0);
        }
        if (input === currentInput) {
            return;
        }
        currentInput = input;
        searchResults.innerHTML = '';
        if (input === '') {
            return;
        }

        var results = index.query(function (query) {
            var tokens = "" + lunr.tokenizer(input)
            query.term(tokens, {
                boost: 10
            });
            query.term(tokens, {
                wildcard: /*lunr.Query.wildcard.LEADING |*/ lunr.Query.wildcard.TRAILING
            });
        });

        //console.log(input,results);

        if (results.length === 0) {
            var noResultsDiv = document.createElement('div');
            noResultsDiv.classList.add('search-no-result');
            noResultsDiv.innerText = 'Deine Suche blieb erfolglos.';
            searchResults.appendChild(noResultsDiv);

        } else {
            var resultsList = document.createElement('ul');
            resultsList.classList.add('search-results-list');
            searchResults.appendChild(resultsList);

            addResults(resultsList, results, 0, 10, 100, currentSearchIndex);
        }

        function addResults(resultsList, results, start, batchSize, batchMillis, searchIndex) {
            if (searchIndex !== currentSearchIndex) {
                return;
            }
            for (var i = start; i < (start + batchSize); i++) {
                if (i === results.length) {
                    return;
                }
                addResult(resultsList, results[i]);
            }
            setTimeout(function() {
                addResults(resultsList, results, start + batchSize, batchSize, batchMillis, searchIndex);
            }, batchMillis);
        }

        function addResult(resultsList, result) {
            var doc = docs[result.ref];

            var resultsListItem = document.createElement('li');
            resultsListItem.classList.add('search-results-list-item');
            resultsList.appendChild(resultsListItem);

            var resultLink = document.createElement('a');
            resultLink.classList.add('search-result');
            resultLink.setAttribute('href', doc.url);
            resultsListItem.appendChild(resultLink);

            var resultTitle = document.createElement('div');
            resultTitle.classList.add('search-result-title');
            resultLink.appendChild(resultTitle);

            var resultDoc = document.createElement('div');
            resultDoc.classList.add('search-result-doc');
            resultDoc.innerHTML = '<svg viewBox="0 0 24 24" class="search-result-icon"><use xlink:href="#svg-doc"></use></svg>';
            resultTitle.appendChild(resultDoc);

            var resultDocTitleDiv = document.createElement('div');
            resultDoc.appendChild(resultDocTitleDiv);

            var resultDocTitle = document.createElement('div');
            resultDocTitle.classList.add('search-result-doc-title');
            resultDocTitle.innerHTML = doc.title;
            resultDocTitleDiv.appendChild(resultDocTitle);

            var resultRelUrl = document.createElement('div');
            resultRelUrl.classList.add('search-result-rel-url');
            resultRelUrl.innerText = doc.relUrl;
            resultDocTitleDiv.appendChild(resultRelUrl);

            var resultDocDescription = document.createElement('div');
            resultDocDescription.classList.add('search-result-doc-description');
            resultDocDescription.innerHTML = doc.description;
            resultDocTitleDiv.appendChild(resultDocDescription);

            var metadata = result.matchData.metadata;

            var titlePositions = [];
            var descriptionPositions = [];
            var contentPositions = [];

            for (var j in metadata) {
                var meta = metadata[j];
                if (meta.title) {
                    var positions = meta.title.position;
                    for (var k in positions) {
                        titlePositions.push(positions[k]);
                    }
                }
                if (meta.description) {
                    var positions = meta.description.position;
                    for (var k in positions) {
                        descriptionPositions.push(positions[k]);
                    }
                }
                if (meta.content) {
                    var positions = meta.content.position;
                    for (var k in positions) {
                        var position = positions[k];
                        var previewStart = position[0];
                        var previewEnd = position[0] + position[1];
                        var ellipsesBefore = true;
                        var ellipsesAfter = true;
                        for (var k = 0; k < 5; k++) { // site.search.preview_words_before
                            var nextSpace = doc.content.lastIndexOf(' ', previewStart - 2);
                            var nextDot = doc.content.lastIndexOf('. ', previewStart - 2);
                            if ((nextDot >= 0) && (nextDot > nextSpace)) {
                                previewStart = nextDot + 1;
                                ellipsesBefore = false;
                                break;
                            }
                            if (nextSpace < 0) {
                                previewStart = 0;
                                ellipsesBefore = false;
                                break;
                            }
                            previewStart = nextSpace + 1;
                        }
                        for (var k = 0; k < 10; k++) { // site.search.preview_words_after
                            var nextSpace = doc.content.indexOf(' ', previewEnd + 1);
                            var nextDot = doc.content.indexOf('. ', previewEnd + 1);
                            if ((nextDot >= 0) && (nextDot < nextSpace)) {
                                previewEnd = nextDot;
                                ellipsesAfter = false;
                                break;
                            }
                            if (nextSpace < 0) {
                                previewEnd = doc.content.length;
                                ellipsesAfter = false;
                                break;
                            }
                            previewEnd = nextSpace;
                        }
                        contentPositions.push({
                            highlight: position,
                            previewStart: previewStart, previewEnd: previewEnd,
                            ellipsesBefore: ellipsesBefore, ellipsesAfter: ellipsesAfter
                        });
                    }
                }
            }

            if (titlePositions.length > 0) {
                titlePositions.sort(function(p1, p2){ return p1[0] - p2[0] });
                resultDocTitle.innerHTML = '';
                addHighlightedText(resultDocTitle, doc.title, 0, doc.title.length, titlePositions);
            }

            if (descriptionPositions.length > 0) {
                descriptionPositions.sort(function(p1, p2){ return p1[0] - p2[0] });
                resultDocDescription.innerHTML = '';
                addHighlightedText(resultDocDescription, doc.description, 0, doc.description.length, descriptionPositions);
            }

            if (contentPositions.length > 0) {
                contentPositions.sort(function(p1, p2){ return p1.highlight[0] - p2.highlight[0] });
                var contentPosition = contentPositions[0];
                var previewPosition = {
                    highlight: [contentPosition.highlight],
                    previewStart: contentPosition.previewStart, previewEnd: contentPosition.previewEnd,
                    ellipsesBefore: contentPosition.ellipsesBefore, ellipsesAfter: contentPosition.ellipsesAfter
                };
                var previewPositions = [previewPosition];
                for (var j = 1; j < contentPositions.length; j++) {
                    contentPosition = contentPositions[j];
                    if (previewPosition.previewEnd < contentPosition.previewStart) {
                        previewPosition = {
                            highlight: [contentPosition.highlight],
                            previewStart: contentPosition.previewStart, previewEnd: contentPosition.previewEnd,
                            ellipsesBefore: contentPosition.ellipsesBefore, ellipsesAfter: contentPosition.ellipsesAfter
                        }
                        previewPositions.push(previewPosition);
                    } else {
                        previewPosition.highlight.push(contentPosition.highlight);
                        previewPosition.previewEnd = contentPosition.previewEnd;
                        previewPosition.ellipsesAfter = contentPosition.ellipsesAfter;
                    }
                }

                var resultPreviews = document.createElement('div');
                resultPreviews.classList.add('search-result-previews');
                resultLink.appendChild(resultPreviews);

                var content = doc.content;
                for (var j = 0; j < Math.min(previewPositions.length, 3); j++) { // site.search.previews
                    var position = previewPositions[j];

                    var resultPreview = document.createElement('div');
                    resultPreview.classList.add('search-result-preview');
                    resultPreviews.appendChild(resultPreview);

                    if (position.ellipsesBefore) {
                        resultPreview.appendChild(document.createTextNode('... '));
                    }
                    addHighlightedText(resultPreview, content, position.previewStart, position.previewEnd, position.highlight);
                    if (position.ellipsesAfter) {
                        resultPreview.appendChild(document.createTextNode(' ...'));
                    }
                }
            }
        }

        function addHighlightedText(parent, text, start, end, positions) {
            var index = start;
            for (var i in positions) {
                var position = positions[i];
                var span = document.createElement('span');
                span.innerHTML = text.substring(index, position[0]);
                parent.appendChild(span);
                index = position[0] + position[1];
                var highlight = document.createElement('span');
                highlight.classList.add('search-result-highlight');
                highlight.innerHTML = text.substring(position[0], index);
                parent.appendChild(highlight);
            }
            var span = document.createElement('span');
            span.innerHTML = text.substring(index, end);
            parent.appendChild(span);
        }
    }

    klartext.addEvent(searchInput, 'focus', function(){
        setTimeout(update, 0);
    });

    klartext.addEvent(searchInput, 'keyup', function(e){
        switch (e.keyCode) {
            case 27: // When esc key is pressed, hide the results and clear the field
                searchInput.value = '';
                break;
            case 38: // arrow up
            case 40: // arrow down
            case 13: // enter
                e.preventDefault();
                return;
        }
        update();
    });

    klartext.addEvent(searchInput, 'keydown', function(e){
        switch (e.keyCode) {
            case 38: // arrow up
                e.preventDefault();
                var active = document.querySelector('.search-result.active');
                if (active) {
                    active.classList.remove('active');
                    if (active.parentElement.previousSibling) {
                        var previous = active.parentElement.previousSibling.querySelector('.search-result');
                        previous.classList.add('active');
                    }
                }
                return;
            case 40: // arrow down
                e.preventDefault();
                var active = document.querySelector('.search-result.active');
                if (active) {
                    if (active.parentElement.nextSibling) {
                        var next = active.parentElement.nextSibling.querySelector('.search-result');
                        active.classList.remove('active');
                        next.classList.add('active');
                    }
                } else {
                    var next = document.querySelector('.search-result');
                    if (next) {
                        next.classList.add('active');
                    }
                }
                return;
            case 13: // enter
                e.preventDefault();
                var active = document.querySelector('.search-result.active');
                if (active) {
                    active.click();
                } else {
                    var first = document.querySelector('.search-result');
                    if (first) {
                        first.click();
                    }
                }
                return;
        }
    });

    klartext.addEvent(document, 'click', function(e){
        if (e.target !== searchInput) {
            hideSearch();
        }
    });
}

// Document ready
klartext.onReady(function(){
    initSearch();
});

})(window.klartext = window.klartext || {});
