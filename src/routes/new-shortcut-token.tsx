/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { requireCompletedSetup } from "@/lib/routeGuards";
import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  RefreshCw,
  Settings,
  ChevronRight,
} from "lucide-react";

import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

import {
  getOrCreateShortcutToken,
  regenerateShortcutToken,
  type ShortcutToken,
} from "@/services/shortcutTokenService";

export const Route = createFileRoute("/new-shortcut-token")({
  beforeLoad: requireCompletedSetup,
  component: NewShortcutTokenPage,
});

/* =========================================================
   DEVICE NAME
========================================================= */

function getDeviceName() {
  const userAgent = navigator.userAgent;

  let device = "Desktop";

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    device = "iPhone/iPad";
  } else if (/Android/i.test(userAgent)) {
    device = "Android";
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

/* =========================================================
   PAGE
========================================================= */

function NewShortcutTokenPage() {
  const navigate = useNavigate();

  const [shortcutToken, setShortcutToken] =
    useState<ShortcutToken | null>(null);

  const [loadingToken, setLoadingToken] = useState(true);

  const [generating, setGenerating] = useState(false);

  const [copied, setCopied] = useState(false);

  const [hasGeneratedNewToken, setHasGeneratedNewToken] = useState(false);

  const [hasCopiedToken, setHasCopiedToken] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const deviceName = getDeviceName();

  /* =========================================================
     LOAD CURRENT TOKEN
  ========================================================= */

  useEffect(() => {
    async function loadToken() {
      try {
        const token = await getOrCreateShortcutToken(deviceName);

        setShortcutToken(token);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load your shortcut token.",
        );
      } finally {
        setLoadingToken(false);
      }
    }

    loadToken();
  }, [deviceName]);

  /* =========================================================
     MESSAGE
  ========================================================= */

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }

  /* =========================================================
     GENERATE NEW TOKEN
  ========================================================= */

  async function handleGenerateToken() {
    try {
      setGenerating(true);

      const newToken = await regenerateShortcutToken(deviceName);

      setShortcutToken(newToken);

      setHasGeneratedNewToken(true);

      setHasCopiedToken(false);

      setCopied(false);

      showMessage(
        "New token generated. Copy it and replace the old token in your shortcut.",
      );
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Failed to generate a new token.",
      );
    } finally {
      setGenerating(false);
    }
  }

  /* =========================================================
     COPY TOKEN
  ========================================================= */

  async function handleCopyToken() {
    if (!shortcutToken?.token) {
      showMessage("No shortcut token available.");
      return;
    }

    /*
     * Only allow copying after a new token has been generated.
     *
     * This prevents the user from accidentally copying the
     * old token when they came to this page to replace it.
     */
    if (!hasGeneratedNewToken) {
      showMessage("Generate a new token first.");
      return;
    }

    const token = shortcutToken.token;

    try {
      /*
       * Modern Clipboard API.
       */
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(token);

        setCopied(true);
        setHasCopiedToken(true);

        showMessage("New token copied to clipboard.");

        setTimeout(() => {
          setCopied(false);
        }, 2000);

        return;
      }

      /*
       * Fallback for browsers where Clipboard API
       * is unavailable.
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

      showMessage("New token copied to clipboard.");

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

  /* =========================================================
     RETURN HOME
  ========================================================= */

  function handleDone() {
    if (!hasCopiedToken) {
      showMessage("Copy the new token before leaving.");
      return;
    }

    navigate({ to: "/test-new-shortcut" });
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loadingToken) {
    return (
      <MobileShell>
        <ScreenHeader title="Change Shortcut Token" />

        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-sm text-muted-foreground">
            Loading shortcut token...
          </p>
        </div>
      </MobileShell>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <MobileShell>
      <ScreenHeader title="Change Shortcut Token" />

      <div className="flex-1 px-6 pt-6 pb-8 overflow-y-auto">
        {/* INTRODUCTION */}

        <div>
          <h2 className="text-lg font-bold">Update your shortcut token</h2>

          <p className="text-sm text-muted-foreground mt-2 leading-6">
            If your current token has been exposed or you simply want to
            replace it, generate a new token and update the token inside your
            existing Street Smart shortcut.
          </p>
        </div>

        {/* WARNING */}

        <div className="mt-5 rounded-2xl bg-primary/10 border border-primary/20 p-4">
          <p className="text-xs font-semibold text-primary">
            Important
          </p>

          <p className="text-xs text-muted-foreground mt-1 leading-5">
            Generating a new token immediately invalidates your old token.
            Your existing shortcut will not work again until you replace the
            old token with the new one.
          </p>
        </div>

        {message && (
          <div className="mt-4 rounded-xl bg-secondary p-3">
            <p className="text-xs font-medium text-foreground">
              {message}
            </p>
          </div>
        )}

        {/* =====================================================
            STEP 1 — GENERATE TOKEN
        ===================================================== */}

        <div
          className={`mt-6 bg-card border border-border rounded-2xl p-4 shadow-card ${
            hasGeneratedNewToken ? "border-success/30" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                hasGeneratedNewToken
                  ? "bg-success/15 text-success"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {hasGeneratedNewToken ? (
                <Check className="w-5 h-5" strokeWidth={3} />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="text-[11px] font-semibold text-muted-foreground">
                STEP 1
              </div>

              <h3 className="font-semibold text-sm mt-0.5">
                Generate a New Token
              </h3>

              <p className="text-xs text-muted-foreground mt-1 leading-5">
                This will invalidate your current token and create a new one.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateToken}
            disabled={generating}
            className="mt-4 w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                generating ? "animate-spin" : ""
              }`}
            />

            {generating ? "Generating..." : "Generate New Token"}
          </button>
        </div>

        {/* =====================================================
            STEP 2 — COPY TOKEN
        ===================================================== */}

        <div
          className={`mt-3 bg-card border border-border rounded-2xl p-4 shadow-card transition-opacity ${
            !hasGeneratedNewToken ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                hasCopiedToken
                  ? "bg-success/15 text-success"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {hasCopiedToken ? (
                <Check className="w-5 h-5" strokeWidth={3} />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="text-[11px] font-semibold text-muted-foreground">
                STEP 2
              </div>

              <h3 className="font-semibold text-sm mt-0.5">
                Copy Your New Token
              </h3>

              <p className="text-xs text-muted-foreground mt-1 leading-5">
                Copy this token so you can replace the old one in your
                downloaded shortcut.
              </p>
            </div>
          </div>

          {hasGeneratedNewToken && shortcutToken?.token && (
            <>
              <div className="mt-4 bg-secondary rounded-xl p-3">
                <p className="text-[11px] text-muted-foreground mb-1">
                  NEW TOKEN
                </p>

                <p className="text-sm font-mono font-medium break-all">
                  {shortcutToken.token}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyToken}
                disabled={!hasGeneratedNewToken}
                className="mt-3 w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy New Token
                  </>
                )}
              </button>

              {!hasCopiedToken && (
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Press "Copy New Token" before continuing.
                </p>
              )}
            </>
          )}

          {!hasGeneratedNewToken && (
            <p className="text-[11px] text-muted-foreground mt-4 ml-14">
              Generate a new token first.
            </p>
          )}
        </div>

        {/* =====================================================
            STEP 3 — UPDATE SHORTCUT
        ===================================================== */}

        <div
          className={`mt-3 bg-card border border-border rounded-2xl p-4 shadow-card transition-opacity ${
            !hasCopiedToken ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                hasCopiedToken
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <Settings className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="text-[11px] font-semibold text-muted-foreground">
                STEP 3
              </div>

              <h3 className="font-semibold text-sm mt-0.5">
                Replace the Token in Your Shortcut
              </h3>

              <p className="text-xs text-muted-foreground mt-1 leading-5">
                Open the Street Smart shortcut you already downloaded and
                replace the old token with the new token you just copied.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                1
              </div>

              <p className="text-xs text-muted-foreground leading-5">
                Open the <span className="font-semibold text-foreground">
                  Shortcuts
                </span>{" "}
                app on your iPhone.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                2
              </div>

              <p className="text-xs text-muted-foreground leading-5">
                Find your existing{" "}
                <span className="font-semibold text-foreground">
                  Street Smart
                </span>{" "}
                shortcut and open it for editing.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                3
              </div>

              <p className="text-xs text-muted-foreground leading-5">
                Find the old Street Smart token inside the shortcut and
                replace it with the new token you copied.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                4
              </div>

              <p className="text-xs text-muted-foreground leading-5">
                Save the shortcut and test it to make sure the new token
                works.
              </p>
            </div>
          </div>
        </div>

        {/* SECURITY NOTICE */}

        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <p className="text-xs font-semibold text-foreground">
            Keep your token private
          </p>

          <p className="text-[11px] text-muted-foreground mt-1 leading-5">
            Do not share your token with anyone. If you believe the new token
            has also been exposed, generate another one.
          </p>
        </div>

        {/* DONE */}

        <div className="mt-6 pb-8">
          <button
            type="button"
            onClick={handleDone}
            disabled={!hasCopiedToken}
            className={`w-full font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 transition ${
              hasCopiedToken
                ? "bg-primary text-primary-foreground shadow-emergency active:scale-[0.98]"
                : "bg-secondary text-muted-foreground opacity-60 cursor-not-allowed"
            }`}
          >
            I've Updated My Shortcut
            <ChevronRight className="w-5 h-5" />
          </button>

          {!hasCopiedToken && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              Generate and copy your new token first.
            </p>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

export default NewShortcutTokenPage;