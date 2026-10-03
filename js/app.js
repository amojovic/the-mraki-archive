/* =====================================================================
   THE MRAKI ARCHIVE  -  builds the index tree and the posts.
   Vanilla JS, no dependencies. Reads window.MRAKI_POSTS from posts.js.
   ===================================================================== */
(function () {
  "use strict";

  var POSTS = (window.MRAKI_POSTS || []).filter(Boolean);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Stable anchor ids from titles, unique even if two titles match.
  var used = {};
  function slug(title) {
    var base = String(title || "post").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "post";
    var id = "p-" + base, n = 2;
    while (used[id]) id = "p-" + base + "-" + n++;
    used[id] = true;
    return id;
  }

  // --- index tree --------------------------------------------------------
  function renderTree(ids) {
    var rows = ['<li class="tree-root">mraki-archive/</li>'];
    if (!POSTS.length) {
      rows.push('<li><span class="branch">└── </span><span class="tree-empty">(empty)</span></li>');
    }
    POSTS.forEach(function (p, i) {
      var last = i === POSTS.length - 1;
      rows.push(
        '<li><span class="branch">' + (last ? "└" : "├") + "── </span>" +
        '<a href="#' + ids[i] + '">' + esc(p.title) + "</a></li>"
      );
    });
    document.getElementById("tree").innerHTML = rows.join("");
    document.getElementById("post-count").textContent =
      POSTS.length + (POSTS.length === 1 ? " post" : " posts");
  }

  // --- one post ----------------------------------------------------------
  // Only one <img> per post exists at a time: prev/next swap its src, so a
  // post with many images never holds more than one decoded image.
  function mediaMarkup(p) {
    var imgs = p.images || [];
    if (!imgs.length) return "";
    var nav = imgs.length > 1
      ? '<div class="media-nav">' +
          '<button type="button" class="linkish" data-step="-1">&laquo; prev</button>' +
          '<span class="media-count">image 1 of ' + imgs.length + "</span>" +
          '<button type="button" class="linkish" data-step="1">next &raquo;</button>' +
        "</div>"
      : "";
    return (
      '<div class="post-media" data-i="0">' +
        '<div class="frame"><img src="' + esc(imgs[0]) + '" alt="' + esc(p.title) +
        '" loading="lazy" decoding="async" title="click to enlarge" /></div>' +
        nav +
      "</div>"
    );
  }

  function linksMarkup(p) {
    var links = p.links || [];
    if (!links.length) return "";
    return (
      '<div class="post-links"><span class="links-label">links:</span>' +
      links.map(function (l) {
        return '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
          esc(l.label || l.url) + "</a>";
      }).join("") +
      "</div>"
    );
  }

  function renderPosts(ids) {
    var root = document.getElementById("posts");
    if (!POSTS.length) {
      root.innerHTML =
        '<section class="box"><h2 class="box-head"><span>posts</span></h2>' +
        '<div class="box-body empty">There are no posts in this archive yet.</div></section>';
      return;
    }
    root.innerHTML = POSTS.map(function (p, i) {
      return (
        '<article class="box post" id="' + ids[i] + '" data-post="' + i + '">' +
          '<h2 class="post-head"><span class="post-title">' + esc(p.title) + "</span>" +
          '<a class="post-top" href="#top">top &uarr;</a></h2>' +
          '<div class="box-body">' +
            mediaMarkup(p) +
            '<div class="post-text">' + (p.text || "") + "</div>" +
            linksMarkup(p) +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  // --- image stepping inside a post ----------------------------------------
  function step(media, dir) {
    var p = POSTS[+media.closest(".post").dataset.post];
    var imgs = p.images || [];
    var i = (+media.dataset.i + dir + imgs.length) % imgs.length;
    media.dataset.i = i;
    media.querySelector("img").src = imgs[i];
    media.querySelector(".media-count").textContent = "image " + (i + 1) + " of " + imgs.length;
  }

  // --- lightbox ------------------------------------------------------------
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightbox-img");
  var lbCount = document.getElementById("lightbox-count");
  var lbList = [], lbIndex = 0;

  function lbShow() {
    lbImg.src = lbList[lbIndex] || "";
    var multi = lbList.length > 1;
    lbCount.textContent = multi ? "image " + (lbIndex + 1) + " of " + lbList.length : "";
    lb.querySelectorAll('[data-lb="prev"], [data-lb="next"]').forEach(function (b) {
      b.hidden = !multi;
    });
  }
  function lbOpen(list, index) {
    lbList = list; lbIndex = index;
    lbShow();
    lb.hidden = false;
    document.body.classList.add("no-scroll");
  }
  function lbClose() {
    lb.hidden = true;
    lbImg.src = "";
    document.body.classList.remove("no-scroll");
  }
  function lbGo(dir) {
    if (lbList.length < 2) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    lbShow();
  }

  // --- wiring --------------------------------------------------------------
  function init() {
    var ids = POSTS.map(function (p) { return slug(p.title); });
    renderTree(ids);
    renderPosts(ids);

    document.getElementById("posts").addEventListener("click", function (ev) {
      var stepBtn = ev.target.closest("[data-step]");
      if (stepBtn) {
        step(stepBtn.closest(".post-media"), +stepBtn.dataset.step);
        return;
      }
      var img = ev.target.closest(".frame img");
      if (img) {
        var media = img.closest(".post-media");
        var p = POSTS[+media.closest(".post").dataset.post];
        lbOpen(p.images || [], +media.dataset.i);
      }
    });

    lb.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-lb]");
      if (b) {
        var a = b.dataset.lb;
        if (a === "close") lbClose(); else lbGo(a === "next" ? 1 : -1);
      } else if (ev.target === lb) {
        lbClose();
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (lb.hidden) return;
      if (ev.key === "Escape") lbClose();
      else if (ev.key === "ArrowLeft") lbGo(-1);
      else if (ev.key === "ArrowRight") lbGo(1);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
