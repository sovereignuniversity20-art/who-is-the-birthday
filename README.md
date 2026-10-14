# Who is The Birthday??!

A tap-through digital birthday card for Deedee (10/14). Static site, hosted on GitHub Pages.

- `index.html`, `style.css`, `app.js`: the card
- `img/`: edited photos, collage originals, patterns, skyline and library art
- `audio/`: cleaned narration for screens 1–8 and the birthday song (`song.mp3`)
- `config.js`: Google Form + Sheet settings for messages
- `messages.json`: messages hard-coded into the card (shown on the last screen)

## Turn on the website (GitHub Pages)

Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)` → **Save**.
After a minute the card is live at `https://sovereignuniversity20-art.github.io/who-is-the-birthday/`.

## Hook up messages (Google Form + Sheet), about 10 minutes

1. Go to <https://forms.google.com>, make a **Blank form** titled anything (e.g. "Messages for The Birthday").
2. Add a **Paragraph** question titled **Message** (turn on *Required*).
3. Add a **Short answer** question titled **Name**.
4. **Settings** tab → *Responses* → make sure **Collect email addresses** is *Do not collect* and **Restrict to users in your organization / Limit to 1 response** are *off*.
5. **Responses** tab → **Link to Sheets** → *Create a new spreadsheet*.
6. In that Google Sheet: **File → Share → Publish to web** → choose the *Form Responses 1* sheet and **Comma-separated values (.csv)** → **Publish**. Copy the link.
7. Back in the form: **⋮ menu → Get pre-filled link**, type `MSG` in Message and `NAME` in Name, click **Get link → Copy link**.
   The link looks like `https://docs.google.com/forms/d/e/LONG_ID/viewform?usp=pp_url&entry.111111=MSG&entry.222222=NAME`.
8. Send Claude (or paste into `config.js` yourself):
   - `formResponseUrl`: the link up to `LONG_ID/`, ending in `formResponse` instead of `viewform`,
     e.g. `https://docs.google.com/forms/d/e/LONG_ID/formResponse`
   - `messageEntry`: `entry.111111` (the one followed by `=MSG`)
   - `nameEntry`: `entry.222222` (the one followed by `=NAME`)
   - `sheetCsvUrl`: the link from step 6

Google refreshes the published CSV every few minutes, so a new message can take ~5 minutes to show up for other visitors.
The sender always sees their own message right away.

## Hard-coding messages

To freeze messages into the card (e.g. after the birthday), add them to `messages.json`:

```json
[
  { "name": "Kim", "message": "Happy birthday sis!" },
  { "name": "", "message": "Yay Deedee!" }
]
```

Duplicates between `messages.json` and the Sheet are shown once.
