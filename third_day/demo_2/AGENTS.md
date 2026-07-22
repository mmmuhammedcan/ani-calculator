# AGENTS.md

This document defines the rules and guidelines that must be followed while developing this project.

## Methodology: Spec-Driven Development

Development strictly follows this order, and this order must never be violated:

1. Raw request
2. Mini-spec
3. Acceptance criteria
4. Tests
5. Code

No implementation code or spec may be written until explicitly requested by the user, step by step, in the above order.

## Rules & Guidelines

1. **Tech Stack:** Python 3.11, FastAPI, pytest.
2. **Persistence / Database:** Out of scope. In-memory only, no persistent layer.
3. **Language Convention:** Code comments, docstrings, and test names must be written in English. Spec and feature files must be written in Turkish.
4. **Strict Enforcement:** Never generate implementation code or skip/jump steps until explicitly requested by the user.

## Business Decisions

No business decision that is not explicitly stated in the spec may be made independently.
