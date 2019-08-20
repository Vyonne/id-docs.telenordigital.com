(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function initGoogleAnalytics() {
    window.ga = window.ga || function () {
        (ga.q = ga.q || []).push(arguments);
    };
    ga.l = +new Date();
    ga("create", "UA-54179841-17", "auto");
    ga("send", "pageview");
}

exports.initGoogleAnalytics = initGoogleAnalytics;

},{}],2:[function(require,module,exports){
"use strict";

var _search = require("./search");

var _sidebar = require("./sidebar");

var _googleAnalytics = require("./google-analytics");

document.addEventListener("DOMContentLoaded", function (event) {
    initBarba();
    (0, _search.initSearch)();
    (0, _sidebar.initSidebar)();
    (0, _googleAnalytics.initGoogleAnalytics)();
    (0, _sidebar.setActiveLink)();
});

function initBarba() {
    Barba.Pjax.start();
    Barba.Prefetch.init();
    Barba.Dispatcher.on("newPageReady", function (currentStatus, oldStatus, container) {
        (0, _sidebar.setActiveLink)();
        (0, _googleAnalytics.initGoogleAnalytics)();
        delete window.pageReady;
        (0, _search.hideSearchResults)();
        (0, _search.hideSearchField)();
        scrollToTop();
        (0, _sidebar.closeSidebar)();

        var js = container.querySelector("script");
        if (js === null) {
            return;
        }

        // eslint-disable-next-line no-eval
        eval(js.innerHTML);

        if (typeof pageReady === "function") {
            pageReady(container);
        }
    });

    if (typeof pageReady === "function") {
        pageReady(document);
    }
}

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

},{"./google-analytics":1,"./search":3,"./sidebar":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hideSearchResults = exports.hideSearchField = exports.initSearch = undefined;

var _sidebar = require("./sidebar");

var searchIndex = null;
var searchFiles = null;

function initSearch() {
    loadSearchIndex();
    initHandlers();
}

function initHandlers() {
    // focus search box on icon click
    document.getElementById("docs-search-show").addEventListener("click", function (e) {
        focusSearchBox();
    });

    // search close button
    document.getElementById("docs-search-close").addEventListener("click", function (e) {
        e.preventDefault();
        hideSearchResults();
        clearSearchBox();
        focusSearchBox();
    });

    // search on input change
    document.getElementById("docs-search-box").addEventListener("input", function (e) {
        search(document.getElementById("docs-search-box").value);
    });

    // search on enter
    document.getElementById("docs-search-box").addEventListener("keydown", function (e) {
        var charCode = e.which || e.keyCode;
        var key = e.key;

        if (key === "Enter" || charCode === "13") {
            search(document.getElementById("docs-search-box").value);
        }
    });

    // hide search results on esc key
    document.addEventListener("keydown", function (e) {
        var charCode = e.which || e.keyCode;
        var key = e.key;

        if (key === "Escape" || charCode === "27") {
            hideSearchResults();
            hideSearchField();
            clearSearchBox();
        }
    });

    // hide search results on click outside
    document.addEventListener("click", function (e) {
        if (document.getElementById("docs-topbar").contains(e.target)) {
            return;
        }

        hideSearchResults();
        hideSearchField();
    });

    document.getElementById("docs-search-show").addEventListener("click", function (e) {
        showSearchField();
    });

    document.getElementById("docs-search-hide").addEventListener("click", function (e) {
        hideSearchResults();
        hideSearchField();
    });

    window.addEventListener("resize", function (event) {
        if (document.getElementById("docs-search-box").value !== "") {
            showSearchField();
        }
    });
}

function loadSearchIndex() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var index = JSON.parse(this.responseText);
            searchIndex = lunr.Index.load(index);
            searchFiles = index.files;
        }
    };
    xhttp.open("GET", document.getElementById("searchIndex").getAttribute("href"), true);
    xhttp.send();
}

function search(text) {
    if (searchIndex === null || text === "") {
        hideSearchResults();
        return;
    }
    (0, _sidebar.closeSidebar)();

    var results = searchIndex.search(text);
    document.getElementById("docs-search-results").innerHTML = "";

    if (results.length < 1) {
        var result = document.createElement("li");
        result.innerHTML = "<h2>No results for <em></em><small> (search requires whole words)</small></h2>";
        result.querySelector("em").appendChild(document.createTextNode(text));

        document.getElementById("docs-search-results").appendChild(result);
    }

    var i = 1;
    for (var key in results) {
        i++;
        var _result = document.createElement("li");
        _result.className = "docs-search-result";

        var resultLink = document.createElement("a");
        resultLink.setAttribute("href", results[key].ref);
        resultLink.setAttribute("tabindex", i);
        resultLink.innerHTML = searchFiles[results[key].ref].title;
        _result.appendChild(resultLink);

        var details = document.createElement("p");
        details.className = "docs-search-result__details";

        if (typeof searchFiles[results[key].ref].description === "string") {
            details.innerHTML = searchFiles[results[key].ref].description;
        }

        _result.appendChild(details);
        document.getElementById("docs-search-results").appendChild(_result);
    }
    showSearchResults();
}

function showSearchField() {
    document.getElementById("docs-topbar__inner").classList.add("docs-topbar__inner--search-open");
}

function hideSearchField() {
    document.getElementById("docs-topbar__inner").classList.remove("docs-topbar__inner--search-open");
    document.getElementById("docs-search-box").value = "";
}

function showSearchResults() {
    document.getElementById("docs-search").style.display = "block";
    document.getElementById("docs-search-close").style.opacity = "1";
    document.getElementById("docs-search-close").style.pointerEvents = "auto";
}

function hideSearchResults() {
    document.getElementById("docs-search").style.display = "none";
    document.getElementById("docs-search-close").style.opacity = "0";
    document.getElementById("docs-search-close").style.pointerEvents = "none";
}

function focusSearchBox() {
    document.getElementById("docs-search-box").focus();
}

function clearSearchBox() {
    document.getElementById("docs-search-box").value = "";
}

exports.initSearch = initSearch;
exports.hideSearchField = hideSearchField;
exports.hideSearchResults = hideSearchResults;

},{"./sidebar":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function openSidebar() {
    document.getElementById("docs-sidebar").classList.add("docs-sidebar--open");
}

function closeSidebar() {
    document.getElementById("docs-sidebar").classList.remove("docs-sidebar--open");
}

function setActiveLink() {
    document.querySelectorAll("a.docs-nav__item--active").forEach(function (el) {
        return el.classList.remove("docs-nav__item--active");
    });
    var activeLink = document.querySelector("a.docs-nav__item[href='" + window.location.pathname + "']");
    if (activeLink !== null) {
        activeLink.classList.add("docs-nav__item--active");
    }
}

function initSidebar() {
    var sidebarWidth = 260;

    document.getElementById("docs-menu-toggle").addEventListener("click", function (e) {
        if (document.getElementById("docs-sidebar").classList.contains("docs-sidebar--open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // hide sidebar on click outside
    document.addEventListener("click", function (e) {
        if (e.x <= sidebarWidth) {
            return;
        }
        closeSidebar();
    });

    // hide sidebar on scroll outside
    document.getElementById("docs-sidebar").addEventListener("touchstart", function (e) {
        if (e.changedTouches[0].pageX <= sidebarWidth) {
            return;
        }
        closeSidebar();
    }, false);
}

exports.initSidebar = initSidebar;
exports.openSidebar = openSidebar;
exports.closeSidebar = closeSidebar;
exports.setActiveLink = setActiveLink;

},{}]},{},[2]);
