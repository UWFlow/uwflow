# Pages

## Creating a new page

1. Create your page component under `pages/<your_page_name>/`

   - Perform any data fetching at the top level page component
   - Add other components as necessary

2. Add the page the `LoadableComponents.tsx` as a new loadable component

3. Add a new route for the page under `Routes.tsx`

4. Add the new page to `App.tsx` under the router
