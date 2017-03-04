import os
import re
import email
import codecs
import getpass
import imaplib
import MySQLdb

from BeautifulSoup import BeautifulSoup

user = 'ci_intarcia@d3analytics.com'
pwd = 'Dcube@2017'

con = MySQLdb.connect(db          = 'dcube',
                      user        = 'root',
                      passwd      = 'root',
                      charset     = "utf8",
                      host        = 'localhost',
                      use_unicode = True)
cur = con.cursor()

m = imaplib.IMAP4_SSL("imap.gmail.com")
m.login(user,pwd)
m.select('INBOX')

resp, items = m.search(None, "ALL")
items = items[0].split()
cur_dir = os.getcwd()

for emailid in items:
    resp, data = m.fetch(emailid, "(RFC822)")
    email_body = data[0][1]
    mail = email.message_from_string(email_body)
    sub = mail['Subject']
    date = mail['Date'].replace('+0530', '').strip()
    if 'Fwd' in sub:
        filename = sub.strip().replace('+', '') + '.doc'
        filename = filename.replace('=E2=80=9C', '').replace('?utf8?Q?', '')\
            .replace('=?utf8?Q?', '').replace('?=??_=?utf8?Q?=E2=80=9D', '')
        filename = filename.replace('/', '').replace('-', '').replace(':', '').replace('=', '')
        filebody = ''.join(re.findall('Hi Anshuman,(.*)Access the map at https://www.fenixpharma.com/', email_body.replace('\r', '').replace('\n', '')))

        filename = filename.replace('?utf8?Q?', '').replace('\r', '')\
            .replace('\n', '').lstrip('Fwd_').strip()
        print filename
        if not os.path.exists('reports'):
            os.makedirs('reports')
        os.chdir('reports')
        filebody = BeautifulSoup(filebody).text.replace('=20>', '\n')\
            .replace('>', '\n').replace('=', '')
        with open(filename, 'wb') as filename:
            filename.write(filebody)
        os.chdir(cur_dir)

    if mail.get_content_maintype() != 'multipart':
        continue

cur.close()
con.close()
