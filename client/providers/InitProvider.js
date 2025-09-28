"use client";

import useWallet from "@/hooks/useWallet";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { path as tauriPath } from "@tauri-apps/api";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";

export default function InitProvider({ children }) {
  const { checkWallet } = useWallet();

  async function connectToPico(modelPath) {
    const res = await invoke("connect", { "modelPath": modelPath });
  }

  // Deep linking
  const [deepLinkUrl, setDeepLinkUrl] = useState(null);
  useEffect(() => {
    let unlisten;

    const processUrl = (url) => {
      console.log('Received deep link:', url);

      setDeepLinkUrl(url);

      (async () => {
        const appDataPath = await tauriPath.appDataDir();

        await connectToPico(`${appDataPath}/google_gemma-3n-E2B-it-Q4_K_M.gguf`);
        // await connectToPico(`${appDataPath}/gemma-3-1b-it-q4_0.gguf`);
        checkWallet();
      })();
    };

    getCurrent()
      .then((url) => {
        if (url) {
          processUrl(url);
        }
      })
      .catch((err) => {
        console.error("Error getting current deep link:", err);
      });

    onOpenUrl((url) => {
      processUrl(url);
    }).then(fn => {
        unlisten = fn;
    }).catch((err) => {
        console.error("Error setting up deep link listener:", err);
    });

    return () => {
      if (unlisten) {
        unlisten();
      }
    };

  }, []);

  return <>{children}</>;
}
