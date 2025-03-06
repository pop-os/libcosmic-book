// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="introduction.html"><strong aria-hidden="true">1.</strong> Introduction</a></li><li class="chapter-item expanded "><a href="mvu.html"><strong aria-hidden="true">2.</strong> Model-View-Update (MVU)</a></li><li class="chapter-item expanded "><a href="application-trait.html"><strong aria-hidden="true">3.</strong> The Application Trait</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="tasks.html"><strong aria-hidden="true">3.1.</strong> Tasks</a></li><li class="chapter-item expanded "><a href="subscriptions.html"><strong aria-hidden="true">3.2.</strong> Subscriptions</a></li><li class="chapter-item expanded "><a href="nav-bar.html"><strong aria-hidden="true">3.3.</strong> Nav Bar</a></li><li class="chapter-item expanded "><a href="menu-bar.html"><strong aria-hidden="true">3.4.</strong> Menu Bar</a></li><li class="chapter-item expanded "><a href="context-drawer.html"><strong aria-hidden="true">3.5.</strong> Context Drawer</a></li><li class="chapter-item expanded "><a href="dialogs.html"><strong aria-hidden="true">3.6.</strong> Dialogs</a></li></ol></li><li class="chapter-item expanded "><a href="structure.html"><strong aria-hidden="true">4.</strong> Structure</a></li><li class="chapter-item expanded "><a href="widgets.html"><strong aria-hidden="true">5.</strong> Widgets</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="text.html"><strong aria-hidden="true">5.1.</strong> Text</a></li><li class="chapter-item expanded "><a href="container.html"><strong aria-hidden="true">5.2.</strong> Container</a></li><li class="chapter-item expanded "><a href="column.html"><strong aria-hidden="true">5.3.</strong> Column</a></li><li class="chapter-item expanded "><a href="row.html"><strong aria-hidden="true">5.4.</strong> Row</a></li><li class="chapter-item expanded "><a href="buttons.html"><strong aria-hidden="true">5.5.</strong> Buttons</a></li><li class="chapter-item expanded "><a href="icon.html"><strong aria-hidden="true">5.6.</strong> Icon</a></li><li class="chapter-item expanded "><a href="image.html"><strong aria-hidden="true">5.7.</strong> Image</a></li><li class="chapter-item expanded "><a href="svg.html"><strong aria-hidden="true">5.8.</strong> Svg</a></li><li class="chapter-item expanded "><a href="divider.html"><strong aria-hidden="true">5.9.</strong> Divider</a></li><li class="chapter-item expanded "><a href="space.html"><strong aria-hidden="true">5.10.</strong> Space</a></li><li class="chapter-item expanded "><a href="text-input.html"><strong aria-hidden="true">5.11.</strong> Text Input</a></li><li class="chapter-item expanded "><a href="toggler.html"><strong aria-hidden="true">5.12.</strong> Toggler</a></li><li class="chapter-item expanded "><a href="slider.html"><strong aria-hidden="true">5.13.</strong> Slider</a></li><li class="chapter-item expanded "><a href="radio.html"><strong aria-hidden="true">5.14.</strong> Radio</a></li><li class="chapter-item expanded "><a href="check-box.html"><strong aria-hidden="true">5.15.</strong> Check Box</a></li><li class="chapter-item expanded "><a href="dropdown.html"><strong aria-hidden="true">5.16.</strong> Dropdown</a></li><li class="chapter-item expanded "><a href="spin-button.html"><strong aria-hidden="true">5.17.</strong> Spin Button</a></li><li class="chapter-item expanded "><a href="color-picker.html"><strong aria-hidden="true">5.18.</strong> Color Picker</a></li><li class="chapter-item expanded "><a href="flex-row.html"><strong aria-hidden="true">5.19.</strong> Flex Row</a></li><li class="chapter-item expanded "><a href="grid.html"><strong aria-hidden="true">5.20.</strong> Grid</a></li><li class="chapter-item expanded "><a href="segmented-buttons.html"><strong aria-hidden="true">5.21.</strong> Segmented Buttons</a></li><li class="chapter-item expanded "><a href="tab-bar.html"><strong aria-hidden="true">5.22.</strong> Tab Bar</a></li><li class="chapter-item expanded "><a href="segmented-controls.html"><strong aria-hidden="true">5.23.</strong> Segmented Controls</a></li><li class="chapter-item expanded "><a href="context-menu.html"><strong aria-hidden="true">5.24.</strong> Context Menu</a></li><li class="chapter-item expanded "><a href="pane-grid.html"><strong aria-hidden="true">5.25.</strong> Pane Grid</a></li></ol></li><li class="chapter-item expanded "><a href="creating-a-widget.html"><strong aria-hidden="true">6.</strong> Creating a Widget</a></li><li class="chapter-item expanded "><a href="creating-an-overlay.html"><strong aria-hidden="true">7.</strong> Creating an Overlay</a></li><li class="chapter-item expanded "><a href="examples.html"><strong aria-hidden="true">8.</strong> Examples</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="todo.html"><strong aria-hidden="true">8.1.</strong> Todo</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
