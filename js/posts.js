/* =====================================================================
   THE MRAKI ARCHIVE  -  posts
   ---------------------------------------------------------------------
   This is the only file to edit when adding a post.

   Put every new post at the TOP of the list. The order here is the
   order on the site, newest first, and the index tree is built from it.

   A post looks like this:

   {
     title:  "Name of the post",
     images: [                                  // none, one or several
       "assets/images/posts/name-1.png",
       "assets/images/posts/name-2.png"
     ],
     text: `
       <p>The description. Plain HTML works here: <b>bold</b>,
       <i>italic</i>, <a href="https://...">links</a>, lists, line breaks.</p>
       <p>A second paragraph.</p>
     `,
     links: [                                   // none, one or several
       { label: "Repository", url: "https://github.com/amojovic/..." },
       { label: "Video",      url: "https://www.youtube.com/watch?v=..." }
     ]
   },

   Images go in assets/images/posts/. Any size works, they are scaled to
   fit, but keeping them under ~1600 px wide keeps the page light.
   ===================================================================== */

window.MRAKI_POSTS = [

  {
    title: "FourWay Dash",
    images: [
      "assets/images/posts/fourway-dash-1.png",
      "assets/images/posts/fourway-dash-2.png"
    ],
    text: `
      <p>A small reflex game. An arrow appears and you answer it in the same
      direction before it disappears, with the arrow keys on a computer or a
      swipe on a phone. Keep going until the timer runs out and the next level
      opens. Later levels start bending the rules, with colours that mirror or
      rotate the arrows and words where the arrows used to be.</p>
      <p>There are 16 levels. I challenge you to finish all of them.</p>
    `,
    links: [
      { label: "Play in browser", url: "https://amojovic.github.io/fourway-dash/" }
    ]
  }

];
