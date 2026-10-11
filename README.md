# The Nonty Experience — Corporate Website Design Specification

The website should position **The Nonty Experience** as a premium beauty, makeup, and glamour brand, transforming the original promotional brochure into a polished digital experience suitable for clients, special occasions, professional bookings, and social media marketing.

The design will preserve the brand's original emphasis on creative expression, individuality, and celebrating natural beauty while introducing a more sophisticated visual identity, modern user experience, and clear booking journey.

The brochure establishes the following brand elements:

* **Brand:** The Nonty Experience.
* **Original tagline:** “Get Glammed for Your Next Gig.”
* **Brand philosophy:** Makeup is a medium for creative artistic expression, intended to enhance and celebrate the natural features of every unique canvas. 
* **Original services:** Natural Look, Soft Glam, Full Face Beat, Eyebrows, and Eyelashes.
* **New contact number:** 0813864024.
* **New business email:** [nonty@re-el.co.za](mailto:nonty@re-el.co.za).

The specification below is designed for implementation in a single `index.html` file, using HTML5, CSS3, and JavaScript, with CDN-hosted libraries and assets where appropriate.

## 1. Creative direction: The Nonty Experience

### 1.1 Brand positioning

The website should communicate five things immediately:

1. **Beauty expertise** — professional makeup services for different looks and occasions.
2. **Individuality** — makeup that enhances each client's natural features.
3. **Glamour** — a sophisticated aesthetic suitable for events, celebrations, and special occasions.
4. **Trust** — authentic portfolio photographs, clear pricing, and direct communication.
5. **Accessibility** — an effortless way to enquire, discuss a desired look, and arrange a booking.

The visual direction should be closer to a boutique beauty studio than a generic makeup template.

**Recommended creative concept:** *Editorial Beauty Meets Modern African Glamour.*

This combines editorial photography, elegant typography, premium beauty imagery, and a restrained motion-design system.

### 1.2 Existing brand identity

The uploaded brochure provides a useful foundation for the website.

| Element           | Existing identity                       | Website direction                             |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Brand name        | The Nonty Experience                    | Preserve the full brand name                  |
| Logo              | NONTY wordmark with makeup brushes      | Refine and reuse the existing logo            |
| Primary colour    | Dusty rose                              | Retain as the signature brand colour          |
| Secondary colour  | Pale pink                               | Use for soft backgrounds and highlights       |
| Contrast          | Black                                   | Use for typography and selected dark sections |
| Supporting colour | Muted brown                             | Use sparingly for warmth and depth            |
| Photography       | Makeup portraits and client photographs | Develop into a curated beauty portfolio       |
| Brand philosophy  | Individuality and creative expression   | Feature prominently on the homepage           |
| Original tagline  | Get Glammed for Your Next Gig           | Retain as a recognizable brand message        |

The brochure's dusty-rose background, black typography, pink accents, and makeup-brush logo are the strongest starting points.

The website should refine these elements rather than introduce an unrelated brand identity.

---

## 2. Design system and colour palette

The following palette is a proposed digital refinement of the existing brand.

| Design token | Colour    | Application                                             |
| ------------ | --------- | ------------------------------------------------------- |
| Primary      | `#C995A8` | Brand backgrounds, selected buttons, decorative accents |
| Primary dark | `#95677B` | Hover states and darker pink elements                   |
| Pale pink    | `#F8E8ED` | Soft section backgrounds                                |
| Rose white   | `#FFF9FA` | Main page background                                    |
| Ink black    | `#171316` | Headings, navigation, and body text                     |
| Warm brown   | `#754A45` | Editorial accents and selected panels                   |
| Muted text   | `#756B70` | Secondary information                                   |
| White        | `#FFFFFF` | Cards, overlays, and contrast                           |
| Border       | `#E8DDE1` | Dividers, form fields, and card outlines                |

### Colour distribution

Aim for approximately:

* 50% white and rose-white surfaces.
* 25% dusty-rose elements.
* 15% black and dark editorial sections.
* 10% pale pink and warm-brown accents.

These are design targets rather than rigid requirements.

**Important:** Do not place every section on a pink background. Alternate light surfaces, photography, and dark editorial sections to give the website visual depth.

Text contrast must be checked independently of the brand colours. Dark text should be used on pale pink backgrounds, and white text should only be used on sufficiently dark surfaces.

### CSS variables

The implementation should centralize its design tokens in `:root`.

```css
:root {
  --color-primary: #C995A8;
  --color-primary-dark: #95677B;
  --color-pink-soft: #F8E8ED;
  --color-background: #FFF9FA;
  --color-ink: #171316;
  --color-brown: #754A45;
  --color-muted: #756B70;
  --color-white: #FFFFFF;
  --color-border: #E8DDE1;

  --font-display: "Cormorant Garamond", serif;
  --font-body: "DM Sans", sans-serif;

  --container-width: 1240px;

  --radius-small: 10px;
  --radius-medium: 18px;
  --radius-large: 28px;
  --radius-pill: 999px;

  --shadow-card:
    0 12px 40px rgba(23, 19, 22, 0.07);

  --transition-fast: 180ms ease;
  --transition-normal: 350ms ease;
  --transition-slow: 700ms ease;
}
```

---

# 3. Website structure

The website should be a complete, single-page brand profile rather than a simple contact page.

