# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ansunchiang/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ansunchiang/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Vice Ledger** is an independent offline guide and tracker for all 55 base-game PS5 trophies in Grand Theft Auto VI. It pairs each trophy with sourced unlock guidance and takes you from the Chapter 1 meditation window through story, in-game 100% completion and platinum cleanup.

Filter by kind or grade, search the list, and hide unearned story details. Progress stays in your browser. Export a JSON backup to move it to another browser or device. Import combines earned trophies with your current checklist and applies the spoiler setting from the backup.

## Run it

```sh
node serve.ts
```

Use Node 22.18 or later and open `http://localhost:8080`. You can also open `app/index.html` directly in desktop Chrome. Both routes load their assets locally. Source links open only when you follow them.

Package the entry with `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`. The output contains the static app, four Chrome renders, and the make.fun dossier.

## Sources

Checked 2026-11-19. The kit’s PS5 names and descriptions match Exophase and the indexed TrueTrophies list. All 55 name, description and grade combinations also match Platinum Pursuit’s PSN listing. The kit reports agreement with PSNProfiles, whose list returned a direct-access error during this build. PlayStation Support confirms the PS5 release date.

- [make.fun bounty and starter trophy list](https://make.fun/bounty/gta6-trophy-guide-01)
- [PlayStation Support — Grand Theft Auto VI](https://www.playstation.com/en-us/support/games/gta-vi-support/)
- [Exophase — Grand Theft Auto VI PS5 trophies](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
- [TrueTrophies — Grand Theft Auto VI trophies](https://www.truetrophies.com/game/Grand-Theft-Auto-VI/trophies)
- [Platinum Pursuit — Grand Theft Auto VI PSN trophy set](https://platpursuit.com/games/NPWR21085_00/)
- [PSNProfiles — Grand Theft Auto VI trophies](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
- [PowerPyx — Trophy guide and roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)
- [PowerPyx — Main mission walkthrough](https://www.powerpyx.com/gta-6-full-walkthrough-all-missions/)
- [PowerPyx — In-game 100% checklist](https://www.powerpyx.com/gta-6-100-completion-checklist-guide/)
- [PowerPyx — Meditation spots](https://www.powerpyx.com/gta-6-all-meditation-spot-locations/)
- [Beebom — Meditation locations](https://beebom.com/gta-6-meditation-spots-locations/)
- [PowerPyx — Shooting range gold medals](https://www.powerpyx.com/gta-6-all-shooting-range-gold-medal-challenges/)
- [PowerPyx — Top Fun drone trials](https://www.powerpyx.com/gta-6-all-top-fun-drone-race-time-trial-locations/)
- [PowerPyx — Unique races](https://www.powerpyx.com/gta-6-all-unique-race-locations-racing-activities/)
- [PowerPyx — Arcade games](https://www.powerpyx.com/gta-6-all-video-game-locations/)
- [PowerPyx — Strangers & Freaks](https://www.powerpyx.com/gta-6-all-strangers-freaks-side-missions/)
- [PowerPyx — Bumper to Bumper and Yago’s next race](https://www.powerpyx.com/gta-6-bumper-to-bumper-mentor-yago-walkthrough/)
- [PowerPyx — Card sets](https://www.powerpyx.com/gta-6-all-collectible-card-sets-locations/)
- [PowerPyx — WAiNK scan locations](https://www.powerpyx.com/gta-6-all-waink-scan-locations/)
- [PowerPyx — Challenges](https://www.powerpyx.com/gta-6-all-challenges-guide/)
- [PowerPyx — Map exploration](https://www.powerpyx.com/gta-6-how-to-unfog-the-map-fast-best-plane/)
- [PowerPyx — Garages](https://www.powerpyx.com/gta-6-all-garage-locations/)
- [GTABase — Trophy guide](https://www.gtabase.com/gta-6/achievements)
- [TrophiesHunter — Ten Pin community report](https://trophieshunter.com/games/grand-theft-auto-vi-ps5/achievements/ten-pin)

---

<sub>Entered on [make.fun](https://make.fun/?ref=vxfctj3d&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
