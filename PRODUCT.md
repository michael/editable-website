# Why Editable?

Editable is a Svelte website template with an editor built into its pages. Site owners edit the actual layout in the browser, while the content model, components, and styling stay in the codebase they own. There is no separate CMS to model, connect, preview, or keep in sync.

Start with the included site, change its colors and type, or build custom components and content types. Editable is for people who want a website they can operate themselves and extend with ordinary Svelte code when it needs to grow.

The same idea matters to different people for different reasons.

## For developers

You know the usual arrangement. First you model the content in a CMS. Then you build the real website somewhere else. Then you connect the two, add a preview mode, explain to the client why the preview is slightly different, and spend an afternoon discovering that someone entered a headline long enough to become a paragraph.

Editable removes that seam. A Svelte component is both the public website and the editing surface. The schema says what the content may contain; the component says how it looks. When the owner edits a title, rearranges a section, or replaces an image, they do it inside the layout you built—not in a form that vaguely promises to become that layout later.

For a Svelte developer, very little of this feels foreign. Components are components. Styling is CSS. The content model is code. SQLite keeps the operational side pleasantly small. There is no proprietary theme language to learn and no plugin marketplace standing between you and a bug.

The independence matters too. A site is a repository you can understand, version, deploy, back up, and move. You can inspect the whole system rather than negotiate with a black box. Start with Editable's existing content types, replace them one by one, or invent your own. The point is not to avoid engineering; it is to spend the engineering on the site instead of on the glue around it.

If you enjoy building websites in Svelte and have ever thought, “I could make a better editing experience if the CMS would just get out of the way,” you are the obvious target group. You were probably going to open the source before finishing this paragraph anyway.

## For designers

Let us address the alarming part first: getting started requires a few commands. If you can copy four lines into a terminal without immediately closing the lid of your laptop, you are technical enough to try. Consider it a very small entrance exam, with unusually generous marking.

Once the site is running, the work becomes much more familiar. Change the typefaces. Adjust the colors. Paste in images. Drop in video. Move through the available layouts until the relationship between image, text, and space feels right. You are working with the finished page, at its real size, in the browser where it will actually live.

Editable is not a blank canvas in the Figma sense, and that is useful. The components already know how to behave responsively. Media already has sensible containers. Text remains editable text instead of becoming a collection of absolutely positioned rectangles. You can concentrate on rhythm, hierarchy, typography, and the assets themselves without first becoming responsible for every browser quirk accumulated since 1996.

For a portfolio, a small studio site, an exhibition page, or a visual archive, changing fonts, colors, media, and content may be all the customization you need. If it is not, the project has not trapped you. Bring in a Svelte developer for one new component or an ambitious layout, then carry on editing the result yourself. You do not have to choose between doing everything alone and handing the entire site away.

Editable can be a playground: constrained enough that the page keeps working, open enough that it still feels like yours.

## For creators

Creators are used to assembling their own tools. You learn the camera, the microphone, the newsletter software, the shop, the strange export setting that only matters once every six months. Running a few commands to start a website is not fundamentally different. It is another small piece of equipment.

The reward is a place that does not feel like filling in a website form. You open the page, put the content where it belongs, and see the result immediately. A new project can be an image, a short text, and a link. A longer story can grow into sections. Nothing needs to be translated from “CMS language” into the thing your audience sees.

More importantly, the site can grow without being replaced. Begin with the existing layouts and your own visual identity. If the work later needs a special archive, a release page, a membership area, or a wonderfully peculiar interactive object, a Svelte developer can add it to the project you already have. They are extending ordinary code, not trying to smuggle your idea through the customization panel of a hosted platform.

That is the useful version of DIY: you can operate the site yourself, understand where your content lives, and ask for specialist help exactly when it becomes worthwhile. Independence does not mean refusing help. It means the help leaves you with something you can continue to use.

## For agencies

Some websites need a novel interaction model, a WebGL landscape, and three months of prototyping. Editable is not trying to make those projects disappear.

Many agency projects are different. The concept is strong. The identity is excellent. The photography, films, typography, and writing do most of the emotional work. The implementation needs to present those assets with confidence, move cleanly between a handful of layouts, and avoid becoming the most interesting thing in the room.

Those projects are often rebuilt from the same invisible foundations: content modeling, image handling, responsive behavior, previews, deployment, backups, and a client editing experience. Editable gives you that foundation as a Svelte project instead of as a service you must design around. On the right project, removing that repeated work can make delivery feel an order of magnitude faster—not because the craft disappeared, but because more of the time goes into the part the client can actually see.

You can establish a house vocabulary of dependable components, then add the one or two custom pieces that make each project specific. A campaign may need a dramatic feature block. A cultural institution may need a restrained project index. A product studio may mostly need immaculate media. They can share infrastructure without looking as though they share a template.

Clients edit in place, so the relationship between an image, a headline, and the surrounding layout is visible while they work. That reduces training and prevents many content surprises. It also means the client is not bound to the agency for every correction. This is a feature, not lost revenue. You can still offer copy editing, art direction, maintenance, and new features; the difference is that the client asks because the support is valuable, not because only you know which field changes the sentence on the homepage.

Editable is especially compelling when the assets provide the wow and the website's job is to give them a very good stage.

## For artists

Posting work to Instagram is easy. Finding a specific project from four years ago is less easy. Explaining how it relates to the work before it, adding a proper video, linking to an exhibition, or correcting the crop without negotiating with an algorithm is where the arrangement starts to wobble.

An artist's website often has a simple job: hold the work, give each project enough context, and make the whole practice legible over time. Editable is unusually well suited to that job because adding to it feels close to posting. Paste an image or video onto the page. Write a short summary. Add a link. Choose the layout that suits the work. Save.

The difference is that the result is an archive rather than a feed. Projects can have their own place and remain findable. A film does not have to pretend to be a square image. A series can unfold in order. Older work does not sink into a column designed to keep people scrolling past it.

You can begin with a restrained site and let the art carry it. Customize the type and colors if you want to make the frame more personal. If the practice later calls for something special—a spatial index, an unusual sequence, a commission archive, a page that behaves like a score—a Svelte developer can build it into the same site. Until then, you can keep adding work without waiting for anyone.

It is the little archive you always wished you had, except this time adding the next project does not require a redesign.

## Try Editable

The best way to decide whether Editable fits your work is to try it on a real site idea. [Follow the quickstart in the manual](/manual#quickstart), run it locally, and start changing the page in front of you.

Editable works best for people who do not merely want access to a website. They want the website to remain theirs.