All primary sections will live in `index.html`, with navigation links scrolling to their respective sections.

## Recommended page architecture

| Order | Section             | Purpose                                     |
| ----- | ------------------- | ------------------------------------------- |
| 1     | Announcement bar    | Promote booking enquiries or current offers |
| 2     | Navigation          | Brand recognition and section navigation    |
| 3     | Hero                | Establish the brand and encourage bookings  |
| 4     | Trust strip         | Summarize the brand's beauty philosophy     |
| 5     | About the brand     | Explain the Nonty Experience                |
| 6     | Services            | Present makeup services                     |
| 7     | Signature look      | Showcase the Full Face Beat offer           |
| 8     | Portfolio           | Display authentic makeup work               |
| 9     | The experience      | Explain the client journey                  |
| 10    | Booking process     | Explain how clients can enquire             |
| 11    | Brand philosophy    | Present the original creative philosophy    |
| 12    | FAQ                 | Answer common booking questions             |
| 13    | Contact and booking | Convert visitors into enquiries             |
| 14    | Footer              | Business information and social links       |

The page should tell a coherent story: **discover the brand → explore the services → see the work → understand the process → make an enquiry.**

---

# 4. Detailed section specifications

## 4.1 Announcement bar

Place a narrow announcement bar above the main navigation.

**Example copy:**

> THE NONTY EXPERIENCE · YOUR BEAUTY, YOUR EXPRESSION.

Alternatively, use this space to communicate an actual booking offer or availability update.

### Design

* Dark ink background.
* White or pale-pink typography.
* Small uppercase text.
* Letter spacing around `0.12em`.
* Height of approximately 32–38 pixels.
* Optional subtle fade-in when the page loads.

Do not use a scrolling announcement ticker by default. A static announcement is more restrained and accessible.

Only display claims about availability, discounts, or special offers when they are current and accurate.

## 4.2 Navigation

Create a premium, responsive navigation bar.

### Desktop layout

**Left:** The Nonty Experience logo.

**Centre:**

* Home
* About
* Services
* Portfolio
* Contact

**Right:** A prominent `BOOK YOUR LOOK` button.

### Visual styling

* White or rose-white background.
* Approximately 82 pixels high on desktop.
* Subtle bottom border.
* Logo with a maximum height of approximately 56 pixels.
* Generous spacing between navigation items.
* Clean typography.
* Smooth hover transitions.

The navigation should become a compact sticky header after the visitor scrolls beyond the hero section.

Use a subtle shadow only after the header becomes sticky.

### Mobile navigation

On mobile devices:

* Keep the logo on the left.
* Place a menu toggle on the right.
* Open a full-height or near-full-height navigation panel.
* Include a prominent booking button.
* Prevent background scrolling while the menu is open.
* Close the menu after a navigation link is selected.
* Support keyboard navigation and Escape-to-close.

The navigation must work without JavaScript where practical, and its interactive controls must have accessible labels.

---

## 4.3 Hero section: the main attraction

The hero section is the most important part of the website.

It should immediately show visitors what the brand does and provide a clear next step.

### Recommended composition

Use an asymmetrical, two-column editorial layout.

**Left column:**

Small eyebrow:

`THE ART OF BEAUTY`

Main heading:

> Every Face Has a Story.
> Let Yours Shine.

Supporting copy:

> From natural beauty to full-glam transformations, The Nonty Experience celebrates your individuality through makeup that enhances your features and expresses your unique beauty.

Primary CTA:

`BOOK YOUR LOOK`

Secondary CTA:

`EXPLORE THE PORTFOLIO`

Below the buttons, include a compact brand statement:

`Natural Beauty · Soft Glam · Full Face Beat`

**Right column:**

A large, high-quality photograph showing a real makeup result.

The image should be presented in an elegant editorial frame, with a soft pink background, subtle rounded corners, and restrained decorative details.

Use a portrait that demonstrates the quality and style of the actual service. The existing brochure photographs can serve as initial portfolio material, provided the original image files are available in sufficient quality.

### Hero design details

* Minimum desktop height: approximately 650 pixels.
* Content container: maximum width of 1,240 pixels.
* Text column: approximately 45%.
* Image column: approximately 55%.
* Large serif heading with controlled line breaks.
* Comfortable line spacing.
* Strong visual contrast between text and background.
* Subtle decorative star or sparkle motifs inspired by the original brochure.

Avoid filling the hero with multiple floating cards, excessive sparkles, and competing animations.

The photograph should remain the dominant visual element.

### Hero animation

On initial load:

1. The eyebrow fades in.
2. The headline reveals with a slight upward movement.
3. The supporting paragraph appears.
4. The CTA buttons fade in.
5. The hero photograph reveals through a gentle mask or opacity transition.

Keep the entire sequence short, approximately 700–1,000 milliseconds.

Do not delay the appearance of essential booking information until an animation finishes.

---

## 4.4 Brand introduction and trust strip

Immediately below the hero, create a horizontal strip summarizing the brand.

Example:

**BEAUTY WITH INTENTION**

`Natural Enhancement` · `Individual Expression` · `Artistic Makeup` · `Personalized Glamour`

Use small separators or simple line icons rather than large illustrations.

### Design

* Pale-pink or white background.
* Thin top and bottom borders.
* Four evenly spaced items on desktop.
* Horizontal scrolling or a two-column layout on smaller screens.

