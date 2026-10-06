Plans — browser storage edition

No Python, Django, database, passwords, or server required.
Create a named profile and add tasks. Choose Switch profile to open another list.
Profiles and tasks persist in localStorage; the active profile is per browser tab.
Anyone using the same browser can open any profile. This is not authentication.
Data does not sync between devices, browser profiles, or domains.
Clearing browser site data removes saved data. Existing Django data is not imported.

VERCEL: Replace the old repository contents with the files in this ZIP.
Remove the Django files, requirements.txt, and any old build.py or pyproject.toml.
Place index.html, app.mjs, store.mjs, style.css, and vercel.json at repository root.
In Vercel settings use framework Other, repository root as Root Directory,
no install/build command, and output directory ".". Remove old Django overrides.
Commit and deploy. The included vercel.json specifies a static deployment.
Old /signup/ and /login/ bookmarks open the profile screen.

LOCAL: Run python -m http.server 8000 in the extracted folder and open
http://localhost:8000. Use HTTP hosting rather than opening the HTML as a file.

This package has not been pushed to GitHub or deployed to your live Vercel project.
