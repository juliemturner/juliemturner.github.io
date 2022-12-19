---
title: "{{ replace .Name "-" " " | title }}"
# linkTitle:       # (string) Used for creating links to content; if set, Hugo defaults to using the `linktitle` before the `title`.
# description:     # (string) The description for the content.
# summary:         # (string) Used when providing a summary of the article.
date: {{ .Date }}
# lastmod:         # (timestamp) when the page was last updated (defaults to git timestamp, but setting this overrides it)
# publishDate:     # (timestamp) If in the future, content will not be rendered.
# expiryDate:      # (timestamp) The datetime at which the content no longer be published.
draft: false
# SEO:             # override the `title` & `description` front matter in the site
#   title:         # target length: 50-60 characters
#   description:   # target length: 110-160 characters
#   canonical:     # target URL (this is) page is a dupe of another page
noSearch: false
noSitemap: false
# series:          # (array) Series page belongs.
tags:
# aliases:         # (array) One or more aliases that will be created in the output directory structure.
---