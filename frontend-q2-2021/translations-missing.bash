#!/usr/bin/env bash

# SAMPLE OUTPUT of "report"
# missing keys:
# ┌─────────┬──────────────────┬──────┬────────────────────────┬──────────┐
# │ (index) │       path       │ line │          file          │ language │
# ├─────────┼──────────────────┼──────┼────────────────────────┼──────────┤
# │    0    │     'E-Mail'     │  26  │ '/src/pages/Login.vue' │ 'de-DE'  │
# └─────────┴──────────────────┴──────┴────────────────────────┴──────────┘
# unused keys:
# ┌─────────┬──────┬───────────┬────────────────────────┬──────────┐
# │ (index) │ line │   path    │          file          │ language │
# ├─────────┼──────┼───────────┼────────────────────────┼──────────┤
# │    0    │  0   │ 'E-Mails' │ '/src/i18n/en-US.json' │ 'en-US'  │
# └─────────┴──────┴───────────┴────────────────────────┴──────────┘
report=$(LINT='true' npm run translations-fetch);

# sed command removes everything after "unused keys", i.e. the unused keys table table
report=$(echo "$report" | sed '/unused keys:/q');

# we can now check if there is a `0` in report, (i.e. in index column)
echo "$report" | grep '  0  ' > /dev/null;
hasMissingKeys="$?"; # grep returns 0 if there IS a match

if [ "$hasMissingKeys" -eq 0 ]; then
  echo 'There are unfetched translation keys, please run "npm run translations-fetch"'
  exit 1;
fi
