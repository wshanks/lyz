#!/bin/bash

cd ~/Documents/Writing/Coding/Java/Zotero/lyz
pandoc -f markdown_strict -t html README.md > ./Extra/README.html
python ~/Documents/Writing/Coding/Java/Zotero/lyz/Extra/AMO_README.py
