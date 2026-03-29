# Self-Discovery Quiz — Full Design Document

**Total questions:** 39 + birthday input
**Estimated completion time:** 10–12 minutes
**Format:** Choose A or B (personality type), 1–5 scale (attachment & enneagram), rank preferences (connection style), date input (star sign)

---

## SECTION 1: Your Cognitive Type (16 Types)

**Purpose:** Identify the user's type across 4 dimensions based on Carl Jung's theory of psychological types.
**Scoring:** Each question maps to one of 4 dichotomies. Tally A vs B answers per dimension. Majority determines the letter.

### Dimension 1: Energy Source (E vs I)

**Q1.** You have a free Saturday with no plans. What sounds more appealing?
- A) Texting friends to see who's around — you'd love to do something social
- B) Keeping it open — you're excited to have time to yourself

*A = E, B = I*

**Q2.** After a long, draining week, what helps you recharge?
- A) Going out — being around people energises you even when you're tired
- B) Staying in — you need quiet time before you're ready to be "on" again

*A = E, B = I*

**Q3.** In group conversations, you tend to:
- A) Jump in naturally — you think best when you're talking things through
- B) Listen first and speak when you've had time to form your thoughts

*A = E, B = I*

---

### Dimension 2: Information Processing (S vs N)

**Q4.** When learning something new, you prefer:
- A) Practical, step-by-step instructions with concrete examples
- B) The big picture first — you'll figure out the details as you go

*A = S, B = N*

**Q5.** When someone tells you about their plans, you naturally focus on:
- A) The specifics — when, where, who, how much
- B) The vision — why they're doing it and what it could become

*A = S, B = N*

**Q6.** Which description fits you better?
- A) You trust what's tried and tested — experience is the best teacher
- B) You're drawn to new possibilities — "what if" is your favourite question

*A = S, B = N*

---

### Dimension 3: Decision Making (T vs F)

**Q7.** A friend asks for your honest opinion on a decision they've already made. You:
- A) Give them the truth, even if it's not what they want to hear — honesty helps most
- B) Consider how they're feeling first and frame your feedback gently

*A = T, B = F*

**Q8.** When making a tough decision, you rely more on:
- A) Logic and pros/cons — what makes the most objective sense
- B) Your gut feeling and values — what feels right for the people involved

*A = T, B = F*

**Q9.** In a disagreement, you're more likely to:
- A) Focus on finding the most logical or fair resolution
- B) Focus on how everyone is feeling and restoring harmony

*A = T, B = F*

---

### Dimension 4: Lifestyle Preference (J vs P)

**Q10.** Your approach to a weekend trip is:
- A) Plan an itinerary in advance — you like knowing what's happening
- B) Keep it loose — you'll figure it out when you get there

*A = J, B = P*

**Q11.** When you have a deadline:
- A) You work steadily toward it and aim to finish early
- B) You do your best work closer to the deadline — pressure helps you focus

*A = J, B = P*

**Q12.** Your workspace or living space tends to be:
- A) Organised with a system — everything has a place
- B) A bit chaotic but you know where everything is (mostly)

*A = J, B = P*

---

### Scoring Logic — 16 Types

Count A vs B for each dimension:

| Dimension | Majority A | Majority B |
|-----------|-----------|-----------|
| Energy (Q1–3) | **E** (Extravert) | **I** (Introvert) |
| Info (Q4–6) | **S** (Sensing) | **N** (Intuitive) |
| Decisions (Q7–9) | **T** (Thinking) | **F** (Feeling) |
| Lifestyle (Q10–12) | **J** (Judging) | **P** (Perceiving) |

Combine the four letters → one of 16 types (e.g., ENFP, ISTJ, etc.)

**Tie-breaker:** If a dimension is 1.5 vs 1.5, show the user both possibilities and let them pick which resonates more.

---

## SECTION 2: Attachment Style

**Purpose:** Identify the user's attachment pattern in close relationships.
**Based on:** Bowlby & Ainsworth attachment theory (public domain academic psychology).
**Scoring:** Two dimensions — Anxiety (fear of abandonment) and Avoidance (discomfort with closeness). Each question scores on a 1–5 scale (Strongly Disagree to Strongly Agree).

### Anxiety Dimension (fear of rejection / need for reassurance)