These are brand positioning statements, not independently verified qualifications or awards.

Do not add ratings, client counts, professional accreditations, or years of experience unless the business can substantiate them.

---

# 5. About section

## Section heading

> More Than Makeup. An Expression of You.

### Recommended copy

> At The Nonty Experience, makeup is more than a beauty routine. It is a creative expression that celebrates individuality, enhances natural features, and gives every client the freedom to express their own sense of beauty.
>
> Whether you prefer a natural finish, a soft-glam look, or a full-face transformation, the experience begins with understanding the look you want to achieve.

This copy reflects the brochure's stated philosophy without introducing unsupported claims about the business's history or qualifications.

### Layout

Use a two-column composition.

**Left:** A large portrait or behind-the-scenes photograph.

**Right:** Brand introduction, philosophy, and a CTA linking to services.

Add a small editorial label:

`THE PHILOSOPHY`

The image can have an asymmetric border radius or a framed editorial treatment.

### Optional visual detail

Include a pull quote:

> “Makeup is a medium for creative artistic expression.”

This is taken directly from the original brand philosophy. 

The quote should appear in the display font with a decorative quotation mark.

### Animation

* Reveal the photograph with a gentle clipping animation.
* Fade the text upward as it enters the viewport.
* Keep the image and text animations synchronized loosely rather than making one wait for the other.

---

# 6. Services section

The services section should be one of the website's primary conversion points.

The brochure lists five makeup services, with prices ranging from R59 to R179 for the individually listed services. It also includes an Advanced Full Face Beat promotion showing R210 crossed out and R179 as the reduced price. 

These are the **prices printed in the supplied brochure**, not independently confirmed current prices. Before launch, confirm whether they remain valid.

## 6.1 Service cards

Use a responsive grid with five cards on larger screens, or three columns followed by two centered cards.

On tablets, use two columns. On mobile, use a single column or a compact two-column layout where the content remains readable.

Each card should contain:

1. Service photograph or appropriate beauty image.
2. Service name.
3. Brief description.
4. Price, if confirmed.
5. Enquiry button.

### Proposed service presentation

| Service            | Brochure price | Website presentation                                    |
| ------------------ | -------------: | ------------------------------------------------------- |
| Natural Look       |            R99 | A fresh, understated finish                             |
| Soft Glam          |           R119 | A polished look with soft definition                    |
| Full Face Beat     |           R179 | A more defined, statement-making makeup look            |
| Eyebrows           |            R59 | Defined brows that complement the overall look          |
| Eyelashes — single |           R139 | Individual lash option, subject to service confirmation |
| Eyelashes — strip  |            R79 | Strip lash option, subject to service confirmation      |

The descriptions above are proposed marketing copy, not detailed technical descriptions of the services. Confirm the precise inclusions with the business before publishing.

### Important pricing distinction

The brochure presents eyelashes as R139 for a single option or R79 for a strip option. The website must preserve that distinction rather than presenting the prices as interchangeable.

The brochure also includes a promotional Full Face Beat offer at R179, reduced from R210. This should only appear as a current sale if the offer is still valid.

### Service card design

* White background.
* Fine border in `#E8DDE1`.
* Rounded corners.
* Image aspect ratio around 4:5.
* Service name in the display font.
* Price in bold, dark typography.
* Short description in muted text.
* Enquiry button or text link.

On hover, the card can move upward by 4 pixels, while its image scales slightly.

Avoid making every card glow or animate independently.

### Service enquiry interaction

Each card should contain a button such as:

`ENQUIRE ABOUT THIS LOOK`

When clicked, the website should open WhatsApp with a prefilled message identifying the selected service.

Example:

> Hi Nonty, I would like to enquire about the Natural Look makeup service. Please share the current price and booking availability.

The enquiry must not automatically confirm a booking.

---

# 7. Featured promotion: Full Face Beat

This section should receive stronger visual emphasis than an ordinary service card.

The brochure includes an Advanced Full Face Beat promotion.

### Recommended heading

> Your Moment. Your Glam.

### Supporting copy

> Step into your next occasion with a look that celebrates your features and expresses your personal style.

### Layout

Use a split composition:

* Large makeup portrait on one side.
* Dark editorial panel on the other.
* Large service heading.
* Confirmed promotional price.
* Original price with a strikethrough only when the discount is active.
* Booking enquiry CTA.

### Visual direction

Use a dark background with pale-pink typography and restrained rose accents.

The darker section creates contrast with the light services grid and makes the promotion feel deliberate.

### Optional animation

A slow image reveal can be used as the section enters the viewport. The promotional heading can fade in with a slight upward movement.

Do not use flashing sale indicators or aggressive countdown timers.

A countdown should never be displayed unless it corresponds to a genuine, time-limited offer.

---

# 8. Portfolio: The Nonty Beauty Gallery

For a makeup business, the portfolio is essential. Visitors need to see examples of the work before deciding whether to enquire.

The supplied brochure already contains several client photographs and makeup examples. These should be treated as the initial visual reference.

## 8.1 Gallery structure

Recommended heading:

> Beauty in Every Detail.

Supporting copy:

> Explore makeup looks that celebrate individuality, creativity, and personal style.

### Gallery layout

Use an editorial grid rather than a uniform row of identical cards.

