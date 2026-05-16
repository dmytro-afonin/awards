# Awards platform

Product language for an awards and voting platform: workspaces own campaigns; members, permissions, and activity are interpreted inside a workspace.

## Language

**User**:
A person who signs in. Each user is provisioned with exactly one default workspace at account creation.
*Avoid*: Account (ambiguous with billing or Clerk).

**Workspace**:
The tenancy boundary for organizing members and campaigns. Every campaign belongs to exactly one workspace.

**Default workspace**:
The workspace created automatically for a user when their user record is created; that user is its **owner**. It cannot be transferred to another user. It may be renamed; the product UI always labels it as default alongside the chosen name (e.g. name plus “(default)”).

**Campaign**:  
A voting container (metadata, lifecycle, visibility) that exists only in the scope of a single workspace. It has a **lifecycle** with states such as **draft**, **ready**, **started**, and **finished** (the **exact lifecycle graph** is product-defined). **Lifecycle** transitions triggered **manually** and **by schedule** use the **same** **validation** and rules through one **shared** path so **automation** and **human** actions cannot diverge. It bounds the outer **voting** period that **categories** may use or narrow.

**Category**:
A subdivision of a **campaign** that groups **nominees**. It defines **voting** **schedule** **inheritance** and optional **start** and **end** **overrides** (**only** **inside** the **campaign**’s permitted voting period — **overrides** may not extend **outside** the **campaign** window). Ballot shape and mutability are defined by **category voting configuration**.

**Category voting configuration**:
Per-**category** ballot policy: whether each **user** may keep **singular** or **multiple** active selections at once, and whether selections are **revocable** (may be **replaced** or withdrawn while the **category** **vote** remains open, per product rules) or **non-revocable** (no changes after submit). **Default**: **singular** active selection with **replacement** allowed (**revocable**).

**Admin area**:
The product surfaces for administering **workspaces** and **campaigns** (the “admin” experience reflected in **admin** mockups and screenshots), also referred to as **Admin UI**. It is visible **only** to **users** who hold the **Admin** or **Owner** **workspace role** in that **workspace** — not to **users** who have **only** the **Member** **workspace role**. **Vote** submission does not occur here — see **Public campaign page**.

**Admin UI**:
The same surfaces as the **admin area**; operator-facing **workspace** and **campaign** administration. **Member** **workspace role** alone does not grant access; **Admin** or **Owner** **workspace role** does.

**Member UI**:
A dedicated product experience, **separate** from the **admin area** — not a mode of **admin** and not built as a subset of current **admin** UI designs. It is visible **only** to **users** who have the **Member** **workspace role** assigned in that **workspace** (among any other roles they may hold). It includes member-centric areas such as **my votes** and **my campaigns**. It complements the **public campaign page** (deep **view** and **vote** on one **campaign**) rather than replacing it.

**My votes**:
Within the **Member UI**, the signed-in **user**’s voting history and status across **campaigns** they are entitled to interact with.

**My campaigns**:
Within the **Member UI**, a directory of **campaigns** the **user** may open for **view** and **vote** under entitlement rules — participation context, not **admin** **campaign** configuration.

**Public campaign page**:
The voter-facing **campaign** URL and UI for **view** and **vote** (not part of the **admin area** or the **Member UI**). In product language it is called “public” even when the underlying **campaign visibility** is **private**; entitlement still applies. **Users** with the **Member** **workspace role** use this surface for per-**campaign** **view** and **vote** alongside the **Member UI** for cross-**campaign** navigation. **Owner** and **Admin** submit **votes** **only** through this page (the single **voting** path) even when they do not use the **Member UI**; the **admin area** is not an alternate **vote** surface.

**Multi-role assignment**:
In a given **workspace**, a **user** may hold **more than one** **workspace role** at the same time when the product assigns it (for example **Member** together with **Admin**). **Owner** and **Member** are **mutually exclusive** in the same **workspace** (**Owner–Member exclusivity**). **Owner** and **Admin** are **not** both persisted for the same **user** in the same **workspace** — see **Owner–Admin normalization**. Which shells appear follows visibility rules: **Member UI** requires the **Member** **workspace role**; **Admin UI** requires **Admin** or **Owner**.