**Q13.** When someone I'm close to doesn't reply to my message for a while, I start wondering if something is wrong between us.
- 1 — Strongly Disagree
- 2 — Disagree
- 3 — Neutral
- 4 — Agree
- 5 — Strongly Agree

*Higher = more anxious*

**Q14.** I sometimes need reassurance from people I care about that they still value our relationship.
- 1–5 scale

*Higher = more anxious*

**Q15.** I worry more than most people about being abandoned or left out.
- 1–5 scale

*Higher = more anxious*

**Q16.** When there's conflict with someone close to me, I find it hard to stop thinking about it until it's resolved.
- 1–5 scale

*Higher = more anxious*

### Avoidance Dimension (discomfort with closeness / need for independence)

**Q17.** I find it uncomfortable when people want to be very emotionally close to me.
- 1–5 scale

*Higher = more avoidant*

**Q18.** I prefer to handle my problems on my own rather than leaning on others for support.
- 1–5 scale

*Higher = more avoidant*

**Q19.** When a relationship starts getting serious, I sometimes feel an urge to pull back.
- 1–5 scale

*Higher = more avoidant*

**Q20.** I find it difficult to fully trust and depend on other people.
- 1–5 scale

*Higher = more avoidant*

---

### Scoring Logic — Attachment Style

**Anxiety score** = average of Q13–Q16 (range: 1–5)
**Avoidance score** = average of Q17–Q20 (range: 1–5)

Use a midpoint of 3.0 to determine each dimension:

| Anxiety | Avoidance | Attachment Style |
|---------|-----------|-----------------|
| Low (≤3) | Low (≤3) | **Secure** — You're comfortable with closeness and confident in your relationships |
| High (>3) | Low (≤3) | **Anxious** — You crave closeness but worry about whether it's reciprocated |
| Low (≤3) | High (>3) | **Avoidant** — You value independence and can feel overwhelmed by too much closeness |
| High (>3) | High (>3) | **Fearful-Avoidant** — You want connection but find it hard to trust; you may push-pull in relationships |

**Nuance note:** For a better user experience, show the scores on a visual 2×2 grid rather than a hard label. Many people fall near the boundaries.

---

## SECTION 3: Connection Style (How You Give & Receive Love)

**Purpose:** Identify how the user most naturally expresses and receives care in relationships.
**Based on:** The widely-discussed concept of five styles of expressing love. All questions are 100% original.
**Format:** Forced-choice pairs. In each question, the user picks which scenario would mean MORE to them.

**Q21.** Which would mean more to you?
- A) A partner writes you a heartfelt note about what they love about you
- B) A partner clears your entire to-do list without being asked

*A = Words of Affirmation, B = Acts of Service*

**Q22.** Which would mean more to you?
- A) A friend gives you a gift that shows they really know you
- B) A friend drops everything to spend the whole day with you

*A = Gifts, B = Quality Time*

**Q23.** Which would mean more to you?
- A) Someone you love holds your hand or puts their arm around you in public
- B) Someone you love tells you specifically what they admire about you

*A = Physical Touch, B = Words of Affirmation*

**Q24.** Which would mean more to you?
- A) Your partner plans a special evening — just the two of you, phones away
- B) Your partner surprises you with something thoughtful they picked up because it reminded them of you

*A = Quality Time, B = Gifts*

**Q25.** Which would mean more to you?
- A) A partner cooks your favourite meal after a hard day
- B) A partner gives you a long, comforting hug after a hard day

*A = Acts of Service, B = Physical Touch*

**Q26.** Which would mean more to you?
- A) A friend sends you a message saying "I'm really grateful you're in my life"
- B) A friend drives across town to help you move house

*A = Words of Affirmation, B = Acts of Service*

**Q27.** Which would mean more to you?
- A) Someone surprises you with tickets to something you've been wanting to see
- B) Someone sits with you during a tough time, fully present, not distracted

*A = Gifts, B = Quality Time*

**Q28.** Which would mean more to you?
- A) A long, warm embrace when you haven't seen someone in a while
- B) A personalised birthday gift that took real thought

*A = Physical Touch, B = Gifts*

**Q29.** Which would mean more to you?
- A) Your partner takes over a chore you hate so you don't have to do it
- B) Your partner puts their phone down and gives you their full attention when you're talking

*A = Acts of Service, B = Quality Time*

**Q30.** Which would mean more to you?
- A) A friend gives you an unexpected, genuine compliment
- B) A friend greets you with a big hug every time they see you