For example:

* One large portrait occupying two grid columns.
* Two smaller portrait photographs.
* One landscape or behind-the-scenes photograph.
* Additional portraits arranged in a balanced grid.

Use actual photographs from the business wherever possible.

### Gallery categories

If sufficient photographs exist, introduce filters such as:

* All Looks
* Natural
* Soft Glam
* Full Glam
* Before & After

Only enable categories for which suitable images are available.

Before-and-after comparisons should use authentic images of the same client and should not be digitally manipulated to exaggerate results.

### Lightbox functionality

When a visitor selects a photograph:

* Open a modal lightbox.
* Display a larger version of the photograph.
* Provide previous and next controls.
* Allow Escape to close.
* Support keyboard navigation.
* Display an optional short caption.
* Prevent background scrolling while open.

The gallery should also remain usable if JavaScript fails.

### Photography standards

* Prioritize sharp, well-lit images.
* Use consistent cropping.
* Preserve natural skin texture.
* Avoid excessive smoothing.
* Use images that the business has permission to publish.
* Obtain appropriate client consent before publishing photographs.

**Do not rely on generic stock photography to represent actual client results.** Stock images can be used for decorative beauty imagery, but portfolio photographs must represent real work.

---

# 9. The client experience

This section explains what happens after a visitor decides to make an enquiry.

### Heading

> Your Glam Journey, Made Simple.

### Three-step process

**01 — Tell Us Your Vision**

Share the occasion, preferred makeup style, and any reference photographs.

**02 — Discuss Your Look**

Contact the business to confirm the service, price, date, availability, and any specific requirements.

**03 — Get Ready for Your Moment**

Once the details have been agreed upon, prepare for your makeup appointment according to the confirmed arrangements.

### Design

Display the three steps as horizontal cards on desktop and vertically stacked cards on mobile.

Each step should include a large number, short heading, and concise explanation.

### Animation

Use a staggered reveal with a slight upward movement.

The numbering can use a thin outlined style inspired by luxury editorial publications.

Avoid implying that bookings are confirmed automatically through the website unless an actual booking system is implemented.

---

# 10. Brand philosophy section

This section should distinguish The Nonty Experience from a generic makeup service.

The original brochure emphasizes conscious capitalism, individuality, creative expression, and celebrating the feminine essence. It also rejects superficial standards of beauty. 

The website should preserve the central message while presenting it in a more readable format.

### Recommended heading

> Beauty Without a Single Definition.

### Proposed copy

> We believe beauty is personal. Makeup is a creative medium through which individuality can be expressed, natural features can be celebrated, and personal style can take centre stage.
>
> The Nonty Experience is built around the idea that every face is unique and every look should have room for that individuality.

### Visual design

* Full-width dark section.
* Pale-pink or white typography.
* Large serif heading.
* Generous whitespace.
* One carefully selected portrait or abstract decorative detail.
* Small editorial label: `THE NONTY PHILOSOPHY`.

Use this section to create an emotional connection without making unsupported claims about the brand's impact or social initiatives.

The full original philosophy does not need to be reproduced word for word. A shorter, clearer presentation will work better on mobile screens.

---

# 11. Booking and contact section

This is the website's most important conversion area.

Every major section should lead visitors toward this point without overwhelming them with booking buttons.

## 11.1 Contact information

Display the updated contact details prominently:

**Phone:** 0813864024
**Email:** [nonty@re-el.co.za](mailto:nonty@re-el.co.za)

Use these details consistently across the website, metadata, footer, and contact buttons.

### Phone link

```html
<a href="tel:+27813864024">
  Call Nonty
</a>
```

The international-format telephone number is appropriate for a South African mobile number.

### Email link

```html
<a href="mailto:nonty@re-el.co.za">
  Email Nonty
</a>
```

### WhatsApp booking link

Use the international-format number without spaces, brackets, or the leading domestic zero.

```html
<a
  href="https://wa.me/27813864024?text=Hi%20Nonty%2C%20I%20would%20like%20to%20enquire%20about%20a%20makeup%20booking."
  target="_blank"
  rel="noopener noreferrer"
>
  Enquire on WhatsApp
</a>
```

The WhatsApp link opens a prefilled enquiry. It does not verify whether WhatsApp is registered to that number or whether the business is available.

## 11.2 Contact form

The contact section should include a form with the following fields:

| Field              | Type           | Required |
| ------------------ | -------------- | -------- |
| Full name          | Text           | Yes      |
| Phone number       | Telephone      | Yes      |
| Email address      | Email          | No       |
| Desired service    | Select         | Yes      |
| Preferred date     | Date           | No       |
| Preferred time     | Select or text | No       |
| Occasion           | Text           | No       |
| Additional details | Textarea       | No       |

Suggested service options:

* Natural Look
* Soft Glam
* Full Face Beat
* Eyebrows
* Eyelashes
* Other / Not sure yet

### Recommended submission method

For a lightweight static website, the initial implementation can generate a WhatsApp message from the form data.

The visitor fills in the form, reviews the generated enquiry in WhatsApp, and chooses whether to send it.

This avoids requiring a custom backend simply to collect basic booking enquiries.

**Important:** A WhatsApp redirect is not a substitute for a backend contact form. If the business later needs enquiries stored in a database, email notifications, automated confirmations, or an administrative booking dashboard, those features will require additional infrastructure.