**Owner–Member exclusivity**:
A **user** may not simultaneously hold the **Owner** and **Member** **workspace roles** in one **workspace**. The **workspace owner** **user** therefore never receives **Member UI** from **Owner** alone; **voting** as **Owner** uses **only** the **public campaign page** for ballot actions.

**Owner–Admin normalization**:
For a given **workspace**, the **workspace owner** **user** is stored with the **Owner** **workspace role** **only**; a concurrent **Admin** **workspace role** for that **user** is **not** persisted — the product **normalizes** to **Owner** **only** (**Owner** has **all rights**, including **Admin**-level capabilities).

**Campaign visibility**:
Whether a **campaign** is **public** or **private**. **Public** **campaigns** follow **public campaign** rules; **private** **campaigns** follow **private campaign** rules.

**Public campaign**:
A **campaign** whose **campaign visibility** is **public**. **Anonymous visitors** may **view** content the product exposes; **voting** requires a signed-in **User**.

**Private campaign**:
A **campaign** whose **campaign visibility** is **private**. **View** and **vote** are available only to **users** who satisfy the entitlement rules (e.g. **workspace** membership and **granular** **can_view** / **can_vote** as defined by the product). For **anonymous visitors** and for signed-in **users** who lack entitlement, the product responds as **not found** (indistinguishable whether the **campaign** exists).

**Anonymous visitor**:
Someone who is not signed in. May **view** **public campaign** surfaces the product allows; may not **vote**.

**Workspace owner**:
The user who holds ownership of a workspace. For the **default workspace**, ownership is fixed to the provisioning user. For an **additional workspace**, the **owner** may initiate **workspace ownership transfer** to another user (per product rules for acceptance, membership, and the **prior** **owner** **chooser**).

**Additional workspace**:
A workspace that is not a given user’s **default workspace**. A user may **create** additional workspaces and may be a **member** of other workspaces (default or additional) through invitation or creation. Its **owner** may **delete** it; that action is a **soft-delete** (see **Workspace deletion**).

**Workspace ownership transfer**:
Reassigning **workspace ownership** of an **additional workspace** from the current **workspace owner** to another **user**. The **transfer** UI includes a **chooser** for what happens to the **prior** **workspace owner** in that **workspace** (for example remaining as **Admin**, becoming **Member**, or **leaving** the **workspace** — **exact options** are product-defined), instead of a fixed silent default. The **recipient** must **accept** the **transfer** before it completes (they may instead **decline**); until then the **transfer** is **pending** and the **current** **workspace owner** remains in force. While **pending**, the **current** **workspace owner** may **cancel** the **transfer** at any time. A **pending** **transfer** **expires** automatically if not **accepted** within **fourteen days** of initiation. For **accept**, **decline**, **cancel**, and **expiry**, both **in-app** notification and **email** go to the **initiating** **workspace owner** and the **recipient** (subject to **user** notification preferences). On **completion**, the **chooser** outcome is applied for the **prior** **workspace owner**, and the **accepting** **user** becomes **workspace owner** persisted as **Owner** **only** (**Owner–Admin normalization**). All outcomes respect **Owner–Member exclusivity**.

**Workspace deletion**:
For an **additional workspace**, **deletion** by the **owner** is a **soft-delete**: the **workspace** and its **campaigns** (and related participation within that **workspace**) leave **active** use but are **not** immediately destroyed. **Restore** is allowed **only** for the **owner-at-delete**, and only while the **workspace** is within **retention** after deletion.

**Owner-at-delete**:
The **user** who was **workspace owner** when an **additional workspace** was **soft-deleted**; the only **user** who may **restore** that **workspace** while it remains within **retention**.

**Retention (soft-deleted workspace)**:
The period following **soft-delete** during which an **additional workspace** may still be **restored** by the **owner-at-delete**. **Retention** lasts **one year** from the moment of deletion; after that, the **workspace** is **no longer restorable** (final disposal timing is a product operations detail).