*A = Words of Affirmation, B = Physical Touch*

---

### Scoring Logic — Connection Style

Each style appears in exactly 4 questions. Tally how many times each was selected:

| Style | Appears in Questions |
|-------|---------------------|
| Words of Affirmation | Q21A, Q23B, Q26A, Q30A |
| Acts of Service | Q21B, Q25A, Q26B, Q29A |
| Gifts | Q22A, Q24B, Q27A, Q28B |
| Quality Time | Q22B, Q24A, Q27B, Q29B |
| Physical Touch | Q23A, Q25B, Q28A, Q30B |

**Primary style** = highest count (max 4)
**Secondary style** = second highest

Display as a ranked list, e.g.: "Your top connection style is **Quality Time**, closely followed by **Physical Touch**."

**Tie-breaker:** If two styles are tied for first, show both as co-primary styles.

---

## SECTION 4: Core Motivation (Enneagram)

**Purpose:** Identify the user's core motivation, fear, and growth path using the Enneagram framework.
**Based on:** The Enneagram of Personality — a widely-taught psychological framework with roots in multiple traditions. The 9 types and their descriptions are not proprietary. All questions below are 100% original.
**Format:** 9 self-descriptions, each representing one Enneagram type. Users rate each statement 1–5 on how strongly it resonates. Highest score = core type. Second-highest adjacent type = wing.

**Instructions shown to user:** *"Read each statement and rate how much it sounds like you — not who you want to be, but who you naturally are."*

**Q31.** I hold myself to high standards and have a strong inner voice telling me what's right and wrong. I notice what needs fixing and feel responsible for improving things.
- 1 — Not me at all
- 2 — Slightly like me
- 3 — Somewhat like me
- 4 — A lot like me
- 5 — This is exactly me

*Maps to: Type 1 — The Perfectionist*

**Q32.** I naturally tune into what other people need and I feel good when I can help. Sometimes I give so much to others that I forget to take care of myself.
- 1–5 scale

*Maps to: Type 2 — The Giver*

**Q33.** I'm driven to achieve and succeed. I adapt easily to what's expected of me and I care a lot about how I'm perceived — I want to be seen as someone who has it together.
- 1–5 scale

*Maps to: Type 3 — The Achiever*

**Q34.** I feel things deeply and I'm drawn to what's meaningful and authentic. I sometimes feel like something is missing that other people seem to have, and I want to understand what makes me unique.
- 1–5 scale

*Maps to: Type 4 — The Individualist*

**Q35.** I need to understand how things work before I jump in. I value my privacy and my inner world, and I recharge by spending time alone with my thoughts and interests.
- 1–5 scale

*Maps to: Type 5 — The Investigator*

**Q36.** I tend to think through what could go wrong before it happens. Loyalty and trust are everything to me — once I'm in your corner, I'm there for life, but earning my trust takes time.
- 1–5 scale

*Maps to: Type 6 — The Loyalist*

**Q37.** I love new experiences and I like to keep my options open. I'm naturally optimistic and I'd rather focus on what's exciting and possible than dwell on what's difficult or painful.
- 1–5 scale

*Maps to: Type 7 — The Enthusiast*

**Q38.** I trust my gut and I'm not afraid to take charge. I value strength and directness — I'd rather have a hard truth than a comfortable lie, and I protect the people I care about fiercely.
- 1–5 scale

*Maps to: Type 8 — The Challenger*

**Q39.** I'm easygoing and I like to keep the peace. I can see everyone's point of view, which makes me a good mediator, but sometimes I go along with others to avoid conflict even when I shouldn't.
- 1–5 scale

*Maps to: Type 9 — The Peacemaker*

---

### Scoring Logic — Enneagram

**Step 1: Core Type**
The type with the highest score (Q31–Q39) is the user's core Enneagram type.

| Question | Type | Name |
|----------|------|------|
| Q31 | Type 1 | The Perfectionist |
| Q32 | Type 2 | The Giver |
| Q33 | Type 3 | The Achiever |
| Q34 | Type 4 | The Individualist |
| Q35 | Type 5 | The Investigator |
| Q36 | Type 6 | The Loyalist |
| Q37 | Type 7 | The Enthusiast |
| Q38 | Type 8 | The Challenger |
| Q39 | Type 9 | The Peacemaker |

