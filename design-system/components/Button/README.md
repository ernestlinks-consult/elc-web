# Button

Buttons start an action or go to the next step; label them with a verb in sentence case ("Start online", "Book a slot", "Send message").

- **Primary** (`blue`): the one action the view is for, usually *Start online*. One per view.
- **Secondary** (blue outline): the alternative, usually *Chat on WhatsApp* or *Book a 1-on-1 with our CEO*.
- **On blue / Outline on blue**: the same pair inside blue sections.
- **Red** (`red`, white text): reserved for *Choose Express* and *Subscribe*. Never more than one on a screen.
- **Ghost**: low-weight text actions such as *Finish later, just contact me* or *Send back to draft*.
- `size="lg"` for heroes and form submits; `md` elsewhere. Minimum height 44px.
- Disabled buttons say why next to them ("Publish (tick both checks)"). Pass `href` to render a link.