### Form behavior

* Validate required fields.
* Show clear inline error messages.
* Preserve form values when validation fails.
* Prevent duplicate interactions while processing.
* Encode message content safely.
* Never include sensitive information in URL parameters.
* Provide a fallback email link if WhatsApp cannot be opened.

Do not claim that an enquiry has been sent until the visitor actually submits it through the external service.

---

# 12. Frequently asked questions

The FAQ section should answer common questions without inventing business policies.

Recommended questions include:

1. What makeup services does The Nonty Experience offer?
2. How do I enquire about a booking?
3. How do I confirm the price of a service?
4. Can I request a specific makeup look?
5. How far in advance should I enquire?
6. What happens after I submit a booking enquiry?
7. Are makeup services available for special occasions?

Answers should be confirmed with the business before publication.

For example:

**How do I enquire about a booking?**

> Contact The Nonty Experience on WhatsApp at 0813864024 or email [nonty@re-el.co.za](mailto:nonty@re-el.co.za). Include your preferred service and date so that your enquiry can be reviewed.

Avoid publishing unconfirmed information about deposits, cancellation fees, appointment locations, travel charges, or availability.

### Interaction design

Use accessible accordion components.

Each question should be a button with:

* `aria-expanded`
* `aria-controls`
* A visible focus indicator
* A clear open/closed state

Only animate the height when doing so remains smooth and responsive.

---

# 13. Footer

The footer should feel like the final page of a premium beauty editorial.

### Recommended layout

**Column 1 — Brand**

The Nonty Experience logo.

> Beauty is personal. Let your individuality shine.

**Column 2 — Explore**

* Home
* About
* Services
* Portfolio
* Contact

**Column 3 — Contact**

* 0813864024
* [nonty@re-el.co.za](mailto:nonty@re-el.co.za)
* WhatsApp enquiry

**Column 4 — Social**

Add Instagram, Facebook, or TikTok links only after the correct profile URLs have been supplied.

### Bottom strip

Include:

`© 2026 The Nonty Experience. All rights reserved.`

Use the current year dynamically in JavaScript if desired.

A small privacy notice should be added if the site collects or processes personal information.

---

# 14. Frameworks, libraries, and assets

The recommended implementation is a lightweight, single-file website. React is not necessary for this particular profile.

The objective is to create a premium visual experience without adding unnecessary build tooling, hosting costs, or dependencies.

## 14.1 Core technologies

| Technology         | Purpose                                                | Recommendation      |
| ------------------ | ------------------------------------------------------ | ------------------- |
| HTML5              | Page structure and semantic content                    | Required            |
| CSS3               | Design system, layout, responsiveness                  | Required            |
| Vanilla JavaScript | Navigation, gallery, animations, and form interactions | Required            |
| Google Fonts       | Display and body typography                            | Recommended         |
| Lucide Icons       | Consistent interface icons                             | Recommended         |
| GSAP               | Advanced entrance and scroll animations                | Optional            |
| Lenis              | Smooth-scroll enhancement                              | Optional            |
| Swiper             | Touch-friendly gallery carousel                        | Optional            |
| GLightbox          | Image lightbox                                         | Optional            |
| AOS                | Basic scroll-triggered animations                      | Alternative to GSAP |

### My recommendation

Use:

* HTML5
* CSS3
* Vanilla JavaScript
* Google Fonts
* Lucide Icons
* Intersection Observer API
* Native CSS transitions
* A lightweight custom gallery modal

Add GSAP only if the final design requires more sophisticated choreography.

Avoid loading both AOS and GSAP for the same animation tasks.

Similarly, a custom gallery modal may be preferable to loading a dedicated lightbox library for a small portfolio.

The final implementation should use only the dependencies required by the selected features.

## 14.2 Google Fonts

Use a pairing that gives the website editorial elegance without compromising readability.

**Display font:** Cormorant Garamond
**Body font:** DM Sans

Cormorant Garamond provides the high-contrast, editorial character associated with premium beauty publications.

DM Sans provides a clean, contemporary interface font for paragraphs, forms, navigation, and buttons.

Suggested weights:

* Cormorant Garamond: 500, 600, 700.
* DM Sans: 400, 500, 600, 700.

Load only the weights used in the design.

Where practical, use `font-display: swap` to prevent text from remaining invisible while fonts load.

## 14.3 Lucide Icons

Use Lucide for interface icons such as:

* Menu
* Close
* Arrow right
* Phone
* Mail
* Calendar
* Instagram
* Chevron down
* External link

Keep the icon style consistent.

Avoid mixing several unrelated icon libraries.

Icons should be accompanied by visible text where their purpose may otherwise be unclear.

## 14.4 Image assets

The website should use three categories of visual assets.

**Category A: Brand assets**

* Existing Nonty Experience logo.
* Original promotional artwork, if useful.
* Brand decorative motifs.

**Category B: Portfolio assets**

* Natural makeup photographs.
* Soft-glam photographs.
* Full-face makeup photographs.
* Detail photographs.
* Behind-the-scenes photographs, where available.

**Category C: Supporting assets**

* Carefully selected editorial beauty photographs.
* Subtle decorative patterns.
* Small SVG flourishes.
* Optional social sharing image.

### Recommended asset structure

