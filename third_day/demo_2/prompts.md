We will build a simple REST API together. It will have a single service: calculating the fee to be paid based on the duration of a scooter ride via `POST /scooter-fee`.

We will strictly follow the "Spec-Driven Development" methodology during development. The sequence will be as follows, and we must not violate this order:
raw request -> mini-spec -> acceptance criteria -> tests -> code

Before I explicitly ask you to write code, we will write the spec together. You must NOT make any business decisions that are not explicitly stated in the spec.

Rules & Guidelines:
1. Tech Stack: Python 3.11, FastAPI, pytest.
2. Persistence / Database: Out of scope (in-memory only, no persistent layer).
3. Language Convention: Code comments, docstrings, and test names must be in English. Spec and feature files must be in Turkish.
4. Strict Enforcement: Never generate implementation code or jump steps until requested.

First step: Create an `AGENTS.md` file and write down all the rules and guidelines stated above. Do NOT write any application code or spec yet. Just confirm once `AGENTS.md` is created.


// Second Prompt:
Role: Act like a software analyst. In this step, your task is NOT TO WRITE CODE.
Do not write code, do not write tests, do not create application files.

RAW REQUEST
....

RULES — do not violate:
1. Do NOT ASSUME any business decisions you do not know. Instead of guessing, write them under the "Open Decisions" section as Q-01, Q-02... and specify who needs to answer each question.
2. Do NOT write a business rule (BR) for an undecided topic. An undecided decision cannot have an acceptance criterion.
3. Separate business rules from technical constraints into DIFFERENT sections:
   - Price, duration, threshold, cap, exemption -> Business Rule
   - Decimal, rounding, language, framework -> Technical Constraint
4. If there are open questions affecting the application, the document status CANNOT be "Ready for implementation".
5. Prompt Logging Rule: Save all of my prompts into a `prompts.md` file at each step as we progress.

OUTPUT SECTIONS — in this exact order, in TURKISH:
1. Spec Card (status: Draft | Pending decision | Ready for implementation)
2. Purpose and Success Signal
3. Scope / Out of Scope
4. Input, Output, and Error Contract
5. Business Rules (decided ones; if none, leave blank and state why)
6. Acceptance Criteria (if unable to write, state why)
7. Technical Constraints
8. Open Decisions (Q-01, ... + who to ask)
9. Readiness Check

Create the spec file at docs/spec/mini-spec.md.
// Third Prompt:
Q-01: dakika bazlı, dakika başına 5 tl,

// Fourth Prompt:
Q-02: açılış ücreti 10 tl olucak. Q-03: ücretsiz başlangı. süresi yok. Q-04: üst limit 1000 tl olsun. Q-05 duration_minutes okeydir. Q-06: ban ahngi alan adıyla olabilir örnek ver ona göre devam et onun dışında tl bazlıfiyatlama olucak maksimum iki basamaklı ondalık küsürat olsun. Q-07: hata kodu versin 400 kodu olarak. Q-08: süre yukarı yuvarla.

// Fifth Prompt:
ATDD formatında ilerliycez ATDD gherkin formatı olucak, bunu uygula dah asonra Acceptace Criteria içindeki her bir senaryo için pytest yaz. testleri çalıştır fail olduğunu gör sonra implementasyon yap testleri tekrar çalıştır hespsi geçtiğinden mein ol. ve bu promptu da promts.md dosyasına kaydet

// Sixth Prompt:
acceptance criteria yazdıktan sonra mini-spec.md dosyasını güncellemeyi onutma  business rules ve acceptance criteria kısımları eksik

// Seventh Prompt:
eksik bir şey kaldı mı testini yap sonra commit at
