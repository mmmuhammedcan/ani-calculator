# AGENTS.md

Guidelines for developing this project. All agents and contributors must follow these rules.

## Project Overview

A simple REST API. For now it exposes a single service that works like a basic
calculator, performing arithmetic calculations.

## Development Methodology

- We use **ATDD (Acceptance Test Driven Development)**.
- Before implementing any feature, we first write acceptance criteria together in
  **Gherkin** format.
- Feature work flows from Gherkin scenarios → acceptance tests → implementation.

## Language

- **Everything must be written in English**: documentation, code, comments,
  commit messages, Gherkin features, etc.

## Tech Stack

- The project is developed with **TypeScript**.

## Project Conventions

- Gherkin `.feature` files live under a dedicated folder in `docs/`.
- Keep the scope minimal: a single calculator service for now.
