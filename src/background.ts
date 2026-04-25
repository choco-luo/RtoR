const REDIRECT_RULE_ID = 1;
const REDIRECT_ENABLED_KEY = "redirectEnabled";

const redirectRule: chrome.declarativeNetRequest.Rule = {
  id: REDIRECT_RULE_ID,
  priority: 1,
  action: {
    type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
    redirect: {
      transform: {
        host: "www.rednote.com"
      }
    }
  },
  condition: {
    urlFilter: "||www.xiaohongshu.com/",
    resourceTypes: [
      chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
    ]
  }
};

async function setupRedirectRule(): Promise<void> {
  const { [REDIRECT_ENABLED_KEY]: storedEnabled } = await chrome.storage.sync.get(
    REDIRECT_ENABLED_KEY
  );
  const redirectEnabled = storedEnabled !== false;

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [REDIRECT_RULE_ID],
    addRules: redirectEnabled ? [redirectRule] : []
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync
    .get(REDIRECT_ENABLED_KEY)
    .then((result) => {
      if (typeof result[REDIRECT_ENABLED_KEY] !== "boolean") {
        return chrome.storage.sync.set({ [REDIRECT_ENABLED_KEY]: true });
      }
      return Promise.resolve();
    })
    .then(() => setupRedirectRule())
    .catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  setupRedirectRule().catch(console.error);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "SET_REDIRECT_ENABLED" && typeof message.enabled === "boolean") {
    chrome.storage.sync
      .set({ [REDIRECT_ENABLED_KEY]: message.enabled })
      .then(() => setupRedirectRule())
      .then(() => sendResponse({ ok: true }))
      .catch((error) => {
        console.error(error);
        sendResponse({ ok: false });
      });
    return true;
  }

  if (message?.type === "GET_REDIRECT_ENABLED") {
    chrome.storage.sync
      .get(REDIRECT_ENABLED_KEY)
      .then((result) => {
        sendResponse({ enabled: result[REDIRECT_ENABLED_KEY] !== false });
      })
      .catch((error) => {
        console.error(error);
        sendResponse({ enabled: true });
      });
    return true;
  }

  return false;
});