**Leaving a workspace**:
Ending a **user**’s **membership** in a **workspace** without deleting the **workspace**. A **user** in the **workspace** who is not the **workspace owner** may **leave** at will. An **owner** of an **additional workspace** must complete **workspace ownership transfer** or **delete** the **workspace** before ceasing to be **owner**, so a **workspace** is never left without an **owner**. A **user** does not **leave** their **default workspace** through this flow — they remain its **owner**.

**Workspace role**:
A named membership level for a **user** in a **workspace**. The fixed set is **Owner**, **Admin**, and **Member**. It provides a **baseline** for authorization; **granular permissions** refine what **Owner** and **Admin** may do **workspace**-wide and on particular **campaigns** or **categories** (subject to the **Member hard ceiling**).

**Owner (workspace role)**:
The **workspace role** aligned with **workspace ownership**: has **all rights** in the **workspace** — every capability available to **Admin**, plus **Owner-only** governance (such as **workspace ownership transfer** and **soft-delete** of an **additional workspace**). A **workspace owner** **user** is persisted as **Owner** **only** in that **workspace** (**Owner–Admin normalization**); no separate **Admin** **workspace role** row is kept. May access the **admin area** / **Admin UI** as well as the **public campaign page** where entitlement allows. Does **not** use the **Member UI** (**Owner–Member exclusivity**). Casts **votes** **only** on the **public campaign page** like other roles.

**Admin (workspace role)**:
The **moderator** and operator **workspace role** for **users** who are not **Owner**: day-to-day moderation and **operational** duties below **Owner** privilege (**Owner** has **all rights**, including those of **Admin**). Combined **additively** with **granular permissions** (see **Additive granular model**). May access the **admin area** / **Admin UI** as well as the **public campaign page** where entitlement allows. Does **not** see the **Member UI** unless the same **user** also has the **Member** **workspace role** (**multi-role assignment**). Casts **votes** **only** on the **public campaign page** like other roles.

**Member (workspace role)**:
The default broad-participation role; expected to be the **most common** **workspace role**. Baseline is **view** and **vote** (see and cast votes where the product allows). Does not carry **moderator** responsibilities reserved for **Admin**. **Granular permissions** cannot expand a **Member** beyond that baseline (**Member hard ceiling**). Has **no access** to the **admin area** / **Admin UI**. Sees the **Member UI** (including **my votes** and **my campaigns**) when this role is assigned, and uses the **public campaign page** for per-**campaign** **view** and **vote** — not **admin** screens.

**Member hard ceiling**:
**Granular permissions** may not grant a **Member** any capability outside **view** and **vote** (including **campaign**, **category**, or **nominee** **modification**); structural or editorial access requires at least the **Admin** **workspace role** (or **Owner** where only **Owner** may act).

**Granular permission**:
A specific assignable right from the product permission tree, scoped as the product defines (e.g. **workspace**-wide, per **campaign**, or per **category**). For **Owner** and **Admin**, **effective access** follows the **Additive granular model**; **Member** **effective access** is capped by the **Member hard ceiling**.

**Additive granular model**:
For **Owner** and **Admin**, **granular permissions** are **additive only**: they may **grant** extra capability in narrower scope, but there are **no explicit denies** that strip a right already implied by the **workspace role** baseline.

## Relationships

