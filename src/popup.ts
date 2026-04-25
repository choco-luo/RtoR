type RedirectEnabledResponse = {
  enabled: boolean;
};

type SetRedirectEnabledResponse = {
  ok: boolean;
};

const toggleElement = document.querySelector<HTMLInputElement>("#redirectToggle");
const statusTextElement = document.querySelector<HTMLElement>("#statusText");

if (!toggleElement || !statusTextElement) {
  throw new Error("Popup UI elements are missing.");
}

const toggle = toggleElement;
const statusText = statusTextElement;

function updateStatus(enabled: boolean): void {
  statusText.textContent = enabled
    ? "啟用中：會將 www.xiaohongshu.com 轉址到 www.rednote.com"
    : "已停用：不會做任何轉址";
}

async function syncFromBackground(): Promise<void> {
  const response = (await chrome.runtime.sendMessage({
    type: "GET_REDIRECT_ENABLED"
  })) as RedirectEnabledResponse;
  const enabled = response?.enabled !== false;
  toggle.checked = enabled;
  updateStatus(enabled);
}

toggle.addEventListener("change", async () => {
  const enabled = toggle.checked;
  const response = (await chrome.runtime.sendMessage({
    type: "SET_REDIRECT_ENABLED",
    enabled
  })) as SetRedirectEnabledResponse;

  if (!response?.ok) {
    toggle.checked = !enabled;
    updateStatus(!enabled);
    return;
  }

  updateStatus(enabled);
});

syncFromBackground().catch(console.error);