**Step 2: Wing**
The wing is the higher-scoring of the two types adjacent to the core type. Types are arranged in a circle: 1-2-3-4-5-6-7-8-9-1.

Example: If core type is 4, compare scores for Type 3 and Type 5. If Type 3 scored higher → result is **4w3**. If Type 5 scored higher → result is **4w5**.

**Step 3: Display**
Show as "[Core]w[Wing]" — e.g., "4w3 — The Individualist (with Achiever wing)"

**Tie-breaker:** If two types tie for the highest score, show both and let the user read a short description of each to self-select. If wings tie, show the core type without a wing designation.

---

## SECTION 5: Star Sign Profile

**Purpose:** Fun, identity-affirming layer. No quiz needed — just a date input.

**Q40.** What's your birthday? *(date picker — month and day only)*

### Mapping Logic

| Dates | Sign |
|-------|------|
| Mar 21 – Apr 19 | Aries ♈ |
| Apr 20 – May 20 | Taurus ♉ |
| May 21 – Jun 20 | Gemini ♊ |
| Jun 21 – Jul 22 | Cancer ♋ |
| Jul 23 – Aug 22 | Leo ♌ |
| Aug 23 – Sep 22 | Virgo ♍ |
| Sep 23 – Oct 22 | Libra ♎ |
| Oct 23 – Nov 21 | Scorpio ♏ |
| Nov 22 – Dec 21 | Sagittarius ♐ |
| Dec 22 – Jan 19 | Capricorn ♑ |
| Jan 20 – Feb 18 | Aquarius ♒ |
| Feb 19 – Mar 20 | Pisces ♓ |

---

## Summary & UX Recommendations

### Quiz Flow

```
Welcome screen → Birthday input (Star Sign — instant result)
→ Section 1: Cognitive Type (12 questions, A/B choices)
→ Section 2: Attachment Style (8 questions, 1–5 scale)
→ Section 3: Connection Style (10 questions, forced-choice pairs)
→ Section 4: Core Motivation / Enneagram (9 questions, 1–5 scale)
→ Results: Full personality profile
```

### Why This Order Works

1. **Birthday first** — zero effort, instant gratification, builds momentum
2. **Cognitive Type next** — the most familiar framework, easy A/B format, builds engagement
3. **Attachment Style third** — slightly more vulnerable questions, but user is now invested
4. **Connection Style fourth** — fun, feels like a game, lifts the energy
5. **Enneagram last** — the deepest and most reflective section, placed at the end when the user is fully committed. Reading 9 self-descriptions feels like a satisfying "choose your character" moment to close the quiz

### Design Notes

- Show a progress bar ("Question 12 of 39")
- Allow users to go back and change answers
- Consider showing mini-results after each section to maintain engagement
- Keep language casual and non-clinical throughout
- Mobile-first design — large tap targets for A/B options

### Free vs Paid Split

**Free (shown immediately):**
- Your 4-letter cognitive type with a short summary (2–3 sentences)
- Your attachment style label with a brief description
- Your top connection style
- Your Enneagram type and wing (e.g., "4w3 — The Individualist")
- Your star sign with key traits

**Paid PDF (the upsell):**
- Deep dive into each cognitive function and how your type thinks, works, and loves
- Attachment style: detailed patterns, triggers, and growth strategies
- Connection style: full ranked breakdown with tips for communicating your needs
- Enneagram deep dive: core fear, core desire, growth path, stress/security arrows, and how your wing flavours your type
- Star sign compatibility with your other results ("As an ENFP 4w3 with anxious attachment, here's how your Scorpio energy shows up...")
- Cross-framework insights: how your five profiles interact and what that means for relationships, work, and personal growth

---

## IP Compliance Notes

- All 39 questions above are **100% original** — written from scratch
- No questions are adapted from or based on any copyrighted assessment instrument
- The underlying psychological theories (Jung's types, Bowlby's attachment, five connection styles, the Enneagram, astrology) are **public domain**
- The Enneagram is not trademarked — it is a widely-taught framework used across psychology, spirituality, and business with no single IP owner
- Recommended disclaimers for the website:
  - *"This assessment is not affiliated with The Myers-Briggs Company or the MBTI® instrument."*
  - *"The connection style framework referenced here is based on widely-discussed concepts in relationship psychology."*
  - *"This quiz is for entertainment and self-reflection purposes. It is not a clinical assessment."*
