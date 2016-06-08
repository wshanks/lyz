#! /usr/local/bin/python

# Save an html version of Zutilo's readme without <p> flags and with
# <h#> flags changed to <strong>
import re

fin = open('/home/wshanks/Documents/Writing/Coding/Java/Zotero/lyz/Extra/README.html','r')
fout = open('/home/wshanks/Documents/Writing/Coding/Java/Zotero/lyz/Extra/AMO_README.txt','w')

fullhtml = fin.read()

scrubbedhtml = re.sub('<p>|</p>','',fullhtml)
scrubbedhtml = re.sub('<pre>|</pre>','',scrubbedhtml)
scrubbedhtml = re.sub('h[1-9]>','strong>',scrubbedhtml)

fout.write(scrubbedhtml)