Although the site itself will be a single HTML file, the image assets should be stored separately for easier maintenance.

```text
nonty-experience/
│
├── index.html
│
└── assets/
    ├── logo/
    │   ├── nonty-logo.svg
    │   └── nonty-favicon.png
    │
    ├── images/
    │   ├── hero-makeup.webp
    │   ├── about-nonty.webp
    │   ├── natural-look.webp
    │   ├── soft-glam.webp
    │   ├── full-face-beat.webp
    │   ├── eyebrow-detail.webp
    │   ├── lashes-detail.webp
    │   └── portfolio/
    │
    └── social/
        └── nonty-social-cover.webp
```

This is a recommended structure, not a claim that these image files already exist.

### Image optimization

* Use WebP or AVIF where supported.
* Preserve a high-quality source version of every photograph.
* Provide meaningful `alt` attributes.
* Set explicit image dimensions to reduce layout shifts.
* Lazy-load below-the-fold images.
* Do not lazy-load the primary hero image if doing so would delay the main visual.
* Use responsive image sizes where possible.
* Avoid unnecessarily large background photographs on mobile.

For the logo, prefer a genuine SVG or transparent PNG supplied by the brand.

Do not recreate the existing logo from a screenshot unless a replacement is specifically required.

---

# 15. Motion design and live animations

Motion should reinforce the premium identity, not distract from the makeup photographs.

The animation system should feel deliberate, soft, and controlled.

## 15.1 Page-load animations

On the initial page load:

1. The hero eyebrow fades into view.
2. The headline moves upward slightly.
3. Supporting text fades in.
4. CTA buttons appear.
5. The hero photograph reveals.
6. The navigation settles into its final position.

Use opacity and transforms instead of animating expensive layout properties.

Recommended duration: approximately 300–700 milliseconds per element, with short stagger delays.

## 15.2 Scroll-triggered reveals

Use the Intersection Observer API to reveal sections as visitors scroll.

Suitable elements include:

* About section imagery.
* Service cards.
* Portfolio photographs.
* Process steps.
* FAQ items.

Recommended behavior:

* Start with low opacity and a small vertical offset.
* Transition to full opacity and the final position.
* Use a stagger of approximately 70–120 milliseconds for grouped cards.
* Trigger the animation once per element in most cases.

Do not animate every paragraph and icon independently.

The page should remain visually calm.

## 15.3 Image hover effects

Portfolio and service images can use a restrained scale effect.

For example:

```css
.portfolio-image {
  overflow: hidden;
}

.portfolio-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms ease;
}

.portfolio-card:hover .portfolio-image img {
  transform: scale(1.04);
}
```

The HTML structure should ensure the image is clipped by its container.

On touch devices, the experience must not depend on hover to reveal important information.

## 15.4 Navigation animations

When the user scrolls:

* Transition the navigation background to an opaque surface.
* Add a subtle shadow.
* Keep the header height stable or reduce it slightly.
* Highlight the active section if this can be implemented reliably.

Avoid continuously moving the navigation while the user scrolls.

## 15.5 Decorative live animation

A subtle sparkle motif can be used in the hero or philosophy section.

Recommended implementation:

* Small SVG star shapes.
* Low-opacity transitions.
* Slow, occasional movement.
* No rapid flashing.
* No large particle systems.

These details should reference the original brochure's sparkle motifs.

## 15.6 Button animations

Primary buttons can have:

* A slight colour transition.
* A small arrow movement.
* A subtle background change.
* A visible keyboard focus ring.

For example, the arrow can move a few pixels to the right on hover.

Avoid exaggerated scaling or bouncing.

## 15.7 Loading states

A loading screen is not necessary for a lightweight profile.

Instead:

* Display the logo immediately.
* Reserve image dimensions to prevent layout shifts.
* Use a subtle skeleton only when content genuinely loads asynchronously.
* Keep the main heading and contact options visible as early as possible.

Do not force visitors to watch an elaborate introduction before they can access the website.

## 15.8 Reduced-motion support

The website must respect users who prefer reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

JavaScript-driven animations should also respect the user's motion preference.

---

# 16. Responsive design

The website should be designed mobile-first.

A significant proportion of beauty-service enquiries may originate from mobile social media traffic, so the mobile experience deserves particular attention.

## 16.1 Mobile layout

At approximately 320–767 pixels:

* Use a compact navigation bar.
* Stack the hero text and photograph.
* Keep the headline comfortably readable.
* Use full-width or nearly full-width primary buttons.
* Stack service cards vertically when necessary.
* Use a compact gallery grid.
* Keep the booking CTA accessible.
* Prevent horizontal overflow.
* Ensure form fields are easy to tap.

Do not simply shrink the desktop design.

The mobile layout should preserve the same hierarchy while simplifying the composition.

## 16.2 Tablet layout

At approximately 768–1023 pixels:

* Use a two-column hero if the available width permits.
* Display two service cards per row.
* Reduce section padding.
* Adjust heading sizes.
* Use two-column layouts for the about and contact sections.

## 16.3 Desktop layout

At approximately 1024 pixels and above:

* Use a centered content container.
* Display the full navigation.
* Use the asymmetrical hero layout.
* Give the portfolio more breathing room.
* Use wider editorial sections.
* Introduce larger typography where the content benefits from it.

