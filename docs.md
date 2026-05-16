# Pages

1. home
2. admin
3. campain

## Admin Page

[https://excalidraw.com/#json=w6Gasrgh2hJ_r_7Rypmev,9N98kPev0gnzmazYF_SV1w](https://excalidraw.com/#json=w6Gasrgh2hJ_r_7Rypmev,9N98kPev0gnzmazYF_SV1w)

Refined wireframe (local, open in Excalidraw): [docs/admin-page-wireframe.excalidraw](docs/admin-page-wireframe.excalidraw) — cards only (no column panels); regenerate with 

`node scripts/generate-admin-wireframe.mjs`.

# features

### Workspaces

user can create multiple workspaces. And he can invite other members to their workspace. Each workspace represents its own instance of permission roles hierarchy:

   campaign: 

```
 can_view (per campaign only)
 can_vote
 can_modify:
    can_create, can_edit, can_delete,  (global or per campaign)    
    can_launch, can_finish (global or per campaign)  
    can_add_category (global or per campaign)
```

   campaign category 

```
    can_create, can_edit, can_delete,  (global,  per_campaign or per category)  
    can_launch, can_finish (global,  per_campaign or per category)

    can_add_nominee (global,  per_campaign or per category)

nominee

    can_create, can_edit, can_delete,  (global,  per_campaign or per category)

users:
   can_view, can_message, can_add, can_remove
```

### [Campaigns](docs/awards-obsidian-docs/campaigns.png)

user with create campaign role can create campaign

campain can have start date, end date - in this case it should automatically start or end at specified date time

user can also start or end campaign manually 

campaign should have name, slug - required, and also description, small and big image optionally. small image used in lists and overview, big image is visible only in campaign page. campaign can also be public or private. if private - only visible to the workspace members with can_view rights for this campaign.  public can be accessed even by unregistered users.

can have statuses: draft, ready, started, finished.

can have start date and end date

when ready cannot be edited. You can revert ready to draft if not started yet. When started can only be finished. can be started or finished either automatically when date arrived or manually. cannot strat a campaign when a due date in the past. cannot finish if not started.

when campaign is started the users with can_vote can vote for the nominee in opened categories

### Categories

category should only have a name. can have description, small image, big image (same as with campaigns). have order. can be sorted by order

can specify req for a nominee (should have location, date, person, image, description)

### Nomenees

should have name, can have descriptions, image, description, can have location, date, or person attached

### Users

user can be invited with the link. user shuld have add_user right to add more users. when generating link it is possible to set rights. user can edit their photo, name and email in the settings

### Alerts

whenever any action happened - it should be logged in the system with all entities involved. For example user edited category. SHould store userId, categoryId, prev affected fields + new fields. - all information needed to restore the change if neccesary. And the live feed available in the user menu.  
You can setup notification configuration in the settings (which actions you want to follow). No matter what user preference is - the activity should be written in DB. Preferences only describes whether you show it in your feed or not