- A **User** has exactly one **default workspace** (auto-created, non-transferable, renamable with persistent “(default)” labeling in the UI).
- A **User** may also **create** **additional workspaces** and may belong to **multiple workspaces** as a member or owner.
- An **additional workspace** may undergo **workspace ownership transfer** to another user (**acceptance** by the **recipient** required, **pending** until then, **cancellable** by the **current** **owner**, **expires** after **fourteen days** without **acceptance**; **accept**, **decline**, **cancel**, and **expiry** notify **initiator** and **recipient** via **in-app** and **email**, subject to preferences); a **default workspace** may not.
- An **additional workspace** may be **deleted** by its **owner**; a **default workspace** is not removed through this same “delete workspace” action.
- A **Workspace** contains zero or more **campaigns**; a **campaign** belongs to exactly one **workspace**.
- A **Campaign** contains **categories**; a **category** belongs to exactly one **campaign**.
- **Category** **voting** **inherits** the **campaign** by default; optional **start**/**end** **overrides** apply **only** **inside** the **campaign**’s permitted voting period.
- **Category voting configuration** sets **singular** vs **multiple** active selections and **revocable** vs **non-revocable** behavior (**default**: **singular**, **revocable**, **replacement** allowed).
- **Campaign** **lifecycle** transitions use one **shared** path for **manual** and **scheduled** triggers with identical **validation**.
- A **public campaign** may be **viewed** by **anonymous visitors**; **voting** always requires a signed-in **User**.
- A **private campaign** is presented as **not found** to anyone without entitlement (not as a distinct **forbidden** state).
- A **non-owner member** may **leave** a **workspace**; **leaving** does not remove the **workspace** for others.
- A **soft-deleted additional workspace** stays **restorable** by the **owner-at-delete** for **one year**, then is **no longer restorable**.
- **Authorization** in a **workspace** uses **named workspace roles** together with **granular permissions**; the latter may target the **workspace**, a **campaign**, or a **category**.
- For **Owner** and **Admin**, **granular permissions** follow the **Additive granular model** (**additive only**).
- The **workspace roles** are **Owner**, **Admin** (**moderator**), and **Member** (**view** and **vote** baseline; intended as the most common assignment).
- **Owner** has **all rights** in the **workspace**, including every **Admin**-level capability, plus **Owner-only** actions; **Admin** applies to **users** who are not **Owner**.
- A **Member** is subject to the **Member hard ceiling**: **granular permissions** never add editorial or structural rights beyond **view** and **vote**.
- **Member** has **no** access to the **admin area** / **Admin UI** and sees the **Member UI** (plus the **public campaign page**) when the **Member** **workspace role** is assigned. **Owner** and **Admin** may use the **admin area** / **Admin UI** and the **public campaign page** where entitlement allows; **Admin** sees **Member UI** **only** if they also hold the **Member** **workspace role** (**multi-role assignment**). **Owner** never uses **Member UI** in that **workspace** (**Owner–Member exclusivity**).
- **Vote** submission for **Owner**, **Admin**, and **Member** happens **only** on the **public campaign page**, never inside the **admin area**.
- The **Member UI** is a **separate** product surface from the **admin area** (distinct UX lineage, not **admin** screenshots repurposed).
- A **user** may hold **multiple** **workspace roles** in one **workspace** (**multi-role assignment**), except **Owner** with **Member** (**Owner–Member exclusivity**) and except persisting **Admin** alongside **Owner** for the **workspace owner** (**Owner–Admin normalization**); **Member UI** and **Admin UI** visibility follow their respective role gates.

## Example dialogue

> **Dev:** “Can a campaign exist without a workspace?”  
> **Domain expert:** “No — a **campaign** only exists inside a **workspace**.”

> **Dev:** “Does midnight cron bypass the ‘can’t start in the past’ rule?”  
> **Domain expert:** “No — **scheduled** and **manual** use the **same** checks in one path.”

> **Dev:** “Can a category stay open after the campaign would close?”  
> **Domain expert:** “No — **overrides** have to sit **inside** the **campaign** window; default is **inherit**.”

> **Dev:** “One vote or ranked list?”  
> **Domain expert:** “That’s **category voting configuration** — **singular** or **multiple** picks, **revocable** or locked — default is **one** active pick you can **swap** while voting is open.”

> **Dev:** “If the user renames their default workspace, do we still show it as the default?”  
> **Domain expert:** “Yes — the UI always indicates **(default)** together with whatever name they chose.”

> **Dev:** “Can someone else become owner of my default workspace?”  
> **Domain expert:** “No — the **default workspace** is not transferable.”

> **Dev:** “Can I have more than one workspace?”  
> **Domain expert:** “Yes — besides your **default workspace**, you can **create additional workspaces** and belong to others you’re invited to.”

> **Dev:** “Can I give away an extra workspace I created?”  
> **Domain expert:** “Yes — **ownership transfer** is allowed for **additional workspaces**, but not for your **default workspace**.”

> **Dev:** “Can I delete an extra workspace?”  
> **Domain expert:** “Yes — you **soft-delete** it: it drops out of **active** use; for **one year** the **owner-at-delete** can **restore** it, then it’s **no longer restorable**.”

> **Dev:** “I’m invited to someone’s workspace — can I leave?”  
> **Domain expert:** “Yes — if you’re not the **owner**, you can **leave** and the **workspace** stays for everyone else.”

> **Dev:** “If I soft-delete my extra workspace, can someone else restore it?”  
> **Domain expert:** “No — only the **owner-at-delete** may **restore** it during **retention**.”

> **Dev:** “How long do I have to change my mind?”  
> **Domain expert:** “**One year** from **soft-delete** — that’s **retention**; after that it’s **no longer restorable**.”

> **Dev:** “Are permissions just a giant checklist?”  
> **Domain expert:** “No — you get a **workspace role** as a baseline, then **granular permissions** tune what you can do per **campaign** or **category**.”

> **Dev:** “What’s the difference between Admin and Member?”  
> **Domain expert:** “**Member** gets **Member UI** plus the **public campaign page** — never **Admin UI**. **Admin** lives in **Admin UI** for moderation and **votes** on the **public campaign page** like everyone else.”

> **Dev:** “Can someone be Admin and Member at once?”  
> **Domain expert:** “Yes — **multi-role assignment**. They’d see **Admin UI** from **Admin** and **Member UI** from **Member**.”

> **Dev:** “Can the workspace Owner also be a Member?”  
> **Domain expert:** “No — **Owner** and **Member** are **mutually exclusive** in one **workspace**; the owner **votes** on the **public campaign page** but never gets **Member UI** there.”

> **Dev:** “Do I tag myself as Admin if I own the workspace?”  
> **Domain expert:** “No need — **Owner** already has **all rights**, including everything **Admin** can do.”

> **Dev:** “What if the API tries to give me Owner and Admin rows?”  
> **Domain expert:** “We **normalize** to **Owner** **only** — redundant **Admin** isn’t kept for the **workspace owner**.”

> **Dev:** “I’m giving away my extra workspace — what happens to me?”  
> **Domain expert:** “The **transfer** UI has a **chooser** for after it completes — **Admin**, **Member**, or **leave** — and the new **owner** has to **accept** before anything flips. Until then you’re still **owner**, you can **cancel** anytime, and the **pending** **transfer** **expires** after **fourteen days** without **acceptance**.”

> **Dev:** “If a transfer expires without acceptance, do we notify?”  
> **Domain expert:** “**Accept**, **decline**, **cancel**, **expiry** — **in-app** and **email** for both sides, unless they’ve turned something off in preferences.”

> **Dev:** “Can I tick ‘edit campaign’ for a Member in one row of the matrix?”  
> **Domain expert:** “No — **Member** has a **hard ceiling**; you promote them to **Admin** (or higher) for that.”

> **Dev:** “Can granular permissions forbid an Admin from editing a campaign?”  
> **Domain expert:** “No — **granular** is **additive only**; you don’t use it to **deny** what **Admin** already implies.”

> **Dev:** “Can tourists vote in our public Game Awards clone?”  
> **Domain expert:** “They can **look around**; to **vote** they need to sign in as a **User**.”

> **Dev:** “If I paste a private campaign URL while logged out, do we 403?”  
> **Domain expert:** “We treat it like **not found** — you can’t tell if it’s real.”

> **Dev:** “Do I vote from the admin dashboard?”  
> **Domain expert:** “No — everyone who **votes** uses the **public campaign page**; **admin** is for running the show.”

> **Dev:** “Where does a Member see ‘my campaigns’?”  
> **Domain expert:** “In the **Member UI** — its own shell, not tucked into **admin** mockups.”

## Flagged ambiguities

- Stakeholder phrase “**only Admins**” for **Admin UI**: **CONTEXT** treats **Owner** and **Admin** **workspace roles** as both granting **Admin UI** access. If **Owner** must use a **separate** operator shell, that split is not recorded yet.

