/* eslint-disable prettier/prettier */

import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  Check,
  Settings,
  Hand,
  Zap,
  RefreshCw,
  Copy,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getOrCreateShortcutToken,
  regenerateShortcutToken,
  type ShortcutToken,
} from "@/services/shortcutTokenService";
import { requireIncompleteSetup } from "@/lib/routeGuards";

export const Route = createFileRoute("/shortcut-setup")({
  beforeLoad: requireIncompleteSetup,
  component: ShortcutSetup,
});

const iosSetupSteps = [
  {
    Icon: Zap,
    title: "Add Your Token to the Shortcut",
    desc: "Open the downloaded shortcut and enter your Street Smart token.",
  },
  {
    Icon: Settings,
    title: "Open iPhone Settings",
    desc: "Go to Settings → Accessibility → Touch.",
  },
  {
    Icon: Hand,
    title: "Enable Back Tap",
    desc: "Scroll down and select Back Tap.",
  },
  {
    Icon: Zap,
    title: "Assign Emergency Shortcut",
    desc: "Choose Triple Tap → Shortcuts → StreetSmart.",
  },
];

function getDeviceName() {
  const userAgent = navigator.userAgent;

  let device = "Desktop";

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    device = "iPhone/iPad";
  }

  let browser = "Browser";

  if (/Edg/i.test(userAgent)) {
    browser = "Edge";
  } else if (/Chrome/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Safari/i.test(userAgent)) {
    browser = "Safari";
  } else if (/Firefox/i.test(userAgent)) {
    browser = "Firefox";
  }

  return `${device} (${browser})`;
}

