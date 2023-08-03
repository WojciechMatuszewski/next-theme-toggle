# Theme toggle for Next.js

## Learnings

- The main issue with these type of components is the _flicker_ that occurs when landing on the page.

  - This is because, by default, Next.js will either pre-render the page or render it on the server. On the server, we do not have a great way to know the user preference (more on that later).

- There are different techniques of solving the flicker, depending on the routing model (are we using `pages` or `app` directories).

### The `pages` directory

There are various ways to go about this problem, but I found the "custom script in the `_document` file" the most straightforward.

To prevent the flicker of styles, we are going to inject a script before as the first element of the `body`. This script will set the initial theme on the body. After that, in our component, we can read from the body and hydrate the client state.

```tsx
import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function MyDocument() {
    const setInitialThemeScript = `
        function getUserPreference() {
            if (window.localStorage.getItem('theme')) {
                return window.localStorage.getItem('theme')
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }

        const theme = getUserPreference();
        document.documentElement.setAttribute('data-theme', theme);
    `
    return (
        <Html lang="en">
            <Head />
            <body>
                <Script
                    id="theme-script"
                    // Quite important line below 👇
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{ __html: setInitialThemeScript }} />
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
```

I like the idea of using the `data-*` attributes for themes, so I used one here. The **most crucial thing is the value of the `strategy` prop provided to the `Script` component**. The `beforeInteractive` will guarantee that the script is loaded as soon as possible.

Another thing to watch out for is the fact that, **when using the `beforeInteractive` strategy, the `document.body` will not be defined when the script runs**. This forced me to define the `theme` attribute on the `html` rather than on the `body` tag.

---

Of course, this solution will **not work for the initial HTML payload**. If you go to the network tab and inspect the request, you will see a page with a white background. Your scripts will not run during SSR or static page generation. For that, there are various Next.js-specific functions like `getServerSideProps` or `getStaticProps`, but in those, you do not have access to `window` or `localStorage`.

In that case, your best bet is to use cookies set by the client, though it might be hard to retrieve the cookies in the `_document` file where you have access to the `HTML` tag (I could not find a reasonable way to do this, though I did look that hard).

### The `app` directory

Here, we can perform the same trick with the script, but **I found that using the `Script` component will not work**.

- The linter complains about using the `Script` with `strategy="beforeInteractive"` in the _root layout_ component.

  - [This is in contrast to the documentation](https://nextjs.org/docs/app/api-reference/components/script#beforeinteractive).

- Even if I ignore the linter warning, the application threw a hydration error.

- I could use other `strategy` (even the default one), but that causes flicker.

Instead of using the `Script` component, one could use a regular `script` tag. That works as one would expect.

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const setInitialThemeScript = `
    function getUserPreference() {
        if (window.localStorage.getItem('theme')) {
            return window.localStorage.getItem('theme')
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const theme = getUserPreference();
    document.documentElement.setAttribute('data-theme', theme);
`

  return (
    <html lang="en">
      <body className={inter.className}>
        <script id="app-directory-theme-script" dangerouslySetInnerHTML={{ __html: setInitialThemeScript }} />
        {children}
      </body>
    </html>
  )
}
```

#### Note about `cookies` in RSCs

One neat thing about RSCs is that we can take advantage of the `cookies` API. This could allow us to to set the `data-theme` on the `html` tag instantly on the RSC instead via the script. The caveat is that we cannot possibly know the `theme` value on the initial RSC load. The client must set the cookie first.

All in all, the `cookie` method will not get us any additional benefit. Yes, the returned HTML will already contain the `data-theme` attribute on the `html` tag, but, to my best knowledge, that does not win us anything.

## The bottom line

According to what I read on the internet, the consensus seem to be that injecting a small script before other JS loads is the way to go. This technique is also used by a quite popular [next-themes](https://github.com/pacocoursey/next-themes) library.
