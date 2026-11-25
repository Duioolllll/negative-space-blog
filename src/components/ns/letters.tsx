import { useId, useState, type FormEvent } from "react";
import { subscribe } from "../../lib/api/subscribe.functions";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; already: boolean }
  | { kind: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Letters() {
  const inputId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus({ kind: "error", message: "이메일 주소를 다시 확인해 주세요." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await subscribe({ data: { email: value } });
      if (!res.ok) {
        setStatus({ kind: "error", message: "지금은 구독을 받을 수 없어요. 잠시 뒤에 다시 시도해 주세요." });
        return;
      }
      setStatus({ kind: "done", already: res.already });
    } catch {
      setStatus({ kind: "error", message: "전송에 실패했어요. 연결을 확인하고 다시 시도해 주세요." });
    }
  };

  const invalid = status.kind === "error";

  return (
    <section id="letters" className="ns-letters px-5 pb-24 md:px-10 md:pb-36" aria-labelledby="letters-title">
      <div className="border border-ink p-6 md:grid md:grid-cols-12 md:gap-8 md:p-14">
        <div className="md:col-span-6">
          <h2 id="letters-title" className="text-4xl leading-[1.1] tracking-tight md:text-5xl">
            새 글이 현상되면 알려드릴게요
          </h2>
          <p className="mt-5 max-w-[28rem] text-base leading-relaxed text-mid">
            한 달에 두 번쯤, 새로 쓴 글 한 편과 짧은 메모를 보냅니다. 광고는 없어요.
          </p>
        </div>
        <div className="mt-10 md:col-span-5 md:col-start-8 md:mt-0 md:self-end">
          {status.kind === "done" ? (
            <div className="ns-receipt border-t border-ink pt-5" role="status">
              <p className="ns-mono text-xs text-safelight">RECEIVED</p>
              <p className="mt-2 text-xl leading-snug">
                {status.already ? "이미 구독 중인 주소예요. 다음 글에서 만나요." : "구독해 주셔서 고마워요. 다음 글에서 만나요."}
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
              <label htmlFor={inputId} className="text-sm text-graphite">이메일</label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                <input
                  id={inputId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.kind === "error") setStatus({ kind: "idle" });
                  }}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                  placeholder="you@example.com"
                  className="ns-input min-w-0 flex-1 border-b border-ink bg-transparent px-0 py-3 text-lg outline-none placeholder:text-mid"
                />
                <StampButton busy={status.kind === "sending"} />
              </div>
              {invalid && (
                <p id={errorId} className="text-sm text-safelight" role="alert">
                  {status.message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function StampButton({ busy }: { busy: boolean }) {
  return (
    <button type="submit" disabled={busy} className="ns-stamp relative shrink-0 px-6 py-3 text-base">
      <span className="ns-stamp-ink" aria-hidden="true" />
      <span className="relative">{busy ? "보내는 중" : "구독하기"}</span>
    </button>
  );
}
