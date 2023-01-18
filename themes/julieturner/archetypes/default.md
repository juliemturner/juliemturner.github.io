---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
tags: 
  - Microsoft 365
bigimg: [{src: "header.jpeg", desc: ""}]
description:     # (string) The description for the content.
summary:         # (string) Used when providing a summary of the article.
publishDate:     # (timestamp) If in the future, content will not be rendered.
expiryDate:      # (timestamp) The datetime at which the content no longer be published.
SEO:             # override the `title` & `description` front matter in the site
  title:         # target length: 50-60 characters
  description:   # target length: 110-160 characters
  canonical:     # target URL (this is) page is a dupe of another page
noSearch: false
noSitemap: false
series:          # (array) Series page belongs.
---