# Admin CMS — Projects / Events / Locations

This work adds an admin CMS scaffold for managing Projects, Events, and Locations with translations (en/uk) and image attachments.

What to test
- Sign in as an admin user and visit /admin/projects
- Create a project, add en/uk translations, upload images via the uploader, and save.
- Edit an existing project and verify translations and images persist.

Notes
- Rich-text editing uses TipTap for the English content field; Ukrainian content uses a simple textarea for now.
- The server persists translations in the ProjectTranslation table.
- Soft delete is implemented by setting project.status = 'archived'.

