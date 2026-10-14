<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve TanStack Start/Vite bootstrap; Classoni's twelve client-only screens are state-driven within ClassoniApp mounted by the index route, because the managed router must stay intact.
- Define Classoni's semantic Tailwind v4 colors in the existing global stylesheet, because this project does not use Tailwind v3 configuration.
- Keep the prototype's lesson, feedback, profile, class and payment actions client-only and explicitly mock; do not imply transactions or persistent accounts exist.
- PWA support is manifest-only; no offline caching worker, to keep previews and deployed updates fresh.
