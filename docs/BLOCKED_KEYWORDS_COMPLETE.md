# Complete Blocked Keywords List

## ❌ 150+ Keywords That Trigger Content Filter

### 👙 Adult Content (50+ keywords)
sex, sexy, xxx, porn, pornography, adult, 18+, 21+, nude, naked, nudity, boobs, breast, ass, butt, buttocks, penis, dick, pussy, vagina, orgasm, masturbat, penetrat, intercourse, sexual, erotic, hot girl, hot women, girl hot, beautiful girls, hot chick, strip, striptease, bikini, swimsuit model, swimwear girl, lingerie, underwear model, thong, cam, camgirl, webcam, onlyfans, patreon exclusive, leaked, private video

### 💣 Violence & Weapons (40+ keywords)
bomb, bombing, explosive, bomb threat, explode, shooting, gun violence, massacre, terrorist, terrorism, kill, murder, suicide, hang, drown, self harm, self-harm, cutting, cut yourself, torture, brutal, gore, graphic violence, blood bath, violence, dead body, corpse, execution, knife attack, stab, behead, decapitate, hanging, lethal

### 💊 Drugs & Substances (35+ keywords)
cocaine, heroin, meth, methamphetamine, crystal meth, drug dealing, drug abuse, weed, smoking, marijuana, ecstasy, mdma, lsd, acid, psychedelic, hallucinogen, crack, substance abuse, overdose, junkie, dealer, high, getting high, stoned, wasted, drunk, alcohol abuse, trip, trippy, mushroom, shroom, bath salts, spice

### 🤬 Profanity & Hate Speech (30+ keywords)
fuck, shit, bitch, asshole, bastard, crap, damn, hell, piss, nigga, nigger, faggot, fag, retard, slut, whore, dickhead, motherfucker, racism, racist, hate speech, homophobic, transphobic, sexist, discrimination, prejudice, slurs, racial, ethnic slur, kike, spic, chink, gook

### 😢 Self-Harm & Mental Health (15+ keywords)
suicide, suicide tutorial, how to kill, cutting tutorial, eating disorder, anorexia, bulimia, self injur, depression tips, ways to die, method, trigger warning, mental breakdown, psychotic, schizophrenic

### 👧 Exploitation & Abuse (25+ keywords)
child abuse, child exploitation, child trafficking, human trafficking, trafficking, exploitation, grooming, groom, pedophile, pedo, child sexual, child porn, cp, nsfw kids, unsafe for kids, inappropriate children, lolita, underage, minor, teen sex, teen porn, preteen, jailbait

### 🎬 Other Inappropriate (20+ keywords)
twerk, twerking, adult film, adult video, adult movie, cam girl, stripper, lap dance, pole dance, fetish, bdsm, bondage, kink, incest, bestiality, necrophilia, zoophilia, rape, assault, roofie, date rape

### 🚨 Clickbait Red Flags (10+ keywords)
exposed, caught, fake, hidden camera, spying, surveillance, doxing, swatting, hacking, phishing, scam, fraud, theft

### 🏥 Medical/Inappropriate (10+ keywords)
erectile dysfunction, viagra, cialis, erectile, menstrual, period, pregnancy test, abortion, miscarriage, std, std test, hiv

### 🔢 Age-Related Suspicious (10+ keywords)
18 years old, age of consent, legal teen, barely legal, barely 18, step sister, step mom, dad, incestuous, family sex

---

## 🔍 Regex Patterns (Additional Layer)

These regex patterns catch variations:

1. `/\b(xxx|porn|adult|18\+|21\+)\b/gi` - Adult content
2. `/\b(sex|sexy|sexual|erotic)\b/gi` - Sexual content
3. `/\b(nude|naked|nudity|exposure)\b/gi` - Nudity
4. `/\b(bomb|explosive|shooting|kill|murder|suicide|harm)\b/gi` - Violence
5. `/\b(drug|cocaine|heroin|meth|weed|marijuana|lsd)\b/gi` - Drugs
6. `/\b(fuck|shit|bitch|asshole|damn|hell)\b/gi` - Profanity
7. `/girl.*hot|hot.*girl|beautiful.*girl|girl.*sexy/gi` - Inappropriate girls
8. `/teen.*18|barely.*18|year.*old.*girl/gi` - Age-inappropriate
9. `/strip|twerk|bikini|swimsuit.*model/gi` - Revealing content
10. `/click.*bait|fake.*video|prank.*fail/gi` - Clickbait
11. `/\b(cam|onlyfans|patreon)\b/gi` - Adult platforms

---

## ✅ Whitelisted Channels (Auto-Approved)

These channels skip the filter - all their videos are approved:

- Kids TV
- Cocomelon
- Kids Diana Show
- Little Baby Bum
- Bluey
- Super Simple Songs
- Mother Goose Club
- Pinkfong / Baby Shark
- T-Series Kids Hut
- Jojo Siwa
- Kids TV Express
- Kids Party TV
- Nursery Rhymes TV
- Cartoon Cat
- Kidz Bop
- Sesame Street
- Disney Junior
- Nickelodeon
- Cartoon Network
- PBS Kids
- CBeebies
- Kids Channel
- Children's Songs
- Educational Songs for Children
- Kids Learning
- Baby Learning
- Toddler Songs
- Preschool Songs
- Kids Education
- Ryan's World
- Vlad and Niki
- Kids Fun TV
- YouTube Kids (official)
- Kidoodle

---

## 🛡️ How to Add More Keywords

To add more blocked keywords, edit `app-no-firebase.js` and add to the `blockedKeywords` array:

```javascript
const blockedKeywords = [
    // Your existing keywords...
    "your new keyword here",  // Add this line
    // ... more keywords
];
```

**Guidelines:**
- Use lowercase
- Match partial words when needed (e.g., "masturbat" catches "masturbate", "masturbating")
- Organize by category for clarity
- Add comments explaining the category

---

## 📊 Statistics

**Total Keywords:** 150+  
**Regex Patterns:** 11  
**Whitelisted Channels:** 33+  
**Additional Checks:** 5 (age, title length, caps/punctuation, etc.)

**Defense Layers:** 5-layer comprehensive filtering system

---

## 🔔 How Filter Triggers

Example: User searches for videos

1. YouTube API returns 30 results
2. App checks each video:
   - Channel whitelisted? → APPROVE ✅
   - Contains blocked keyword? → BLOCK 🚫
   - Matches regex pattern? → BLOCK 🚫
   - Mentions age > 12? → BLOCK 🚫
   - Title > 150 chars? → BLOCK 🚫
   - Excessive caps/punctuation? → BLOCK 🚫
3. Safe videos displayed, inappropriate ones hidden
4. Console shows: "✅ Added 28 | 🚫 Blocked 2"

---

**Last Updated:** Enhanced Content Filter Implementation  
**Status:** ✅ ACTIVE AND PROTECTING