Use fluid typography with `clamp()`.

For example:

```css
.hero-title {
  font-size: clamp(2.8rem, 6vw, 5.5rem);
  line-height: 0.98;
  letter-spacing: -0.035em;
}
```

Test the design at 320, 375, 430, 768, 1024, 1440, and 1920 pixels.

---

# 17. Technical implementation architecture

## 17.1 Single-file requirement

The website should have one primary HTML document:

`index.html`

Inside it:

* Metadata and external font links go in `<head>`.
* Semantic page structure goes in `<body>`.
* Global CSS and component styles go in a `<style>` block.
* JavaScript functionality goes in a script block or module.
* CDN dependencies are loaded only where necessary.

The image files should remain external assets rather than being embedded as large base64 strings.

This makes the project easier to edit, deploy, and maintain.

## 17.2 Suggested HTML structure

```html
<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <!-- Metadata -->
  <!-- SEO -->
  <!-- Open Graph -->
  <!-- Fonts -->
  <!-- Optional icon library -->
  <!-- Main CSS -->
</head>

<body>
  <header>
    <!-- Announcement bar -->
    <!-- Navigation -->
  </header>

  <main>
    <section id="home">
      <!-- Hero -->
    </section>

    <section id="about">
      <!-- Brand introduction -->
    </section>

    <section id="services">
      <!-- Service cards -->
    </section>

    <section id="featured">
      <!-- Featured promotion -->
    </section>

    <section id="portfolio">
      <!-- Gallery -->
    </section>

    <section id="experience">
      <!-- Client journey -->
    </section>

    <section id="philosophy">
      <!-- Brand philosophy -->
    </section>

    <section id="faq">
      <!-- FAQ -->
    </section>

    <section id="contact">
      <!-- Contact and booking -->
    </section>
  </main>

  <footer>
    <!-- Footer -->
  </footer>

  <!-- Optional floating WhatsApp CTA -->
  <!-- JavaScript -->
</body>
</html>
```

The final HTML should use semantic landmarks and avoid unnecessary nested containers.

## 17.3 JavaScript modules within the page

Even when all JavaScript is in one file, separate its responsibilities logically.

Recommended responsibilities:

* `initNavigation()`
* `initScrollAnimations()`
* `initGallery()`
* `initFaq()`
* `initBookingForm()`
* `initBackToTop()`
* `initFooterYear()`

These are suggested function names, not external dependencies.

Use event delegation where appropriate and clean up event listeners if components are initialized more than once.

## 17.4 Hosting

The site can be hosted on GitHub Pages, Vercel, or another static hosting provider.

For this profile, a static deployment is sufficient unless backend features are introduced later.

No database is necessary for the initial version.

No authentication system is necessary.

No serverless API is necessary for a basic WhatsApp-based enquiry journey.

This keeps the initial project inexpensive and reduces operational complexity.

---

# 18. SEO and social sharing

The website should be optimized for people searching for the business and its makeup services.

## 18.1 Page title

Recommended:

**The Nonty Experience | Makeup & Beauty**

## 18.2 Meta description

Suggested copy:

> Discover The Nonty Experience, offering natural makeup, soft glam, full-face makeup, and beauty services. Enquire about your desired look on WhatsApp.

This description should be revised if the business's actual service area or offering differs from the proposed positioning.

## 18.3 Metadata

Include:

* Character encoding.
* Responsive viewport.
* Page title.
* Meta description.
* Canonical URL once the final domain is known.
* Open Graph title.
* Open Graph description.
* Open Graph image.
* Theme colour.
* Favicon references.

Do not invent a domain for the business profile. Add the canonical URL after the website address is confirmed.

## 18.4 Search optimization

Naturally incorporate relevant terms into headings and body copy.

Potential keywords include:

* The Nonty Experience.
* Makeup services.
* Natural makeup.
* Soft glam makeup.
* Full-face makeup.
* Eyebrow services.
* Eyelash services.

If the business serves a particular city or area, include that location only after it has been confirmed.

Avoid repeating keywords unnaturally.

## 18.5 Structured data

If the business's name, contact details, and services are confirmed, add appropriate `BeautySalon` or `LocalBusiness` structured data, selecting the type that accurately describes the business.

Include only information supported by the actual business details.

Do not add fabricated ratings, reviews, business hours, addresses, or geographic coordinates.

## 18.6 Social sharing

Create an Open Graph image featuring:

* The Nonty Experience logo.
* A strong makeup portrait.
* The tagline, if desired.
* A restrained dusty-rose background.
* Clear, legible typography.

Recommended dimensions: 1200 × 630 pixels.

The same image can be used when the website is shared on WhatsApp and other platforms that support Open Graph previews.

---

# 19. Accessibility and usability requirements

A premium website should also be usable by people with different abilities and browsing preferences.

The implementation should include:

* Semantic HTML.
* Proper heading hierarchy.
* Keyboard-accessible navigation.
* Visible focus states.
* Accessible labels for form controls.
* Descriptive image alternatives.
* Sufficient colour contrast.
* Reduced-motion support.
* Meaningful button labels.
* Proper modal focus management.
* Correct handling of Escape and arrow keys in the gallery.
* No information communicated through colour alone.

Target **WCAG 2.2 Level AA** as the accessibility benchmark.

For mobile usability, maintain sufficiently large touch targets and avoid placing essential controls too close together.

