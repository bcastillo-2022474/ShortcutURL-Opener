console.log("WORKING");
async function lol() {
  console.log("WAITING");
}

lol();

browser.commands.onCommand.addListener((command) => {
  console.log({ command });
  if (!command.startsWith("open-url")) return;
  async function fun() {
    const { pages } = await browser.storage.local.get([
      "userDefinedSites",
      "pages",
    ]);
    if (!pages) {
      // do default action of shortcut
      return;
    }
    console.log(pages);

    const tabs = await browser.tabs.query({ currentWindow: true });
    pages.forEach((page, i) => {
      if (command !== `open-url-${i + 1}`) return;
      // browser.tabs.update(tab.id, { active: true });
      const tab = tabs.find((tab) => tab.url.startsWith(page));
      if (!tab) {
        browser.tabs.create({ url: page });
        return;
      }
      browser.tabs.update(tab.id, { active: true });
    });
  }

  fun();
});
