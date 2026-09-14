# Favicon

Three candidates for the tab icon, compared at the sizes a browser actually
draws them: 16px and 32px in light and dark tab bars, and 60px on a home screen.
Open `compare.html` from a local server to see them side by side.

| | Candidate | Result |
| --- | --- | --- |
| A | `favicon-head.svg` — the board's cobra head sprite | Not chosen |
| B | `favicon-crest.svg` — the whole cobra from the crest | Not chosen |
| C | the crest's cobra, cropped to the hood | **Shipped** as `/favicon.svg` |

C won because it is the only one that still reads at sixteen pixels.

The shipped file lives only at the repo root, and `compare.html` points there,
so the comparison can never drift from what is live.
