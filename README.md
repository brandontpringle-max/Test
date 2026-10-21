# Beginner Strength + 5K

A beginner training programme with a tracker that runs on your phone.
It's built for someone who hasn't trained before and wants to build strength
and work up to running 5K.

## The programme

**Weights, Monday to Friday (push / pull / legs / push / pull). Weekends are rest days.**

| Day | Focus             | Main lift      | Accessories |
|-----|-------------------|----------------|-------------|
| Mon | Push (chest)      | Bench press    | Incline DB press, chest fly, lateral raise, triceps pushdown |
| Tue | Pull (back)       | Lat pulldown   | Cable row, face pull, biceps curl, reverse hyperextension |
| Wed | Legs              | Squat          | Bulgarian split squat, hamstring curl, quad extension, calf raise |
| Thu | Push (shoulders)  | Overhead press | Incline DB press, lateral raise, rear delt fly, overhead triceps |
| Fri | Pull (lower back) | Deadlift       | Reverse hyperextension, DB row, lat pulldown, hammer curl |

Every day ends with **Superman holds** (3 × 30–60 s) to strengthen the lower back.

- Stretch and warm up, then do the main lift first.
- Start with really light weights: 3 sets of 5–10 reps. Good form comes first.
- **Main lifts (bench, squat, overhead press, deadlift)** run in 4-week blocks.
  The app estimates your 1-rep max from your best set (3 reps at 60 kg ≈ 66 kg)
  and sets a target about 5 kg higher for each new block.

**Cardio: Couch to 5K (9 weeks, 3 runs a week), done after the weights.**
Week 1 is a 5-minute warm-up walk, 60 s run / 90 s walk × 8, then a 5-minute
cool-down. It builds up to a 30-minute run by week 9.

To change exercises, sets or the running plan, edit `program.js`.

## The app

- **Today:** today's workout. Log weight × reps for each set, and see what you lifted last time.
- **Lifts:** starting, best and target estimated max for the 4 main lifts.
- **Run:** the next Couch to 5K session, with a full-screen run/walk timer.
  It talks and vibrates at each change and keeps the screen on.
- **Plan:** the full week, the rules, CSV export (opens in Excel / Google Sheets), and backup/restore.

Data is stored on the phone itself. Use **Backup** now and then, and **Restore**
to move to a new phone.

## Putting it on your phone

The app has to be served over HTTPS. GitHub Pages does this for free:

1. In the GitHub repo, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick the
   branch and the `/ (root)` folder, then **Save**.
3. After a minute or so the site is live at `https://<username>.github.io/<repo>/`.
4. Open that link on the phone, then:
   - **iPhone (Safari):** Share → **Add to Home Screen**
   - **Android (Chrome):** ⋮ menu → **Add to Home screen** / **Install app**

It then opens full-screen from its own icon and works with no signal.

## Running it on a computer

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

> Not medical advice. With a history of back injury, start light, and see a GP
> or physio if pain keeps coming back.