The booking process should remain understandable without animations.

---

# 20. Performance and security

## 20.1 Performance targets

Use these as project acceptance targets rather than guaranteed results.

| Metric                          | Target                   |
| ------------------------------- | ------------------------ |
| Largest Contentful Paint (LCP)  | 2.5 seconds or less      |
| Interaction to Next Paint (INP) | 200 milliseconds or less |
| Cumulative Layout Shift (CLS)   | 0.1 or less              |
| Lighthouse performance          | Aim for 90+              |
| Lighthouse accessibility        | Aim for 95+              |
| Lighthouse SEO                  | Aim for 95+              |

Measure the deployed site under realistic mobile conditions.

Image-heavy pages may require additional optimization to achieve these targets.

## 20.2 Optimization measures

* Compress portfolio images.
* Load below-the-fold images lazily.
* Avoid unnecessary JavaScript libraries.
* Minimize render-blocking resources.
* Reserve image dimensions.
* Avoid autoplay video in the hero.
* Use efficient CSS selectors.
* Avoid continuous JavaScript animation loops.
* Keep font weights limited.
* Test on mid-range mobile devices.

## 20.3 Security

* Use HTTPS.
* Avoid collecting unnecessary personal information.
* Do not expose API keys in client-side code.
* Encode generated WhatsApp messages.
* Use safe DOM manipulation.
* Sanitize any future user-generated content.
* Include appropriate `rel` attributes on external links.
* Add a Content Security Policy where practical, accounting for the chosen CDNs and inline code.
* Keep third-party dependencies to a minimum.

If a backend contact form is added later, implement server-side validation, abuse prevention, and appropriate data-retention controls.

---

# 21. Recommended user journey

The website should optimize the path from discovery to enquiry.

### Journey A: Visitor from Instagram or WhatsApp

1. Opens the website on a mobile phone.
2. Immediately sees the brand and a strong makeup photograph.
3. Reads the short introduction.
4. Opens the services section.
5. Selects a desired service.
6. Clicks the enquiry button.
7. WhatsApp opens with the selected service included in the message.
8. The visitor reviews and sends the enquiry.

### Journey B: Visitor comparing makeup services

1. Opens the website.
2. Reads about the brand's philosophy.
3. Reviews service descriptions and prices.
4. Looks through the portfolio.
5. Checks the FAQ.
6. Opens the contact section.
7. Calls, emails, or sends a WhatsApp enquiry.

### Journey C: Returning visitor

1. Opens the website.
2. Uses the sticky navigation to jump directly to services or contact.
3. Selects a service.
4. Enquires without having to navigate the entire page.

Every journey should have an obvious next step without repeatedly interrupting the visitor.

---

# 22. Final content and asset checklist

Before implementation, organize the available material.

| Asset or information   | Status                | Required action                                                             |
| ---------------------- | --------------------- | --------------------------------------------------------------------------- |
| Existing brand logo    | Visible in brochure   | Obtain the original high-resolution file                                    |
| Brand colour direction | Available in brochure | Refine into the website design system                                       |
| Brand philosophy       | Available in brochure | Edit for web readability while preserving meaning                           |
| Service names          | Available in brochure | Preserve the existing categories                                            |
| Service prices         | Available in brochure | Confirm current prices before publishing                                    |
| Promotional price      | Available in brochure | Confirm that the promotion is still valid                                   |
| Updated phone number   | Supplied              | Use 0813864024                                                              |
| Updated email          | Supplied              | Use [nonty@re-el.co.za](mailto:nonty@re-el.co.za)                           |
| Client photographs     | Visible in brochure   | Obtain the original image files and confirm publication rights              |
| Social media profiles  | Not supplied          | Add verified links when available                                           |
| Business location      | Not supplied          | Add only if the business wishes to publish it                               |
| Booking policies       | Not supplied          | Confirm deposits, cancellations, timing, and other terms before publication |
| Domain                 | Not supplied          | Configure canonical metadata after confirmation                             |
| Contact form delivery  | Not configured        | Start with WhatsApp-based enquiries or configure a backend if needed        |

---

# 23. Final design recommendation

The strongest version of The Nonty Experience website should have these defining characteristics:

**Visual identity:** Dusty rose, black, pale pink, elegant serif typography, and authentic beauty photography.

**Hero:** A powerful makeup portrait beside a clear, editorial headline and direct booking CTA.

**Services:** A polished, responsive service grid that communicates the offerings and confirmed prices.

**Portfolio:** A carefully curated gallery that demonstrates actual makeup work.

**Motion:** Restrained image reveals, staggered section animations, subtle hover effects, and smooth navigation transitions.

**Conversion:** WhatsApp, telephone, and email links supported by a clear booking-enquiry process.

**Technical architecture:** A single `index.html` using HTML5, CSS3, and vanilla JavaScript, with only the necessary external libraries.

**Performance:** Optimized images, responsive layouts, minimal dependencies, and reduced-motion support.

**Brand positioning:** A beauty experience centered on individuality, artistic expression, and the celebration of each client's natural features.

The result should feel like a professionally art-directed beauty brand rather than a conventional small-business template.

**The most important implementation principle is to let the photography, typography, and brand philosophy create the luxury experience.** Animations and decorative effects should support those elements, not compete with them.
