Welcome to Discord Sharing Tool (name not final)

To Install:
  - Unzip the "Send to Discord.zip" file or clone the repository somewhere on your computer
  - Open up Google Chrome and enter "chrome://extensions" in the address bar
  - Enable Developer Mode
  - Click the "Load unpacked" button
  - Open the folder with the unzipped contents of the "Send to Discord.zip" file or the cloned repository
  - Ensure the extension is enabled

How to use:
  - Contact an admin on a Discord server you would like to share content to and ask for a webhook url
  - For server admins, you can find instructions on creating a webhook here: https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks
  - After obtaining a webhook url, click the DST icon in your menu bar to open the DST menu
  - In the menu there are 4 text fields:
    - Webhook Name: The name the webhook will appear as in the DST menu and your right-click context menu
    - Webhook URL: The link to the server where your content will be shared to, that you obtained from an admin
    - Username on Server: The username the webhook will post as on the discord server, if blank the default username created by admin will be used
    - Webhook avatar URL: The avatar the webhook will use when it posts, must be hosted online, if blank, the default image created by admin will be used
  - After setting these fields, click "Add new webhook"

Now when browsing in Chrome, right-click links, images, highlighted text, or a page and open the "Send to Discord" context menu item to send the content you right-clicked to any of the webhooks you registered. 


The tool was designed for use with Discord webhooks, I have yet to test it with other services with webhook support like Slack. 
For reference, the HTTP Post requests have a format like so:


Header:
  "Content-Type": "application/json"

Body:
  "content": [Link to content that you right-clcked]
  "username": [Username you added to the webhook]
  "avatar_url": [Url of avatar you added to the webhook]