function ShortcutSetup() {
  const setupSteps = iosSetupSteps;

  const [completedSteps, setCompletedSteps] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  /*
   * Tracks whether the user has actually pressed
   * the Copy button.
   */
  const [hasCopiedToken, setHasCopiedToken] = useState(false);

  /*
   * Tracks whether the user has actually clicked
   * the Download Shortcut button.
   */
  const [hasDownloadedShortcut, setHasDownloadedShortcut] =
    useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const [shortcutToken, setShortcutToken] =
    useState<ShortcutToken | null>(null);

  const [loadingToken, setLoadingToken] = useState(true);

  const [generating, setGenerating] = useState(false);

  const [copied, setCopied] = useState(false);

  const allDone = completedSteps.every(Boolean);

  const deviceName = getDeviceName();

  useEffect(() => {
    async function loadToken() {
      try {
        const token = await getOrCreateShortcutToken(deviceName);

        setShortcutToken(token);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load shortcut.",
        );
      } finally {
        setLoadingToken(false);
      }
    }

    loadToken();
  }, [deviceName]);

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }

  /*
   * Handles checking/unchecking setup steps.
   *
   * Steps 1 and 2 are handled separately because
   * they require actual actions from the user.
   */
  function toggleStep(index: number) {
    /*
     * STEP 1
     *
     * Cannot be checked unless Copy has actually
     * been pressed.
     */
    if (index === 0) {
      if (!hasCopiedToken) {
        showMessage("Copy your token first.");
        return;
      }

      setCompletedSteps((prev) => {
        const updated = [...prev];

        updated[0] = !updated[0];

        /*
         * If Step 1 is unchecked, reset everything
         * after it.
         */
        if (!updated[0]) {
          for (let i = 1; i < updated.length; i++) {
            updated[i] = false;
          }

          setHasDownloadedShortcut(false);
        }

        return updated;
      });

      return;
    }

    /*
     * STEP 2
     *
     * Requires the shortcut to have been downloaded.
     */
    if (index === 1) {
      if (!completedSteps[0]) {
        showMessage("Copy your token first.");
        return;
      }

      if (!hasDownloadedShortcut) {
        showMessage("Download the shortcut first.");
        return;
      }

      setCompletedSteps((prev) => {
        const updated = [...prev];

        updated[1] = !updated[1];

        /*
         * If Step 2 is unchecked, reset Steps 3–6.
         */
        if (!updated[1]) {
          for (let i = 2; i < updated.length; i++) {
            updated[i] = false;
          }
        }

        return updated;
      });

      return;
    }

    /*
     * STEPS 3–6
     *
     * These require the previous step to be complete.
     */
    if (!completedSteps[index - 1]) {
      showMessage("Complete the previous step first.");
      return;
    }

    setCompletedSteps((prev) => {
      const updated = [...prev];

      updated[index] = !updated[index];

      /*
       * If a step is unchecked, reset all
       * following steps.
       */
      if (!updated[index]) {
        for (let i = index + 1; i < updated.length; i++) {
          updated[i] = false;
        }
      }

      return updated;
    });
  }

  /*
   * Copy the user's shortcut token.
   *
   * This action also unlocks the Step 1 checkbox.
   */
  async function handleCopyToken() {
    if (!shortcutToken?.token) {
      showMessage("No shortcut token available.");
      return;
    }

    const token = shortcutToken.token;

    try {
      /*
       * First try the modern Clipboard API.
       */
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(token);

        setCopied(true);
        setHasCopiedToken(true);

        showMessage("Token copied to clipboard.");

        setTimeout(() => {
          setCopied(false);
        }, 2000);

        return;
      }

      /*
       * Fallback for browsers/environments where
       * navigator.clipboard is unavailable.
       */
      const textArea = document.createElement("textarea");

      textArea.value = token;

      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");

      document.body.removeChild(textArea);

      if (!successful) {
        throw new Error("Copy command failed");
      }

      setCopied(true);
      setHasCopiedToken(true);

      showMessage("Token copied to clipboard.");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);

      showMessage(
        "Could not copy automatically. Please copy the token manually.",
      );
    }
  }

  /*
   * Download the iOS shortcut.
   */
  function handleDownloadShortcut() {
    if (!completedSteps[0]) {
      showMessage("Copy your token first.");
      return;
    }

    setHasDownloadedShortcut(true);

    showMessage("Shortcut download started.");
  }

  /*
   * Generate a new shortcut token.
   *
   * A new token invalidates the old one, so the
   * entire setup process must be completed again.
   */
  async function handleGenerateToken() {
    try {
      setGenerating(true);

      const newToken =
        await regenerateShortcutToken(deviceName);

      setShortcutToken(newToken);

      /*
       * Reset copy/download tracking.
       */
      setHasCopiedToken(false);
      setHasDownloadedShortcut(false);
      setCopied(false);

      /*
       * Reset all setup steps.
       */
      setCompletedSteps([
        false,
        false,
        false,
        false,
        false,
        false,
      ]);

      showMessage(
        "New token generated. Copy the new token to your shortcut.",
      );
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Failed to generate new token.",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <MobileShell>
      <ScreenHeader
        title="Triple Tap Setup"
        back="/setup"
      />

      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        <p className="text-sm text-muted-foreground">
          Follow these steps to enable the emergency shortcut on
          your iPhone.
        </p>

        <p className="text-sm text-primary font-medium mt-3">
          WARNING: This system will not function properly until you
          complete all the steps.
        </p>

        {message && (
          <div className="mt-4 text-sm text-warning font-medium">
            {message}
          </div>
        )}

        {/* =========================================================
            STEP 1 — COPY TOKEN
        ========================================================= */}

        <div className="mt-6 bg-card border border-border rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                completedSteps[0]
                  ? "bg-success/15 text-success"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Copy className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="text-[11px] font-semibold text-muted-foreground">
                STEP 1
              </div>

              <h3 className="font-semibold text-sm">
                Copy Your Shortcut Token
              </h3>

              <p className="text-xs text-muted-foreground mt-0.5">
                You will enter this token into the downloaded
                shortcut.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyToken}
              disabled={
                loadingToken || !shortcutToken?.token
              }
              className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {loadingToken ? (
            <p className="text-sm text-muted-foreground mt-4">
              Loading token...
            </p>
          ) : (
            <>
              <div className="mt-4 bg-secondary rounded-xl p-3">
                <p className="text-[11px] text-muted-foreground mb-1">
                  YOUR TOKEN
                </p>

                <p className="text-sm font-mono font-medium break-all">
                  {shortcutToken?.token}
                </p>
              </div>

              <div className="mt-3 rounded-xl bg-primary/10 border border-primary/20 p-3">
                <p className="text-xs font-semibold text-primary">
                  Do not share this token
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Keep this token private. Do not share it with
                  anyone. If you believe your token has been exposed,
                  generate a new one.
                </p>
              </div>

              <label
                className={`mt-4 flex items-center gap-3 ${
                  hasCopiedToken
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
                }`}
              >
                <input
                  type="checkbox"
                  checked={completedSteps[0]}
                  disabled={!hasCopiedToken}
                  onChange={() => toggleStep(0)}
                  className="w-4 h-4 accent-primary disabled:opacity-50"
                />

                <span
                  className={`text-sm font-medium ${
                    !hasCopiedToken
                      ? "text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  I have copied my token
                </span>

                {completedSteps[0] && (
                  <Check
                    className="w-4 h-4 text-success ml-auto"
                    strokeWidth={3}
                  />
                )}
              </label>

              {!hasCopiedToken && (
                <p className="text-[11px] text-muted-foreground mt-2 ml-7">
                  Press "Copy" before checking this step.
                </p>
              )}
            </>
          )}
        </div>

        {/* =========================================================
            STEP 2 — DOWNLOAD SHORTCUT
        ========================================================= */}

        <div
          className={`mt-3 bg-card border border-border rounded-2xl p-4 shadow-card transition-opacity ${
            !completedSteps[0] ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                completedSteps[1]
                  ? "bg-success/15 text-success"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Download className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="text-[11px] font-semibold text-muted-foreground">
                STEP 2
              </div>

              <h3 className="font-semibold text-sm">
                Download the Shortcut
              </h3>

              <p className="text-xs text-muted-foreground mt-0.5">
                Download the Street Smart shortcut to your iPhone.
              </p>
            </div>
          </div>

          <a
            href="/StreetSmart.shortcut"
            download
            onClick={handleDownloadShortcut}
            className={`mt-4 block w-full font-semibold rounded-xl py-3 text-center transition ${
              completedSteps[0]
                ? "bg-primary text-primary-foreground shadow-emergency hover:opacity-90"
                : "bg-secondary text-muted-foreground pointer-events-none"
            }`}
          >
            Download Shortcut
          </a>

          <label
            className={`mt-4 flex items-center gap-3 ${
              !completedSteps[0] ||
              !hasDownloadedShortcut
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={completedSteps[1]}
              disabled={
                !completedSteps[0] ||
                !hasDownloadedShortcut
              }
              onChange={() => toggleStep(1)}
              className="w-4 h-4 accent-primary disabled:opacity-50"
            />

            <span
              className={`text-sm font-medium ${
                !hasDownloadedShortcut
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              I have downloaded the shortcut
            </span>

            {completedSteps[1] && (
              <Check
                className="w-4 h-4 text-success ml-auto"
                strokeWidth={3}
              />
            )}
          </label>

          {!hasDownloadedShortcut &&
            completedSteps[0] && (
              <p className="text-[11px] text-muted-foreground mt-2 ml-7">
                Press "Download Shortcut" before checking this step.
              </p>
            )}
        </div>

        {/* =========================================================
            STEPS 3–6
        ========================================================= */}

        <div className="mt-3 space-y-3">
          {setupSteps.map(
            ({ Icon, title, desc }, index) => {
              /*
               * setupSteps index:
               *
               * index 0 = Step 3
               * index 1 = Step 4
               * index 2 = Step 5
               * index 3 = Step 6
               */

              const stepNumber = index + 3;

              /*
               * completedSteps:
               *
               * [0] = Step 1
               * [1] = Step 2
               * [2] = Step 3
               * [3] = Step 4
               * [4] = Step 5
               * [5] = Step 6
               */

              const completed =
                completedSteps[stepNumber - 1];

              /*
               * A step is locked if the immediately
               * previous step has not been completed.
               */
              const locked =
                !completedSteps[stepNumber - 2];

              return (
                <div
                  key={title}
                  className={`bg-card border border-border rounded-2xl p-4 shadow-card transition-opacity ${
                    locked ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        completed
                          ? "bg-success/15 text-success"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-muted-foreground">
                        STEP {stepNumber}
                      </div>

                      <h3 className="font-semibold text-sm">
                        {title}
                      </h3>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </div>

                  <label
                    className={`mt-4 flex items-center gap-3 ${
                      locked
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={completed}
                      disabled={locked}
                      onChange={() =>
                        toggleStep(stepNumber - 1)
                      }
                      className="w-4 h-4 accent-primary disabled:opacity-50"
                    />

                    <span className="text-sm font-medium">
                      I have completed this step
                    </span>

                    {completed && (
                      <Check
                        className="w-4 h-4 text-success ml-auto"
                        strokeWidth={3}
                      />
                    )}
                  </label>

                  {locked && (
                    <p className="text-[11px] text-muted-foreground mt-2 ml-7">
                      Complete the previous step first.
                    </p>
                  )}
                </div>
              );
            },
          )}
        </div>

        {/* =========================================================
            GENERATE NEW TOKEN
        ========================================================= */}

        <div className="mt-6 bg-card border border-border rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-sm mb-2">
            Shortcut Token
          </h3>

          <p className="text-xs text-muted-foreground mb-4">
            If you believe your token has been exposed, generate a
            new one. Your old token will no longer work.
          </p>

          <button
            type="button"
            onClick={handleGenerateToken}
            disabled={generating}
            className="w-full bg-secondary text-foreground font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                generating ? "animate-spin" : ""
              }`}
            />

            {generating
              ? "Generating..."
              : "Generate New Token"}
          </button>
        </div>

        {/* =========================================================
            HELP
        ========================================================= */}

        <div className="pb-10 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Click{" "}
            <a
              href="https://youtu.be/Dm9Zf1WYQ_A?t=63"
              className="text-xs text-primary font-medium"
            >
              here
            </a>{" "}
            for a step-by-step video tutorial.
          </p>
        </div>
      </div>

      {/* =========================================================
          CONTINUE
      ========================================================= */}

      <div className="px-6 pb-10 space-y-2">
        <Link
          to="/test-shortcut"
          className={`block w-full font-semibold rounded-2xl py-4 text-center transition-transform ${
            allDone
              ? "bg-primary text-primary-foreground shadow-emergency active:scale-[0.98]"
              : "bg-secondary text-muted-foreground opacity-60 pointer-events-none"
          }`}
        >
          Continue
        </Link>

        {!allDone && (
          <p className="text-center text-xs text-muted-foreground">
            Complete all steps to continue
          </p>
        )}
      </div>
    </MobileShell>
  );
}

export default ShortcutSetup;