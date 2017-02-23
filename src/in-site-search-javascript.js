// MIT © 2017 azu
"use strict";
const $ = require("jquery");
const Mark = require("mark.js");
const Combokeys = require("combokeys");
const debounce = require("lodash.debounce");
const CSS = `<style>
mark {
  background: yellow;
}

mark.in-site-search-javascript-header-current {
  background: orange;
}
.in-site-search-javascript-header.hidden {
  display: none;
}
.in-site-search-javascript-header {
  padding: 10px;
  width: 100%;
  background: #eee;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 555566;
}
</style>`;
const HTML = `<div class="in-site-search-javascript-header hidden">
  Search:
  <input type="search" placeholder="word">
  <button data-search="next">&darr;</button>
  <button data-search="prev">&uarr;</button>
  <button data-search="clear">✖</button>
</div>`;
$(document.body).append(HTML);
$(document.head).append(CSS);
const combokeys = new Combokeys(document.documentElement);
$(function () {

    // the input field
    var $input = $(".in-site-search-javascript-header input[type='search']"),
        // clear button
        $clearBtn = $(".in-site-search-javascript-header button[data-search='clear']"),
        // prev button
        $prevBtn = $(".in-site-search-javascript-header button[data-search='prev']"),
        // next button
        $nextBtn = $(".in-site-search-javascript-header button[data-search='next']"),
        // the context where to search
        markContent = new Mark(document.body),
        // jQuery object to save <mark> elements
        $results,
        // the class that will be appended to the current
        // focused element
        currentClass = "in-site-search-javascript-header-current",
        // top offset for the jump (the search bar)
        offsetTop = 50,
        // the current index of the focused element
        currentIndex = 0;

    /**
     * Jumps to the element matching the currentIndex
     */
    function jumpTo() {
        if ($results.length) {
            var position,
                $current = $results.eq(currentIndex);
            $results.removeClass(currentClass);
            if ($current.length) {
                $current.addClass(currentClass);
                position = $current.offset().top - offsetTop;
                window.scrollTo(0, position);
            }
        }
    }

    /**
     * Searches for the entered keyword in the
     * specified context on input
     */
    $input.on("input", debounce(function () {
        var searchVal = this.value;
        if (searchVal.length < 3) {
            return;
        }
        markContent.unmark({
            done: function () {
                markContent.mark(searchVal, {
                    separateWordSearch: true,
                    done: function () {
                        $results = $(document.body).find("mark");
                        currentIndex = 0;
                        jumpTo();
                    }
                });
            }
        });
    }, 500));

    /**
     * Clears the search
     */
    $clearBtn.on("click", function () {
        markContent.unmark();
        $input.val("").focus();
    });

    /**
     * Next and previous search jump to
     */
    $nextBtn.add($prevBtn).on("click", function () {
        if ($results.length) {
            currentIndex += $(this).is($prevBtn) ? -1 : 1;
            if (currentIndex < 0) {
                currentIndex = $results.length - 1;
            }
            if (currentIndex > $results.length - 1) {
                currentIndex = 0;
            }
            jumpTo();
        }
    });
    combokeys.bind('command+g', function () {
        $nextBtn.click();
        return false;
    });
    combokeys.bind('shift+command+g', function () {
        $prevBtn.click();
        return false;
    });
    combokeys.bind('command+f', function () {
        document.querySelector(".in-site-search-javascript-header").classList.toggle("hidden");
        $input.focus();
        return false;
    });
    combokeys.bind('/', function () {
        document.querySelector(".in-site-search-javascript-header").classList.toggle("hidden");
        $input.focus();
        return false;
    });
});
