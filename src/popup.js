const containerSites = document.getElementById("container-sites");
const inputContainer = document.getElementById("input-container");
const [URLInput, shortcutInput] = [...inputContainer.children];
let pages = [];
let userDefinedSites = [];
let state = {
  index: -1,
  status: "ADDING",
};

browser.storage.local.get(["userDefinedSites", "pages"]).then((data) => {
  pages = data.pages || [];
  userDefinedSites = data.userDefinedSites || [];

  document.dispatchEvent(new Event("defined-sites-change", { bubbles: true }));
});

containerSites.addEventListener("click", (e) => {
  const btnEdit = e.target.closest(".edit");
  console.log(btnEdit, "edit");
  if (!btnEdit) return;

  const [url, shortcut] = [...btnEdit.parentElement.children].map(
    (el) => el.innerText,
  );
  console.log([...btnEdit.parentElement.children]);
  console.log({ url, shortcut });
  URLInput.value = url;
  shortcutInput.value = shortcut;
  state.index = pages.findIndex((page, i) => {
    return page === url;
  });
  console.log({ state, url }, pages);
  state.status = "EDITING";
});

containerSites.addEventListener("click", (e) => {
  const btnDelete = e.target.closest(".eliminar");
  console.log(btnDelete, "here");
  if (!btnDelete) return;

  const [url, shortcut] = [...btnDelete.parentElement.children].map(
    (el) => el.innerText,
  );
  const index = pages.findIndex((page, i) => {
    return page === url;
  });
  pages.splice(index, 1);
  userDefinedSites.splice(index, 1);

  browser.commands.update({
    name: `open-url-${index + 1}`,
    shortcut,
    description: "Open a especific URL",
  });
  browser.storage.local.set({ userDefinedSites, pages });
  document.dispatchEvent(new Event("defined-sites-change", { bubbles: true }));
});

inputContainer.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (!URLInput.value || !shortcutInput.value) return;
  const [url, shortcut] = [URLInput.value, shortcutInput.value];

  if (state.status === "EDITING") {
    pages[state.index] = url;
    userDefinedSites[state.index] = { url, shortcut };
    browser.commands.update({
      name: `open-url-${state.index + 1}`,
      shortcut,
      description: `Open ${url}`,
    });
  } else {
    browser.commands.update({
      name: `open-url-${userDefinedSites.length + 1}`,
      shortcut,
      description: `Open ${url}`,
    });

    userDefinedSites.push({ url, shortcut });
    pages.push(url);
  }

  browser.storage.local.set({ userDefinedSites, pages });

  document.dispatchEvent(new Event("defined-sites-change", { bubbles: true }));
  URLInput.value = "";
  shortcutInput.value = "";
});

document.addEventListener("defined-sites-change", (e) => {
  containerSites.innerHTML = "";
  console.log({ userDefinedSites });
  const html = userDefinedSites
    .map(
      ({ url, shortcut }) =>
        `<div class="flex gap-2">
          <div>${url}</div>
          <div>${shortcut}</div>
          <button class="edit px-2 py-1 bg-black text-white hover-bg-white hover-text-black">edit</button>
          <button class="eliminar px-2 py-1 bg-black text-white hover-bg-dark">delete</button>
        </div>`,
    )
    .join("\n");

  containerSites.innerHTML = html;
});
