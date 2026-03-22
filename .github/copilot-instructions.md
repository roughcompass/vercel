# GitHub Copilot Instructions: Agent Governance Project

## Standards

All writing, documentation, and code in this project follows shared standards. Apply these before generating any output.

**Writing style:** `/Users/martinmarzejon/dev/standards/writing-style-guide.md`
- No em dashes
- No emojis
- Active voice
- Present tense for current facts, past for completed events
- Every acronym defined before first use; no acronym introduced for a term used only once
- Short sentences, one idea per sentence
- No filler phrases (see guide for full list)

**Attribution and accuracy:** `/Users/martinmarzejon/dev/standards/attribution-and-accuracy.md`
- Do not state facts without attribution
- Do not fabricate citations, case names, or regulatory provisions
- When uncertain, say so explicitly
- Superlative claims ("first," "only," "largest") require a source

## Project Context

This is a portfolio project building a working prototype of an AI agent governance layer. The stack is Next.js App Router, Vercel AI SDK, Vercel Postgres, Vercel Edge Config, Vercel Edge Middleware, and Vercel Blob.

## Code Standards

- Prefer simple, readable solutions over abstractions
- Do not add error handling, helpers, or utilities that are not required by the current task
- Do not add comments unless the logic is non-obvious
- TypeScript throughout
- Follow Next.js App Router conventions

## Docs Folder

`docs/` contains product artifacts only: business case, requirements, and specifications. Do not add technical documentation or AI standards to this folder.
