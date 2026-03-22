# Product Brief: Agent Governance

**Status:** Draft
**Author:** Martin Marzejon
**Date:** March 2026

---

## The Thesis

Every major software delivery model eventually produces a governance crisis. The solution always gets absorbed into the infrastructure layer, not bolted on top of it.

Software as a Service (SaaS) proliferation created shadow IT. The answer was single sign-on and cross-domain identity management baked into identity providers. Mobile devices in the enterprise created an unmanaged endpoint problem. The answer was mobile device management built into the OS and the deployment pipeline. Now autonomous agents are proliferating across organizations faster than IT can track them. History suggests the solution will not come from a standalone governance vendor. It will come from whoever owns the infrastructure agents run on.

The infrastructure owner that moves first defines the category.

---

## What Is Happening

Enterprises are not running one or two AI agents in a controlled pilot. They are running dozens, some sanctioned, many not. Developers are spinning up agents using frameworks like LangChain, AutoGen, and AI SDK and deploying them to production the same way they deploy any other application: fast, with minimal process.

The result is a class of software that:

- Acts autonomously on behalf of users, sending emails, querying databases, filing tickets, and making API calls
- Has access to credentials and APIs that security teams never reviewed
- Produces no audit trail that a compliance team can read
- Has no standardized kill switch when something goes wrong

The Air Canada case illustrates the risk. In Moffatt v. Air Canada (2024 BCCRT 149), the British Columbia Civil Resolution Tribunal found Air Canada liable after its chatbot provided inaccurate bereavement fare information and the company was held to the policy the chatbot described. That was a single-purpose, single-step agent. The risk compounds as agents become multi-step, multi-tool, and multi-model.

What is missing is not better agents. It is the operational layer that makes agents safe to run at scale.

---

## Why Existing Solutions Fall Short

The reflex is to build an observability layer that wraps existing agents: intercept calls, log outputs, surface a dashboard. Several startups are doing exactly this, including Helicone, LangSmith, and Arize. A wrapper can only see what an agent says, not what it does.

An agent that sends an email through an approved API, using an approved credential, is invisible to an observability tool. Governance requires deployment-time context:

- What environment variables does this agent have access to?
- What changed between the last deployed version and this one?
- Who approved this deployment?
- What did this specific invocation do, in sequence, with what inputs?

This information lives in the deployment pipeline. It cannot be reconstructed after the fact from logs. Observability tools and security platforms solve adjacent problems. Neither owns the deployment. Neither has the complete picture.

The other candidate is enterprise identity and access management (IAM) platforms, which govern human identity. An agent is not a human. It does not log in, hold a session, or have a role in an org chart. IAM was not designed for a principal that acts autonomously, at scale, across multiple systems simultaneously.

The gap between observability and identity is the governance layer. It is currently unowned.

---

## The Compliance Forcing Function

Governance tooling rarely gets bought on vision. It gets bought when someone has a deadline.

The European Union Artificial Intelligence Act (EU AI Act), effective August 2026, requires organizations to maintain documentation of high-risk AI systems, including audit trails of automated decisions. The Securities and Exchange Commission (SEC) guidance on AI in financial services, finalized in late 2025, requires firms to demonstrate supervisory controls over AI-assisted processes. The Federal Risk and Authorization Management Program (FedRAMP) is beginning to define authorization requirements for AI agents operating in government contexts.

These regulations give enterprises a hard deadline. Organizations running agents in production today need a compliance answer before August 2026. They will buy the first credible solution that integrates with their existing deployment workflow.

---

## The Problem in Three Questions

Organizations cannot answer three basic questions about the agents they run:

1. **What agents exist?** There is no registry. Agents are deployed like any other code, with no inventory and no ownership record.
2. **What are they allowed to do?** There is no policy layer. An agent's permissions are whatever credentials it was given at deploy time, with no central oversight.
3. **What did they do?** There is no tamper-evident audit trail. Logs exist but can be modified or deleted. They do not meet compliance standards for auditability.

Until these three questions have reliable answers, AI agents cannot be trusted in enterprise production. The solution is not more capable agents. It is infrastructure that makes existing agents governable.

---

## What This Product Is, and What It Is Not

**It is:**
- A registry of agents: what exists, who owns it, when it was deployed, and what changed
- A policy engine that defines what tools, APIs, and data each agent can access, enforced at the infrastructure level rather than by the agent itself
- An immutable audit trail: append-only, tamper-evident, and cryptographically verifiable, meeting the standard for compliance rather than just operational logging
- A control plane: kill switches, rate limits, and approval workflows for high-risk actions

**It is not:**
- An observability or application performance monitoring product
- An identity or access management platform
- A general-purpose security information and event management tool
- A replacement for the agent frameworks developers already use

---

## Why Immutability Is a Product Decision

A log that can be deleted is not an audit trail.

The compliance requirements driving adoption, including the EU AI Act, SEC supervisory controls, and FedRAMP, all require evidence that cannot be altered after the fact. Building append-only, hash-chained, cryptographically verifiable records is harder than building standard logging. It is also the difference between a product that satisfies a compliance requirement and one that does not.

Immutability is not a feature. It is what makes the audit trail credible to the people who will scrutinize it: compliance teams, auditors, regulators, and legal counsel. It must be a design principle from day one, not a retrofit.

---

## Risks

**Slow enterprise adoption.** Governance products often stall in security review before reaching the teams that need them. Early engagement with security and compliance stakeholders, not just developers, is required.

**Scope creep.** The temptation will be to add features that overlap with established security vendors. The defensible position is narrow: governance of agents at the deployment layer. Expanding into general-purpose security means competing with vendors that have years of head start.

**Retention liability.** The audit trail must be append-only and tamper-evident during its retention window, not permanently immutable. A log that cannot be deleted prevents compliance with data retention schedules and makes every entry permanently discoverable in litigation. The architecture must support legally defensible deletion, such as scheduled purge after a configurable retention period. Data retention policies require legal review before general availability.

**Developer circumvention.** Governance only works if developers do not route around it. If the product creates friction without delivering value to developers directly, they will avoid it. Developer experience must be a first-class concern alongside compliance requirements.

---

## What Must Be True for This to Succeed

1. The registry must be authoritative. Developers cannot opt out without that choice being visible.
2. Policy enforcement must happen at the infrastructure level, not by trusting the agent to enforce its own constraints.
3. The audit trail must meet the legal standard of evidence, not just the operational standard of logging.
4. The control plane must be accessible to non-technical stakeholders, including compliance, legal, and security teams, without routing through engineering.

These are not engineering requirements. They are product scope decisions that determine whether the outcome is a tool developers use or infrastructure an enterprise can rely on.
