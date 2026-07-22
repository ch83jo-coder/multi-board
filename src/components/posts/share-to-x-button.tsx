"use client";

import { buttonStyles } from "@/components/ui/button";

type Props = {
  title: string;
  url: string;
};

export function ShareToXButton({ title, url }: Props) {
  const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  const share = async () => {
    // モバイルでは x.com のインテント URL がアプリの Web ログイン画面に遷移してしまうため、
    // OS の共有シートを開いてアプリを選択し、ログイン済みのアプリから直接投稿できるようにする。
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ text: title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={share}
      className={buttonStyles({ variant: "ghost" })}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-current"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
      Xで共有
    </button>
  );
}
